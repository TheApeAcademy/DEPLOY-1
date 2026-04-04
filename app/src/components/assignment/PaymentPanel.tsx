import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle, XCircle, Shield, ArrowRight, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Payment, Assignment, User } from '@/types';
import { supabase } from '@/lib/supabase';
import { updateAssignmentStatus } from '@/services/database';
import { fadeInUp } from '@/data/constants';

const PAYMENT_LINK = 'https://flutterwave.com/pay/ctiqneyy3cgv';

const BANK_DETAILS = {
  bank: 'Sterling Bank',
  accountName: 'Olusanu Bankole Joshua',
  accountNumber: '2067395303',
};

type PaymentMethod = 'apple' | 'card' | 'bank';

const SUPABASE_URL = 'https://gtnnzhphexfjblujspmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bm56aHBoZXhmamJsdWpzcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzU2NzUsImV4cCI6MjA4Nzg1MTY3NX0.a7zi2U0VeTFpLNQu1Csh-VwjqwaVlKwnbj7T1C27kak';

interface PaymentPanelProps {
  assignment: Assignment;
  user: Pick<User, 'id' | 'name' | 'email' | 'freeCredits' | 'freeCreditsUsed'>;
  onPaymentComplete: (payment: Payment) => void;
  onPaymentFailed: (error: string) => void;
  currencySymbol?: string;
}

export function PaymentPanel({ assignment, user, onPaymentComplete, onPaymentFailed: _onPaymentFailed, currencySymbol = '£' }: PaymentPanelProps) {
  const [step, setStep] = useState<'ready' | 'confirming' | 'success' | 'error' | 'bank_pending' | 'free_success'>('ready');
  const [claimingFree, setClaimingFree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
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

  const handleUseFreeCredit = async () => {
    setClaimingFree(true);
    try {
      // Mark assignment as paid with free credit
      await supabase
        .from('assignments')
        .update({ status: 'paid', payment_amount: 0, payment_id: 'FREE_CREDIT' })
        .eq('id', assignment.id);

      // Decrement free_credits, increment free_credits_used
      await supabase
        .from('profiles')
        .update({
          free_credits: (user.freeCredits ?? 1) - 1,
          free_credits_used: (user.freeCreditsUsed ?? 0) + 1,
        })
        .eq('id', user.id);

      // Trigger generation
      await fetch(`${SUPABASE_URL}/functions/v1/generate-and-deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ assignment_id: assignment.id }),
      });

      setStep('free_success');
      onPaymentComplete({
        id: 'FREE_CREDIT',
        assignmentId: assignment.id,
        userId: user.id,
        amount: 0,
        currency: 'GBP',
        status: 'completed',
        provider: 'wise',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      toast.error('Failed to apply free credit. Please try again.');
    }
    setClaimingFree(false);
  };

  const handleBankTransferSent = async () => {
    try {
      await updateAssignmentStatus(assignment.id, { status: 'pending' });
    } catch {
      // non-fatal
    }
    setStep('bank_pending');
  };

  const handleRetry = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep('ready');
    setError(null);
    pollCount.current = 0;
  };

  const ref8 = assignment.id.slice(0, 8).toUpperCase();

  const methodCardStyle = (method: PaymentMethod): React.CSSProperties => ({
    width: '100%',
    textAlign: 'left',
    background: paymentMethod === method ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${paymentMethod === method ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '16px',
    padding: '16px',
    cursor: method === 'apple' ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: method === 'apple' ? 0.55 : 1,
    fontFamily: 'inherit',
    display: 'block',
  });

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

          {step === 'free_success' && (
            <motion.div key="free_success" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="text-5xl mb-4">🦍</div>
              <h3 className="text-lg font-semibold text-white mb-3">Your free assignment is being generated!</h3>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Check your dashboard in a minute — your document will be delivered to your chosen platform.
              </p>
            </motion.div>
          )}

          {step === 'ready' && (
            <motion.div key="ready" variants={fadeInUp} initial="initial" animate="animate" exit="exit">

              {/* Free credit banner */}
              {(user.freeCredits ?? 0) > 0 && (
                <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)' }}>
                  <p className="text-base font-bold text-white mb-1">🎁 You have 1 free assignment!</p>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Your first assignment is on us. Use it now and experience ApeAcademy for free.
                  </p>
                  <Button
                    onClick={handleUseFreeCredit}
                    disabled={claimingFree}
                    className="w-full h-11 rounded-xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}
                  >
                    {claimingFree
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Applying...</>
                      : <>Use My Free Assignment <ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
                </div>
              )}

              {/* Amount */}
              <div className="text-center mb-6">
                <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Amount due</p>
                <div className="text-4xl font-bold text-white mb-1">
                  {currencySymbol}{assignment.paymentAmount?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Reviewed and approved by our team</p>
              </div>

              {/* Method selection */}
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Choose payment method
              </p>
              <div className="space-y-3 mb-5">

                {/* Apple Pay */}
                <button
                  style={methodCardStyle('apple')}
                  onClick={() => toast.info('Apple Pay coming soon. Use Card Payment for now.')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍎</span>
                      <div>
                        <div className="font-semibold text-white text-sm">Apple Pay</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Pay instantly with Face ID or Touch ID</div>
                      </div>
                    </div>
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>Coming Soon</span>
                  </div>
                </button>

                {/* Card Payment */}
                <button
                  style={methodCardStyle('card')}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <div className="font-semibold text-white text-sm">Card Payment</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Visa, Mastercard, or any debit card</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Recommended</Badge>
                  </div>
                </button>

                {/* Bank Transfer */}
                <button
                  style={methodCardStyle('bank')}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏦</span>
                    <div>
                      <div className="font-semibold text-white text-sm">Bank Transfer</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Pay directly to our account</div>
                    </div>
                  </div>
                  {paymentMethod === 'bank' && (
                    <div className="mt-4 space-y-2" style={{ borderTop: '1px solid rgba(34,197,94,0.15)', paddingTop: '12px' }}>
                      {[
                        { label: 'Bank', value: BANK_DETAILS.bank },
                        { label: 'Account Name', value: BANK_DETAILS.accountName },
                        { label: 'Account Number', value: BANK_DETAILS.accountNumber },
                        { label: 'Amount', value: `${currencySymbol}${assignment.paymentAmount?.toFixed(2)}` },
                        { label: 'Reference', value: ref8 },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{label}</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'white', fontSize: '12px' }}>{value}</span>
                        </div>
                      ))}
                      <p className="text-xs mt-3" style={{ color: 'rgba(253,224,71,0.8)', lineHeight: 1.5 }}>
                        ⚠️ Send exact amount shown. Use your assignment ID as reference. Allow 1–2 hours for confirmation.
                      </p>
                    </div>
                  )}
                </button>
              </div>

              {/* Warning note for card only */}
              {paymentMethod === 'card' && (
                <div className="w-full p-3 rounded-xl mb-5"
                  style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(253,224,71,0.9)' }}>
                    ⚠️ When the payment page opens, enter exactly <span className="font-bold">{currencySymbol}{assignment.paymentAmount?.toFixed(2)}</span> as the amount. Do not change this figure.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Secured by Flutterwave · bank-level encryption</span>
              </div>

              {paymentMethod === 'card' && (
                <Button onClick={handlePay} className="w-full h-12 rounded-xl text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                  <span className="flex items-center gap-2">
                    Pay {currencySymbol}{assignment.paymentAmount?.toFixed(2)} <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              )}
              {paymentMethod === 'bank' && (
                <Button onClick={handleBankTransferSent} className="w-full h-12 rounded-xl text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                  <CheckCircle className="h-5 w-5 mr-2" /> I've sent the payment
                </Button>
              )}
            </motion.div>
          )}

          {step === 'bank_pending' && (
            <motion.div key="bank_pending" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)' }}>
                <span className="text-4xl">🏦</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Transfer Received — Thank You!</h3>
              <p className="text-sm mb-4 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                We'll verify your bank transfer and start your assignment within 1–2 hours.
                Use reference <span className="font-mono font-bold text-emerald-400">{ref8}</span> if you need to contact us.
              </p>
              <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm">Awaiting Confirmation ⏳</Badge>
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
              <button onClick={handlePay} className="inline-flex items-center gap-2 text-sm text-emerald-400 font-medium underline mb-6">
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
