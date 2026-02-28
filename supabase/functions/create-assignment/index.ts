// supabase/functions/create-assignment/index.ts
// Saves assignment to DB server-side after price is calculated
// Ensures user can only create assignments for themselves

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

    const body = await req.json();
    const {
      assignmentType, courseName, className, teacherName,
      dueDate, platform, platformContact, description, files,
      paymentAmount, complexity, estimatedHours,
    } = body;

    // Get user profile
    const { data: profile } = await supabase.from('profiles').select('name, email').eq('id', user.id).single();

    // Insert assignment
    const { data: assignment, error: insertError } = await supabase
      .from('assignments')
      .insert({
        user_id: user.id,
        user_name: profile?.name,
        user_email: profile?.email,
        assignment_type: assignmentType,
        course_name: courseName,
        class_name: className,
        teacher_name: teacherName,
        due_date: dueDate,
        platform,
        platform_contact: platformContact,
        description,
        files: files || [],
        status: 'pending',
        payment_amount: paymentAmount,
        complexity,
        estimated_hours: estimatedHours,
      })
      .select()
      .single();

    if (insertError || !assignment) {
      return new Response(JSON.stringify({ error: insertError?.message || 'Failed to create assignment' }), { status: 500, headers: cors });
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      type: 'assignment_created',
      user_id: user.id,
      user_name: profile?.name,
      user_email: profile?.email,
      assignment_id: assignment.id,
      description: `Assignment created: ${courseName} — ${assignmentType}. Price: £${paymentAmount}`,
    });

    return new Response(JSON.stringify({ success: true, assignment }), { headers: cors });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: cors });
  }
});
