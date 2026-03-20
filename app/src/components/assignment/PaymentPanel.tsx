import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle, XCircle, Shield, ArrowRight, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Payment, Assignment } from '@/types';
import { supabase } from '@/lib/supabase';
import { fadeInUp } from '@/data/constants';

const PAYMENT_LINK = 'https://flutterwave.com/pay/ctiqneyy3cgv';

interface PaymentPanelProps {
  assignment: Assignment;
  user: { id: string; name: string; email: string };
  onPaymentComplete: (payment: Payment) => void;
  onPaymentFailed: (error: string) => void;
}

export function PaymentPanel({ assignment, user, onPaymentComplete, onPaymentFailed: _onPaymentFailed }: PaymentPanelProps) {
  const [step, setStep] = useState<'ready' | 'confirming' | 'success' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPolling = () => {
    pollCount.current = 0;
    pollRef.current = setInterval(async () => {
      pollCount.current += 1;
      const { data } = await supabase
        .from('assignments')
        .select('status, payment_amount')
        .eq('id', assignment.id)
        .single();

      if (data?.status === 'submitted' || data?.status === 'paid') {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep('success');
        onPaymentComplete({
          id: `auto_${Date.now()}`,
          assignmentId: assignment.id,
          userId: user.id,
          amount: data.payment_amount || assignment.paymentAmount!,
          currency: 'GBP',
          status: 'completed',
          provider: 'wise',
          createdAt: new Date().toISOString(),
        });
        return;
      }
      if (pollCount.current >= 120) {
        if (pollRef.current) clearInterval(pollRef.current);
        setError('Payment confirmation timed out. If you paid, contact us at apeacad3my@gmail.com with your reference.');
        setStep('error');
      }
    }, 5000);
  };

  const handlePay = () => {
    if (!assignment.paymentAmount) { toast.error('No payment amount set'); return; }
    window.open(PAYMENT_LINK, '_blank');
    setStep('confirming');
    startPolling();
  };

  const handleRetry = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep('ready');
    setError(null);
    pollCount.current = 0;
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
              <p className="text-xs text-gray-400 mb-4">British Pounds (GBP)</p>
              <div className="w-full p-3 rounded-xl bg-yellow-50 border border-yellow-300 mb-5 text-left">
                <p className="text-yellow-800 text-xs font-semibold">⚠️ NOTE: When the payment page opens, enter exactly <span className="font-bold">£{assignment.paymentAmount?.toFixed(2)}</span> as the amount. Do not change this figure. Entering the wrong amount will delay your order.</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Secured by Flutterwave — bank-level encryption</span>
              </div>
              <Button onClick={handlePay} className="h-12 px-8 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                <span className="flex items-center gap-2">Pay £{assignment.paymentAmount?.toFixed(2)} <ArrowRight className="h-5 w-5" /></span>
              </Button>
            </motion.div>
          )}

          {step === 'confirming' && (
            <motion.div key="confirming" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirming Payment...</h3>
              <p className="text-sm text-gray-500 mb-4">Complete your payment in the Flutterwave tab. This page will update automatically once confirmed.</p>
              <button onClick={handlePay}
                className="inline-flex items-center gap-2 text-sm text-emerald-700 font-medium underline mb-6">
                <ExternalLink className="h-4 w-4" /> Open payment page again
              </button>
              <p className="text-xs text-gray-400">Do not close this tab.</p>
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
              <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm">Submitted ✓</Badge>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
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
