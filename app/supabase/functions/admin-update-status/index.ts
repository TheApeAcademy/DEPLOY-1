// supabase/functions/admin-update-status/index.ts
// Only callable by users with role = 'admin' in profiles table
// Handles: mark complete, mark rejected, set payment amount override

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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });

    // Verify user is admin — DB is the source of truth, not frontend
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), { status: 403, headers: cors });
    }

    const { assignmentId, status, paymentAmount, notes } = await req.json();

    if (!assignmentId || !status) {
      return new Response(JSON.stringify({ error: 'assignmentId and status required' }), { status: 400, headers: cors });
    }

    const validStatuses = ['pending', 'analyzing', 'analyzed', 'paid', 'submitted', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }), { status: 400, headers: cors });
    }

    // Update assignment
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (paymentAmount !== undefined) updates.payment_amount = paymentAmount;

    const { data: assignment, error: updateError } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: cors });

    // Log the admin action
    await supabase.from('activity_logs').insert({
      type: 'admin_action',
      user_id: user.id,
      assignment_id: assignmentId,
      description: `Admin updated assignment ${assignmentId} → ${status}${paymentAmount ? `. Price set to £${paymentAmount}` : ''}${notes ? `. Notes: ${notes}` : ''}`,
    });

    return new Response(JSON.stringify({ success: true, assignment }), { headers: cors });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: cors });
  }
});
