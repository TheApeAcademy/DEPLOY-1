import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const edgeFn = async (fnName: string, body: Record<string, unknown>) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const generateTxRef = () => {
  return `APE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

export const verifyFlutterwavePayment = async (transactionId: string, expectedAmount: number) => {
  try {
    const result = await edgeFn('verify-payment', {
      action: 'verify_flutterwave',
      transactionId,
      expectedAmount,
    });
    if (result.error) return { success: false, error: result.error };
    return { success: true, status: result.status };
  } catch {
    return { success: false, error: 'Verification failed' };
  }
};

export const recordPayment = async (
  assignmentId: string,
  txRef: string,
  transactionId: string,
  amount: number,
) => {
  const { error } = await supabase
    .from('assignments')
    .update({
      status: 'paid',
      payment_id: txRef,
      payment_amount: amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId);

  return { success: !error, error: error?.message };
};

export const adminUpdateStatus = async (
  assignmentId: string,
  status: string,
  paymentAmount?: number,
  notes?: string,
) => {
  const result = await edgeFn('admin-update-status', { assignmentId, status, paymentAmount, notes });
  if (result.error) return { success: false, error: result.error };
  return { success: true, assignment: result.assignment };
};

export const calculatePrice = async (params: {
  assignmentType: string;
  description?: string;
  dueDate?: string;
  schoolLevel?: string;
}) => {
  const result = await edgeFn('calculate-price', params);
  if (result.error) return null;
  return result as {
    price: number;
    complexity: string;
    estimatedHours: number;
    urgency: string;
    inScope: boolean;
    reason?: string;
    currency: string;
  };
};
