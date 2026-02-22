// All Wise calls go through Supabase Edge Function — API key never touches browser
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const edgeFn = async (fnName: string, body: Record<string, unknown>) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return res.json();
};

// ── Get a price quote (calls calculate-price Edge Function) ──
export const createWiseQuote = async (amount: number) => {
  // For display purposes only — actual price comes from calculate-price Edge Fn
  return {
    sourceAmount: amount,
    sourceCurrency: 'GBP',
    exchangeRate: 1,
    fee: Math.round(amount * 0.005 * 100) / 100,
    targetAmount: Math.round(amount * 0.995 * 100) / 100,
    targetCurrency: 'GBP',
  };
};

// ── Initiate payment via Edge Function ───────────────────────
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

// ── Verify payment via Edge Function ────────────────────────
export const verifyPayment = async (txRef: string) => {
  const result = await edgeFn('verify-payment', { action: 'verify', txRef });
  if (result.error) return { success: false, error: result.error };
  return { success: result.success, status: result.status, paymentId: result.paymentId };
};

// ── Calculate price via Edge Function ────────────────────────
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

// ── Admin: update assignment status ─────────────────────────
export const adminUpdateStatus = async (assignmentId: string, status: string, paymentAmount?: number, notes?: string) => {
  const result = await edgeFn('admin-update-status', { assignmentId, status, paymentAmount, notes });
  if (result.error) return { success: false, error: result.error };
  return { success: true, assignment: result.assignment };
};
