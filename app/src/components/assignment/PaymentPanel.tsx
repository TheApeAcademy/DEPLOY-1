import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle, XCircle, Shield, ArrowRight, Loader2, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Payment, Assignment, User } from '@/types';
import { supabase } from '@/lib/supabase';
import { updateAssignmentStatus } from '@/services/database';
import { fadeInUp } from '@/data/constants';
import { useTheme } from '@/contexts/ThemeContext';

declare global {
  interface Window {
    FlutterwaveCheckout: (options: any) => void;
  }
}



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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [step, setStep] = useState<'ready' | 'bank_details' | 'confirming' | 'success' | 'error' | 'free_success'>('ready');
  const [claimingFree, setClaimingFree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  // Theme-aware colors
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.88)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const textPrimary = isDark ? 'white' : '#111827';
  const textMuted = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';
  const textFaint = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  const textVeryFaint = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const cellBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const cellBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const comingSoonBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const comingSoonColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';

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

    const pubKey = import.meta.env.VITE_FLW_PUBLIC_KEY || 'FLWPUBK-573134e5b4849c518275b425abbfeb71-X';
    if (typeof window.FlutterwaveCheckout !== 'function') {
      toast.error('Payment system is loading — please refresh the page and try again.');
      return;
    }

    const currencyCode = currencySymbol === '₦' ? 'NGN' : currencySymbol === '$' ? 'USD' : 'GBP';
    try {
      window.FlutterwaveCheckout({
        public_key: pubKey,
        tx_ref: `APE-${ref8}-${Date.now()}`,
        amount: assignment.paymentAmount,
        currency: currencyCode,
        customer: {
          email: user.email,
          name: user.name,
        },
        customizations: {
          title: 'ApeAcademy',
          description: `${assignment.assignmentType || 'Assignment'} - ${assignment.courseName}`,
          logo: '/favicon.svg',
        },
        callback: (_response: any) => {
          setStep('confirming');
          startPolling();
        },
        onclose: () => {},
      });
    } catch (err: any) {
      console.error('FlutterwaveCheckout error:', err);
      toast.error('Payment failed to open. Please refresh and try again.');
    }
  };

  const handleUseFreeCredit = async () => {
    setClaimingFree(true);
    try {
      await supabase
        .from('assignments')
        .update({ status: 'paid', payment_amount: 0, payment_id: 'FREE_CREDIT' })
        .eq('id', assignment.id);

      await supabase
        .from('profiles')
        .update({
          free_credits: (user.freeCredits ?? 1) - 1,
          free_credits_used: (user.freeCreditsUsed ?? 0) + 1,
        })
        .eq('id', user.id);

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
    } catch {
      toast.error('Failed to apply free credit. Please try again.');
    }
    setClaimingFree(false);
  };

  const handleBankPay = () => {
    if (!assignment.paymentAmount) { toast.error('No payment amount set'); return; }

    // Non-NGN users go to manual Wise bank transfer screen
    if (currencySymbol !== '₦') {
      setStep('bank_details');
      return;
    }

    // NGN users: Flutterwave bank transfer
    const pubKey = import.meta.env.VITE_FLW_PUBLIC_KEY || 'FLWPUBK-573134e5b4849c518275b425abbfeb71-X';
    if (typeof window.FlutterwaveCheckout !== 'function') {
      toast.error('Payment system is loading — please refresh the page and try again.');
      return;
    }

    const currencyCode = 'NGN';
    try {
      window.FlutterwaveCheckout({
        public_key: pubKey,
        tx_ref: `APE-${assignment.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
        amount: assignment.paymentAmount,
        currency: currencyCode,
        payment_options: 'banktransfer',
        customer: {
          email: user.email,
          name: user.name,
        },
        customizations: {
          title: 'ApeAcademy',
          description: `${assignment.assignmentType || 'Assignment'} - ${assignment.courseName}`,
          logo: '/favicon.svg',
        },
        callback: (_response: any) => {
          setStep('confirming');
          startPolling();
        },
        onclose: () => {},
      });
    } catch (err: any) {
      console.error('FlutterwaveCheckout error:', err);
      toast.error('Payment failed to open. Please refresh and try again.');
    }
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
    background: paymentMethod === method ? 'rgba(34,197,94,0.08)' : cellBg,
    border: `1px solid ${paymentMethod === method ? 'rgba(34,197,94,0.4)' : cellBorder}`,
    borderRadius: '16px',
    padding: '16px',
    cursor: method === 'apple' ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: method === 'apple' ? 0.55 : 1,
    fontFamily: 'inherit',
    display: 'block',
  });

  return (
    <Card className="overflow-hidden" style={{ background: cardBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: `1px solid ${cardBorder}`, borderRadius: '20px', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.1)' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
          <CreditCard className="h-5 w-5 text-emerald-400" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">

          {step === 'bank_details' && (
            <motion.div key="bank_details" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">🏦</div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>Bank Transfer Details</h3>
                <p className="text-xs" style={{ color: textMuted }}>Transfer exactly <span className="font-bold text-emerald-400">{currencySymbol}{assignment.paymentAmount?.toFixed(2)}</span> to the account below</p>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { label: 'Account Name', value: 'PLACEHOLDER — update tomorrow' },
                  { label: 'Account Number', value: 'PLACEHOLDER' },
                  { label: 'Sort Code', value: 'XX-XX-XX' },
                  { label: 'Bank', value: 'Wise (UK)' },
                  { label: 'Reference', value: `APE-${ref8}` },
                  { label: 'Amount', value: `${currencySymbol}${assignment.paymentAmount?.toFixed(2)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: cellBg, border: `1px solid ${cellBorder}` }}>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textVeryFaint }}>{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: label === 'Reference' || label === 'Amount' ? '#4ade80' : textPrimary }}>{value}</span>
                      {(label === 'Account Number' || label === 'Sort Code' || label === 'Reference') && (
                        <button onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} copied!`); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textVeryFaint, padding: 0 }}>
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl mb-5" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
                <p className="text-xs" style={{ color: 'rgba(253,224,71,0.85)', lineHeight: 1.6 }}>
                  ⚠️ Use <strong>APE-{ref8}</strong> as your payment reference so we can match your transfer quickly.
                </p>
              </div>

              <Button
                onClick={() => { setStep('confirming'); startPolling(); }}
                className="w-full h-12 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}
              >
                I've Sent the Transfer <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
              <button onClick={() => setStep('ready')} className="w-full mt-3 text-xs text-center" style={{ color: textVeryFaint, background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Go back
              </button>
            </motion.div>
          )}

          {step === 'free_success' && (
            <motion.div key="free_success" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="text-5xl mb-4">🦍</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: textPrimary }}>Your free assignment is being generated!</h3>
              <p className="text-sm max-w-xs mx-auto" style={{ color: textMuted }}>
                Check your dashboard in a minute - your document will be delivered to your chosen platform.
              </p>
            </motion.div>
          )}

          {step === 'ready' && (
            <motion.div key="ready" variants={fadeInUp} initial="initial" animate="animate" exit="exit">

              {/* Free credit banner */}
              {(user.freeCredits ?? 0) > 0 && (
                <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)' }}>
                  <p className="text-base font-bold mb-1" style={{ color: textPrimary }}>🎁 You have 1 free assignment!</p>
                  <p className="text-xs mb-4" style={{ color: textMuted }}>
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
                <p className="text-sm mb-1" style={{ color: textFaint }}>Amount due</p>
                <div className="text-4xl font-bold mb-1" style={{ color: textPrimary }}>
                  {currencySymbol}{assignment.paymentAmount?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs" style={{ color: textVeryFaint }}>Reviewed and approved by our team</p>
              </div>

              {/* Method selection */}
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: textVeryFaint }}>
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
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '7px', flexShrink: 0, fontSize: '20px' }}>
                        🔒
                      </span>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: textPrimary }}>Apple Pay</div>
                        <div className="text-xs" style={{ color: textFaint }}>Pay instantly with Face ID or Touch ID</div>
                      </div>
                    </div>
                    <span style={{ background: comingSoonBg, color: comingSoonColor, borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>Coming Soon</span>
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
                        <div className="font-semibold text-sm" style={{ color: textPrimary }}>Card Payment</div>
                        <div className="text-xs" style={{ color: textFaint }}>Visa, Mastercard, or any debit card</div>
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
                      <div className="font-semibold text-sm" style={{ color: textPrimary }}>Bank Transfer</div>
                      <div className="text-xs" style={{ color: textFaint }}>
                        {currencySymbol === '₦' ? 'Pay via Flutterwave virtual account' : 'Transfer directly to our bank account'}
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'bank' && (
                    <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <p className="text-xs" style={{ color: textFaint, lineHeight: 1.5 }}>
                        {currencySymbol === '₦'
                          ? 'Flutterwave will generate a dedicated account number for your transfer.'
                          : 'You\'ll get our bank details on the next screen. Takes 1-2 hours to confirm.'}
                      </p>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm mb-5" style={{ color: textFaint }}>
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
                <Button onClick={handleBankPay} className="w-full h-12 rounded-xl text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                  <span className="flex items-center gap-2">
                    Pay {currencySymbol}{assignment.paymentAmount?.toFixed(2)} via Bank Transfer <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              )}
            </motion.div>
          )}

          {step === 'confirming' && (
            <motion.div key="confirming" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textPrimary }}>Waiting for Confirmation...</h3>
              <p className="text-sm mb-4" style={{ color: textMuted }}>Once we confirm your payment this page will update automatically. For bank transfers this usually takes under 2 hours.</p>
              <button onClick={handlePay} className="inline-flex items-center gap-2 text-sm text-emerald-400 font-medium underline mb-6">
                <ExternalLink className="h-4 w-4" /> Open payment page again
              </button>
              <p className="text-xs" style={{ color: textVeryFaint }}>Do not close this tab.</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)' }}>
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textPrimary }}>Payment Confirmed!</h3>
              <p className="mb-4" style={{ color: textMuted }}>{currencySymbol}{assignment.paymentAmount?.toFixed(2)} received. Your assignment is now in progress.</p>
              <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm">Submitted ✓</Badge>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textPrimary }}>Something went wrong</h3>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: textMuted }}>{error}</p>
              <Button onClick={handleRetry} variant="outline" className="rounded-xl" style={{ borderColor: cellBorder, color: textPrimary, background: cellBg }}>
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
