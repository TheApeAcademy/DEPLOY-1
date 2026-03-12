// All Wise calls go through Supabase Edge Function — API key never touches browser
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

export const createWiseQuote = async (amount: number) => {
  return {
    sourceAmount: amount,
    sourceCurrency: 'GBP',
    exchangeRate: 1,
    fee: Math.round(amount * 0.005 * 100) / 100,
    targetAmount: Math.round(amount * 0.995 * 100) / 100,
    targetCurrency: 'GBP',
  };
};

export const initiatePayment = async (assignmentId: string, amount: number) => {
  const result = await edgeFn('verify-payment', {
    action: 'initiate',
    assignmentId,
    amount,
    currency: 'GBP',
    redirectOrigin: window.location.origin,
  });
  if (result.error) return { success: false, error: result.error };
  return { success: true, paymentId: result.paymentId, txRef: result.txRef, checkoutUrl: result.checkoutUrl };
};

export const verifyPayment = async (txRef: string) => {
  const result = await edgeFn('verify-payment', { action: 'verify', txRef });
  if (result.error) return { success: false, error: result.error };
  return { success: result.success, status: result.status, paymentId: result.paymentId };
};

export const calculatePrice = async (params: {
  assignmentType: string;
  description?: string;
  dueDate?: string;
  schoolLevel?: string;
}) => {
  const result = await edgeFn('calculate-price', params);
  if (result.error) return null;
  return result as { price: number; complexity: string; estimatedHours: number; urgency: string; inScope: boolean; reason?: string; currency: string };
};

export const adminUpdateStatus = async (assignmentId: string, status: string, paymentAmount?: number, notes?: string) => {
  const result = await edgeFn('admin-update-status', { assignmentId, status, paymentAmount, notes });
  if (result.error) return { success: false, error: result.error };
  return { success: true, assignment: result.assignment };
};
