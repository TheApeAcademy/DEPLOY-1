import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowRight, CheckCircle, ExternalLink, Loader2, RefreshCw, XCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { Payment, Assignment } from '@/types';
import { updateAssignmentStatus, logActivity } from '@/services/database';
import { fadeInUp } from '@/data/constants';

const PAYMENT_LINK = 'https://flutterwave.com/pay/ctiqneyy3cgv';

interface PaymentPanelProps {
  assignment: Assignment;
  user: { id: string; name: string; email: string };
  onPaymentComplete: (payment: Payment) => void;
  onPaymentFailed: (error: string) => void;
}

export function PaymentPanel({ assignment, user, onPaymentComplete, onPaymentFailed }: PaymentPanelProps) {
  const [step, setStep] = useState<'ready' | 'waiting' | 'success' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = () => {
    if (!assignment.paymentAmount) { toast.error('No payment amount set'); return; }
    window.open(PAYMENT_LINK, '_blank');
    setStep('waiting');
  };

  const handleConfirmPaid = async () => {
    setIsLoading(true);
    try {
      const ref = `manual_${Date.now()}`;
      await updateAssignmentStatus(assignment.id, { status: 'submitted', payment_amount: assignment.paymentAmount });
      await logActivity({
        type: 'payment_completed',
        userId: user.id,
        userName: user.name,
        assignmentId: assignment.id,
        description: `Payment of £${assignment.paymentAmount} confirmed. Ref: ${ref}`,
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
    } catch (err) {
      setError('Failed to record payment. Contact support.');
      setStep('error');
      onPaymentFailed('Recording failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => { setStep('ready'); setError(null); setIsLoading(false); };

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
              <Button onClick={handlePay} className="h-12 px-8 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                <span className="flex items-center gap-2">Pay £{assignment.paymentAmount?.toFixed(2)} <ArrowRight className="h-5 w-5" /></span>
              </Button>
            </motion.div>
          )}

          {step === 'waiting' && (
            <motion.div key="waiting" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8 space-y-5">
              <div className="text-5xl">🔗</div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Page Opened</h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">Complete your payment in the tab that just opened. Once done, click <strong>I've Paid</strong>.</p>
              <button onClick={handlePay} className="inline-flex items-center gap-2 text-sm text-emerald-700 font-medium underline">
                <ExternalLink className="h-4 w-4" /> Open payment page again
              </button>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" onClick={handleRetry} className="rounded-xl">Cancel</Button>
                <Button onClick={handleConfirmPaid} disabled={isLoading}
                  className="rounded-xl text-white font-semibold px-8"
                  style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" />I've Paid</>}
                </Button>
              </div>
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
