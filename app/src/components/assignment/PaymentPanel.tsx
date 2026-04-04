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
  currencySymbol?: string;
}

export function PaymentPanel({ assignment, user, onPaymentComplete, onPaymentFailed: _onPaymentFailed, currencySymbol = '£' }: PaymentPanelProps) {
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
    <Card className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
          <CreditCard className="h-5 w-5 text-emerald-400" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">

          {step === 'ready' && (
            <motion.div key="ready" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)' }}>
                <span className="text-4xl">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Pay</h3>
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Reviewed and priced by our team</p>
              <div className="text-4xl font-bold text-white mb-1">
                {currencySymbol}{assignment.paymentAmount?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Reviewed and approved by our team</p>
              <div className="w-full p-3 rounded-xl mb-5 text-left"
                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                <p className="text-xs font-semibold" style={{ color: 'rgba(253,224,71,0.9)' }}>⚠️ NOTE: When the payment page opens, enter exactly <span className="font-bold">{currencySymbol}{assignment.paymentAmount?.toFixed(2)}</span> as the amount. Do not change this figure. Entering the wrong amount will delay your order.</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Secured by Flutterwave · bank-level encryption</span>
              </div>
              <Button onClick={handlePay} className="h-12 px-8 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                <span className="flex items-center gap-2">Pay {currencySymbol}{assignment.paymentAmount?.toFixed(2)} <ArrowRight className="h-5 w-5" /></span>
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
              <h3 className="text-lg font-semibold text-white mb-2">Confirming Payment...</h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Complete your payment in the Flutterwave tab. This page will update automatically once confirmed.</p>
              <button onClick={handlePay}
                className="inline-flex items-center gap-2 text-sm text-emerald-400 font-medium underline mb-6">
                <ExternalLink className="h-4 w-4" /> Open payment page again
              </button>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Do not close this tab.</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)' }}>
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">Payment Confirmed!</h3>
              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{currencySymbol}{assignment.paymentAmount?.toFixed(2)} received. Your assignment is now in progress.</p>
              <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm">Submitted ✓</Badge>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>{error}</p>
              <Button onClick={handleRetry} variant="outline" className="rounded-xl" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
