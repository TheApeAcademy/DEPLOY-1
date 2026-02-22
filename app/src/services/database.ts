import { supabase } from '@/lib/supabase';
import type { Assignment, Payment, ActivityLog, DashboardStats, User } from '@/types';

// ══════════════════════════════════════════════
// ASSIGNMENTS
// ══════════════════════════════════════════════

export const createAssignment = async (
  assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: Assignment | null; error: string | null }> => {
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      user_id: assignment.userId,
      user_name: assignment.userName,
      user_email: assignment.userEmail,
      assignment_type: assignment.assignmentType,
      course_name: assignment.courseName,
      class_name: assignment.className,
      teacher_name: assignment.teacherName,
      due_date: assignment.dueDate,
      platform: assignment.platform,
      platform_contact: assignment.platformContact,
      description: assignment.description,
      files: assignment.files,
      status: assignment.status,
      payment_amount: assignment.paymentAmount,
      complexity: assignment.analysis?.complexity,
      estimated_hours: assignment.analysis?.estimatedHours,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapAssignment(data), error: null };
};

export const updateAssignmentStatus = async (
  id: string,
  updates: Partial<{
    status: string;
    payment_amount: number;
    payment_id: string;
    complexity: string;
    estimated_hours: number;
  }>
): Promise<{ error: string | null }> => {
  const { error } = await supabase
    .from('assignments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  return { error: error?.message ?? null };
};

export const getAssignment = async (id: string): Promise<Assignment | null> => {
  const { data } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', id)
    .single();

  return data ? mapAssignment(data) : null;
};

export const getUserAssignments = async (userId: string): Promise<Assignment[]> => {
  const { data } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (data || []).map(mapAssignment);
};

export const getAllAssignments = async (filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Assignment[]; count: number }> => {
  let query = supabase
    .from('assignments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.search) {
    query = query.or(
      `course_name.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`
    );
  }
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);

  const { data, count } = await query;
  return { data: (data || []).map(mapAssignment), count: count || 0 };
};

// ══════════════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════════════

export const createPayment = async (payment: {
  assignmentId: string;
  userId: string;
  amount: number;
  currency: string;
  transactionReference: string;
  wisePayInId?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ data: Payment | null; error: string | null }> => {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      assignment_id: payment.assignmentId,
      user_id: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      status: 'pending',
      provider: 'wise',
      transaction_reference: payment.transactionReference,
      wise_pay_in_id: payment.wisePayInId,
      metadata: payment.metadata,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapPayment(data), error: null };
};

export const updatePayment = async (
  id: string,
  updates: Partial<{
    status: string;
    wise_pay_in_id: string;
    provider_transaction_id: string;
    completed_at: string;
  }>
): Promise<{ error: string | null }> => {
  const { error } = await supabase.from('payments').update(updates).eq('id', id);
  return { error: error?.message ?? null };
};

export const getPaymentByReference = async (txRef: string): Promise<Payment | null> => {
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('transaction_reference', txRef)
    .single();

  return data ? mapPayment(data) : null;
};

export const getAllPayments = async (filters?: {
  status?: string;
  limit?: number;
}): Promise<Payment[]> => {
  let query = supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return (data || []).map(mapPayment);
};

// ══════════════════════════════════════════════
// ACTIVITY LOGS
// ══════════════════════════════════════════════

export const logActivity = async (log: {
  type: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  assignmentId?: string;
  paymentId?: string;
  description: string;
}): Promise<void> => {
  await supabase.from('activity_logs').insert({
    type: log.type,
    user_id: log.userId,
    user_name: log.userName,
    user_email: log.userEmail,
    assignment_id: log.assignmentId,
    payment_id: log.paymentId,
    description: log.description,
  });
};

export const getActivityLogs = async (limit = 100): Promise<ActivityLog[]> => {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  return (data || []).map((row: any) => ({
    id: row.id,
    type: row.type,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    assignmentId: row.assignment_id,
    paymentId: row.payment_id,
    description: row.description,
    timestamp: row.timestamp,
  }));
};

// ══════════════════════════════════════════════
// USERS (admin only)
// ══════════════════════════════════════════════

export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    region: p.region,
    country: p.country,
    schoolLevel: p.school_level,
    department: p.department,
    createdAt: p.created_at,
    lastLogin: p.last_login,
  }));
};

// ══════════════════════════════════════════════
// DASHBOARD STATS (admin only)
// ══════════════════════════════════════════════

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date().toISOString().split('T')[0];

  const [usersRes, assignmentsRes, paymentsRes, todayUsersRes, todayAssignmentsRes, todayRevenueRes] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('assignments').select('id, status', { count: 'exact' }),
      supabase.from('payments').select('amount, status'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('assignments').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('payments').select('amount').eq('status', 'completed').gte('created_at', today),
    ]);

  const assignments = assignmentsRes.data || [];
  const payments = paymentsRes.data || [];
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const revenueToday = (todayRevenueRes.data || []).reduce((s: number, p: any) => s + p.amount, 0);

  return {
    totalUsers: usersRes.count || 0,
    totalAssignments: assignmentsRes.count || 0,
    totalRevenue,
    pendingAssignments: assignments.filter(a => a.status === 'pending').length,
    analyzingAssignments: assignments.filter(a => a.status === 'analyzing').length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    newUsersToday: todayUsersRes.count || 0,
    assignmentsToday: todayAssignmentsRes.count || 0,
    revenueToday,
  };
};

// ══════════════════════════════════════════════
// MAPPERS
// ══════════════════════════════════════════════

const mapAssignment = (row: any): Assignment => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userEmail: row.user_email,
  assignmentType: row.assignment_type,
  courseName: row.course_name,
  className: row.class_name,
  teacherName: row.teacher_name,
  dueDate: row.due_date,
  platform: row.platform,
  platformContact: row.platform_contact,
  description: row.description,
  files: typeof row.files === 'string' ? JSON.parse(row.files) : row.files || [],
  status: row.status,
  paymentAmount: row.payment_amount,
  paymentId: row.payment_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapPayment = (row: any): Payment => ({
  id: row.id,
  assignmentId: row.assignment_id,
  userId: row.user_id,
  amount: row.amount,
  currency: row.currency,
  status: row.status,
  provider: row.provider,
  providerTransactionId: row.provider_transaction_id,
  createdAt: row.created_at,
  completedAt: row.completed_at,
  metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined,
});
