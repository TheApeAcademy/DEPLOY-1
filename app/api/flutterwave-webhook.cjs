const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const hash = req.headers['verif-hash'];
  if (!hash || hash !== process.env.FLW_WEBHOOK_HASH) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.completed' && event.data.status === 'successful') {
    const { tx_ref, amount, currency, customer } = event.data;

    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_email', customer.email)
      .in('status', ['analyzed', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (assignments && assignments.length > 0) {
      const assignment = assignments[0];
      await supabase
        .from('assignments')
        .update({
          status: 'submitted',
          payment_amount: amount,
          payment_id: tx_ref,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignment.id);

      await supabase.from('activity_logs').insert({
        type: 'payment_completed',
        user_id: assignment.user_id,
        user_name: assignment.user_name,
        assignment_id: assignment.id,
        description: `Auto-verified payment of ${currency} ${amount}. Ref: ${tx_ref}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return res.status(200).json({ received: true });
};
