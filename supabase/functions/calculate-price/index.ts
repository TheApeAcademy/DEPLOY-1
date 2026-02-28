// supabase/functions/calculate-price/index.ts
// Called by frontend after assignment form is submitted
// Reads pricing_rules table in Supabase — you control prices from the dashboard
// Returns: { price, complexity, estimatedHours, inScope, reason }

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
    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });

    const { assignmentType, description, dueDate, schoolLevel } = await req.json();

    // ── Load pricing rules from DB ────────────────────────────────
    // You manage these from Supabase dashboard — no code changes needed
    const { data: rules } = await supabase
      .from('pricing_rules')
      .select('*')
      .order('created_at', { ascending: false });

    // ── Scope check ───────────────────────────────────────────────
    const outOfScopeKeywords = ['take exam', 'take test', 'cheat', 'plagiarize', 'hack', 'illegal'];
    const descLower = (description || '').toLowerCase();
    const outOfScope = outOfScopeKeywords.some(kw => descLower.includes(kw));

    if (outOfScope) {
      return new Response(JSON.stringify({
        inScope: false,
        reason: 'Assignment contains prohibited content',
        price: 0, complexity: 'low', estimatedHours: 0,
      }), { headers: cors });
    }

    // ── Determine complexity ──────────────────────────────────────
    const highTypes = ['Thesis', 'Dissertation', 'Research Paper'];
    const medTypes = ['Project', 'Case Study', 'Lab Report', 'Presentation'];
    const highWords = ['research', 'analysis', 'comprehensive', 'detailed', 'complex', 'advanced'];
    const lowWords = ['simple', 'basic', 'short', 'brief', 'summary'];

    let complexity: 'low' | 'medium' | 'high' = 'medium';
    if (highTypes.includes(assignmentType)) complexity = 'high';
    else if (medTypes.includes(assignmentType)) complexity = 'medium';
    else if (lowWords.some(w => descLower.includes(w))) complexity = 'low';
    else if (highWords.some(w => descLower.includes(w))) complexity = 'high';

    // ── Urgency from due date ─────────────────────────────────────
    const daysUntilDue = dueDate
      ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 7;

    const urgency: 'normal' | 'urgent' | 'express' =
      daysUntilDue <= 1 ? 'express' : daysUntilDue <= 3 ? 'urgent' : 'normal';

    // ── Hours estimate ────────────────────────────────────────────
    const baseHours: Record<string, number> = {
      low: 2, medium: 5, high: 10,
    };
    const typeMultipliers: Record<string, number> = {
      Essay: 1, 'Research Paper': 2, Project: 1.5, Homework: 0.5,
      'Lab Report': 1.2, Presentation: 0.8, 'Case Study': 1.5,
      Thesis: 3, Dissertation: 4, Other: 1,
    };
    const estimatedHours = Math.round(
      baseHours[complexity] * (typeMultipliers[assignmentType] || 1)
    );

    // ── Price from DB rules or fallback rates ─────────────────────
    let baseRate = 15; // £/hour fallback
    if (rules && rules.length > 0) {
      const rule = rules.find((r: any) =>
        r.complexity === complexity && (r.assignment_type === assignmentType || r.assignment_type === 'default')
      ) || rules.find((r: any) => r.complexity === complexity);
      if (rule) baseRate = rule.hourly_rate;
    } else {
      const rates: Record<string, number> = { low: 12, medium: 20, high: 35 };
      baseRate = rates[complexity];
    }

    const urgencyMultipliers = { normal: 1, urgent: 1.4, express: 1.8 };
    const schoolMultipliers: Record<string, number> = {
      Primary: 0.7, Middle: 0.8, High: 1.0, University: 1.3,
    };

    const price = Math.round(
      baseRate *
      estimatedHours *
      urgencyMultipliers[urgency] *
      (schoolMultipliers[schoolLevel] || 1.0) *
      100
    ) / 100;

    return new Response(JSON.stringify({
      inScope: true,
      price,
      complexity,
      estimatedHours,
      urgency,
      daysUntilDue,
      currency: 'GBP',
    }), { headers: cors });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: cors });
  }
});
