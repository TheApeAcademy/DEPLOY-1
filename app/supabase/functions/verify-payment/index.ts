// supabase/functions/verify-payment/index.ts
// Handles BOTH payment initiation and verification
// Wise API key stays server-side — never exposed to browser

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });

    const WISE_TOKEN = Deno.env.get('WISE_API_KEY');
    const WISE_PROFILE_ID = Deno.env.get('WISE_PROFILE_ID');
    const WISE_SANDBOX = Deno.env.get('WISE_SANDBOX') === 'true';
    const WISE_BASE = WISE_SANDBOX
      ? 'https://api.sandbox.transferwise.tech'
      : 'https://api.transferwise.com';

    const body = await req.json();
    const action = body.action as 'initiate' | 'verify';

    // ── INITIATE: Create Wise Pay-in Link ─────────────────────────
    if (action === 'initiate') {
      const { assignmentId, amount, currency = 'GBP', redirectOrigin } = body;

      const { data: assignment } = await supabase
        .from('assignments').select('id, user_id').eq('id', assignmentId).single();

      if (!assignment || assignment.user_id !== user.id)
        return new Response(JSON.stringify({ error: 'Assignment not found' }), { status: 404, headers: cors });

      const txRef = `APE-${user.id.slice(0,8)}-${assignmentId.slice(0,8)}-${Date.now()}`;
      let checkoutUrl: string | null = null;
      let wisePayInId: string | null = null;

      if (WISE_TOKEN && WISE_PROFILE_ID) {
        const { data: profile } = await supabase.from('profiles').select('name, email').eq('id', user.id).single();
        const wiseRes = await fetch(`${WISE_BASE}/v3/profiles/${WISE_PROFILE_ID}/pay-in-links`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${WISE_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: { value: amount, currency },
            reference: txRef,
            redirectUrl: `${redirectOrigin || 'https://apeacademy.vercel.app'}?tx_ref=${txRef}`,
            customer: { email: profile?.email, name: profile?.name },
          }),
        });
        if (wiseRes.ok) {
          const d = await wiseRes.json();
          checkoutUrl = d.url;
          wisePayInId = d.id;
        }
      }

      const { data: payment, error: payError } = await supabase.from('payments').insert({
        assignment_id: assignmentId, user_id: user.id, amount, currency,
        status: 'pending', provider: 'wise',
        transaction_reference: txRef, wise_pay_in_id: wisePayInId,
        metadata: { checkoutUrl },
      }).select().single();

      if (payError) return new Response(JSON.stringify({ error: payError.message }), { status: 500, headers: cors });

      await supabase.from('activity_logs').insert({
        type: 'payment_initiated', user_id: user.id,
        assignment_id: assignmentId, payment_id: payment.id,
        description: `Payment initiated. £${amount}. Wise: ${wisePayInId || 'pending API key'}`,
      });

      return new Response(JSON.stringify({ success: true, paymentId: payment.id, txRef, checkoutUrl }), { headers: cors });
    }

    // ── VERIFY: Check Wise payment status ─────────────────────────
    if (action === 'verify') {
      const { txRef } = body;
      if (!txRef) return new Response(JSON.stringify({ error: 'txRef required' }), { status: 400, headers: cors });

      const { data: payment } = await supabase.from('payments').select('*').eq('transaction_reference', txRef).single();
      if (!payment) return new Response(JSON.stringify({ error: 'Payment not found' }), { status: 404, headers: cors });
      if (payment.user_id !== user.id) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: cors });
      if (payment.status === 'completed') return new Response(JSON.stringify({ success: true, status: 'completed' }), { headers: cors });

      let newStatus = payment.status;

      if (payment.wise_pay_in_id && WISE_TOKEN && WISE_PROFILE_ID) {
        const wiseRes = await fetch(
          `${WISE_BASE}/v3/profiles/${WISE_PROFILE_ID}/pay-in-links/${payment.wise_pay_in_id}`,
          { headers: { Authorization: `Bearer ${WISE_TOKEN}` } }
        );
        if (wiseRes.ok) {
          const d = await wiseRes.json();
          newStatus = d.status === 'COMPLETED' ? 'completed'
            : (d.status === 'FAILED' || d.status === 'EXPIRED') ? 'failed' : 'pending';
        }
      }

      if (newStatus !== payment.status) {
        await supabase.from('payments').update({
          status: newStatus,
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString(), provider_transaction_id: payment.wise_pay_in_id } : {}),
        }).eq('id', payment.id);

        if (newStatus === 'completed') {
          await supabase.from('assignments').update({ status: 'submitted', payment_id: payment.id, updated_at: new Date().toISOString() }).eq('id', payment.assignment_id);
          await supabase.from('activity_logs').insert({
            type: 'payment_completed', user_id: user.id,
            assignment_id: payment.assignment_id, payment_id: payment.id,
            description: `Payment verified. £${payment.amount}`,
          });
        }
      }

      return new Response(JSON.stringify({ success: newStatus === 'completed', status: newStatus, paymentId: payment.id }), { headers: cors });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: cors });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: cors });
  }
});
