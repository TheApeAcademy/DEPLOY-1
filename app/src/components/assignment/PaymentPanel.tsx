import { useState, useEffect } from 'react';
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

const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY as string;

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
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if ((window as any).FlutterwaveCheckout) { setSdkReady(true); return; }
    const existing = document.getElementById('flutterwave-sdk');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'flutterwave-sdk';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        if ((window as any).FlutterwaveCheckout) {
          setSdkReady(true);
        } else {
          setError('Payment system failed to initialise. Please refresh.');
        }
      }, 800);
    };
    script.onerror = () => {
      setError('Payment system failed to load. Please refresh the page.');
    };
    document.head.appendChild(script);
  }, []);

  const handlePay = () => {
    if (!assignment.paymentAmount) { toast.error('No payment amount set'); return; }
    const flw = (window as any).FlutterwaveCheckout;
    if (!flw) { toast.error('Payment system not ready. Please refresh the page.'); return; }

    const ref = generateTxRef();
    setTxRef(ref);
    setIsLoading(true);

    flw({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: ref,
      amount: assignment.paymentAmount,
      currency: 'GBP',
      payment_options: 'card',
      customer: {
        email: user.email,
        name: user.name,
      },
      customizations: {
        title: 'ApeAcademy',
        description: `Payment for ${assignment.assignmentType || 'Assignment'} — ${assignment.courseName}`,
        logo: 'https://deploy-1-p1ke.vercel.app/favicon.svg',
      },
      callback: async (response: any) => {
        setIsLoading(false);
        if (response.status === 'successful') {
          setStep('verifying');
          const { success, error: recErr } = await recordPayment(
            assignment.id,
            ref,
            String(response.transaction_id),
            assignment.paymentAmount!,
          );
          if (success) {
            await logActivity({
              type: 'payment_completed',
              userId: user.id,
              userName: user.name,
              assignmentId: assignment.id,
              description: `Payment of £${assignment.paymentAmount} completed. Ref: ${ref}`,
            });
            setStep('success');
            onPaymentComplete({
              id: ref,
              assignmentId: assignment.id,
              userId: user.id,
              amount: assignment.paymentAmount!,
              currency: 'GBP',
              status: 'completed',
              provider: 'wise',
              createdAt: new Date().toISOString(),
            });
          } else {
            setError(recErr || 'Payment received but failed to record. Contact support with ref: ' + ref);
            setStep('error');
          }
        } else {
          setError('Payment was not completed. Please try again.');
          setStep('error');
          onPaymentFailed('Payment not completed');
        }
      },
      onclose: () => {
        setIsLoading(false);
      },
    });
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
              <Button
                onClick={handlePay}
                disabled={isLoading || !sdkReady}
                className="h-12 px-8 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}
              >
                {isLoading
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <span className="flex items-center gap-2">Pay £{assignment.paymentAmount?.toFixed(2)} <ArrowRight className="h-5 w-5" /></span>
                }
              </Button>
              {!sdkReady && <p className="text-xs text-gray-400 mt-3">Loading payment system...</p>}
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
