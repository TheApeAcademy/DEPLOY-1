import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle, XCircle, Lock, Shield, ArrowRight, Loader2, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Payment, Assignment } from '@/types';
import { initiatePayment, verifyPayment } from '@/services/payment';
import { fadeInUp } from '@/data/constants';

interface PaymentPanelProps {
  assignment: Assignment;
  user: { id: string; name: string; email: string };
  onPaymentComplete: (payment: Payment) => void;
  onPaymentFailed: (error: string) => void;
}

export function PaymentPanel({ assignment, user, onPaymentComplete, onPaymentFailed }: PaymentPanelProps) {
  const [step, setStep] = useState<'ready' | 'checkout' | 'verifying' | 'success' | 'error'>('ready');
  const [txRef, setTxRef] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleStartPayment = async () => {
    setIsLoading(true);
    setError(null);

    if (!assignment.paymentAmount) {
      setError('No payment amount set');
      setStep('error');
      setIsLoading(false);
      return;
    }

    const result = await initiatePayment(assignment.id, assignment.paymentAmount);

    if (!result.success) {
      setError(result.error || 'Failed to create payment');
      setStep('error');
      onPaymentFailed(result.error || 'Failed');
      setIsLoading(false);
      return;
    }

    setTxRef(result.txRef!);
    setPaymentId(result.paymentId!);
    setCheckoutUrl(result.checkoutUrl || null);
    setStep('checkout');
    setIsLoading(false);

    // Open Wise checkout in new tab
    if (result.checkoutUrl) {
      window.open(result.checkoutUrl, '_blank');
    }
  };

  const handleOpenCheckout = () => {
    if (checkoutUrl) window.open(checkoutUrl, '_blank');
  };

  const handleVerify = async () => {
    if (!txRef) return;
    setStep('verifying');
    setIsLoading(true);
    setPollCount(0);

    // Poll every 5 seconds for up to 10 minutes
    pollRef.current = setInterval(async () => {
      setPollCount(c => c + 1);
      const result = await verifyPayment(txRef);

      if (result.success && result.status === 'completed') {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep('success');
        setIsLoading(false);
        onPaymentComplete({
          id: paymentId || txRef,
          assignmentId: assignment.id,
          userId: user.id,
          amount: assignment.paymentAmount!,
          currency: 'GBP',
          status: 'completed',
          provider: 'wise',
          createdAt: new Date().toISOString(),
        });
      } else if (result.status === 'failed') {
        if (pollRef.current) clearInterval(pollRef.current);
        setError('Payment failed or expired on Wise');
        setStep('error');
        setIsLoading(false);
        onPaymentFailed('Payment failed');
      } else if (pollCount >= 120) { // 10 minutes
        if (pollRef.current) clearInterval(pollRef.current);
        setError('Verification timed out. Contact support with your order ID.');
        setStep('error');
        setIsLoading(false);
      }
    }, 5000);
  };

  const handleRetry = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep('ready');
    setError(null);
    setTxRef(null);
    setPaymentId(null);
    setCheckoutUrl(null);
    setPollCount(0);
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

          {/* READY */}
          {step === 'ready' && (
            <motion.div key="ready" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' }}>
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
                <span>Secured by Wise — bank-level encryption</span>
              </div>
              <Button onClick={handleStartPayment} disabled={isLoading}
                className="h-12 px-8 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<>Pay with Wise <ArrowRight className="h-5 w-5 ml-2" /></>)}
              </Button>
            </motion.div>
          )}

          {/* CHECKOUT */}
          {step === 'checkout' && (
            <motion.div key="checkout" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8 space-y-5">
              <div className="text-5xl mb-2">🔗</div>
              <h3 className="text-lg font-semibold text-gray-900">Wise Checkout Opened</h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Complete your payment in the Wise tab that just opened. Once done, click <strong>I've Paid</strong> below.
              </p>
              {checkoutUrl && (
                <button onClick={handleOpenCheckout}
                  className="inline-flex items-center gap-2 text-sm text-emerald-700 font-medium underline">
                  <ExternalLink className="h-4 w-4" /> Open Wise again
                </button>
              )}
              <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-500 font-mono">
                Order ref: {txRef}
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleRetry} className="rounded-xl">Cancel</Button>
                <Button onClick={handleVerify}
                  className="rounded-xl text-white font-semibold px-8"
                  style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                  <CheckCircle className="h-4 w-4 mr-2" /> I've Paid
                </Button>
              </div>
            </motion.div>
          )}

          {/* VERIFYING */}
          {step === 'verifying' && (
            <motion.div key="verifying" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Payment…</h3>
              <p className="text-sm text-gray-500 mb-4">Checking with Wise. This can take up to 60 seconds.</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Check {pollCount} of 120</span>
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <motion.div key="success" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Confirmed!</h3>
              <p className="text-gray-600 mb-4">£{assignment.paymentAmount?.toFixed(2)} received. Your assignment is now submitted.</p>
              <div className="p-4 rounded-xl bg-gray-50 max-w-xs mx-auto text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs">{txRef?.slice(-12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge className="bg-emerald-500 text-white">Paid</Badge>
                </div>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
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
