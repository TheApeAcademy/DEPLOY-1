import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle, XCircle, Shield, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Payment, Assignment } from '@/types';
import { generateTxRef, recordPayment } from '@/services/payment';
import { logActivity } from '@/services/database';
import { fadeInUp } from '@/data/constants';

const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY || 'FLWPUBK-573134e5b4849c518275b425abbfeb71-X';

interface PaymentPanelProps {
  assignment: Assignment;
  user: { id: string; name: string; email: string };
  onPaymentComplete: (payment: Payment) => void;
  onPaymentFailed: (error: string) => void;
}

export function PaymentPanel({ assignment, user, onPaymentComplete, onPaymentFailed }: PaymentPanelProps) {
  const [step, setStep] = useState<'ready' | 'verifying' | 'success' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    if (!assignment.paymentAmount) { toast.error('No payment amount set'); return; }
    setIsLoading(true);

    const ref = generateTxRef();
    setTxRef(ref);

    localStorage.setItem('flw_pending_ref', ref);
    localStorage.setItem('flw_pending_assignment', assignment.id);
    localStorage.setItem('flw_pending_amount', String(assignment.paymentAmount));

    const params = new URLSearchParams({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: ref,
      amount: String(assignment.paymentAmount),
      currency: 'GBP',
      redirect_url: window.location.origin + '?flw_return=1',
      customer_email: user.email,
      customer_name: user.name,
      customization_title: 'ApeAcademy',
      customization_description: `Payment for ${assignment.assignmentType || 'Assignment'} — ${assignment.courseName}`,
    });

    window.location.href = `https://checkout.flutterwave.com/v3/hosted/pay?${params.toString()}`;
  };

  const handleRetry = () => {
    setStep('ready');
    setError(null);
    setTxRef(null);
    setIsLoading(false);
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">

          {step === 'ready' && (
            <motion.div key="ready" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' }}>
                <span className="text-4xl">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Pay</h3>
              <p className="text-gray-500 text-sm mb-3">Reviewed and priced by our team</p>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                £{assignment.paymentAmount?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-gray-400 mb-6">British Pounds (GBP)</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Secured by Flutterwave — bank-level encryption</span>
              </div>
              <Button onClick={handlePay} disabled={isLoading}
                className="h-12 px-8 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                {isLoading
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <span className="flex items-center gap-2">Pay £{assignment.paymentAmount?.toFixed(2)} <ArrowRight className="h-5 w-5" /></span>
                }
              </Button>
            </motion.div>
          )}

          {step === 'verifying' && (
            <motion.div key="verifying" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirming Payment...</h3>
              <p className="text-sm text-gray-500">Just a moment while we confirm your payment.</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Confirmed!</h3>
              <p className="text-gray-600 mb-4">£{assignment.paymentAmount?.toFixed(2)} received. Your assignment is now in progress.</p>
              <div className="p-4 rounded-xl bg-gray-50 max-w-xs mx-auto text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-xs">{txRef?.slice(-12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge className="bg-emerald-500 text-white">Paid</Badge>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">{error}</p>
              <Button onClick={handleRetry} variant="outline" className="rounded-xl">
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
