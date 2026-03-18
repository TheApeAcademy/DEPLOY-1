import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const steps = [
  {
    title: 'Welcome to ApeAcademy 🦍',
    body: 'The premium academic assistance platform. Submit any assignment and our expert team handles the rest.',
  },
  {
    title: 'Step 1 — Submit Your Assignment',
    body: 'Click "Submit Assignment" from your dashboard. Fill in the assignment type, course, teacher, due date, and upload any files.',
  },
  {
    title: 'Step 2 — AI Analysis',
    body: 'Our system analyses your assignment instantly — assessing complexity, estimated hours, and calculates a fair price.',
  },
  {
    title: 'Step 3 — Review & Pay',
    body: 'You will see a clear breakdown of the price before paying. No hidden fees. Pay securely and your assignment is submitted to our team.',
  },
  {
    title: 'Step 4 — Track Progress',
    body: 'Monitor your assignment status on your dashboard — from submitted to in progress to completed.',
  },
  {
    title: 'Settings & Preferences',
    body: 'Tap your avatar top-right to access Settings. Change your name, password, toggle notifications, and manage your account.',
  },
  {
    title: 'Need More Help?',
    body: 'Reach us anytime at apeacad3my@gmail.com. We are here to make sure you succeed.',
  },
];

const CATEGORIES = ['General', 'Bug Report', 'Feature Request', 'Pricing', 'Delivery', 'Other'];

interface HelpWidgetProps {
  user?: { id: string; name: string; email: string } | null;
}

export function HelpWidget({ user }: HelpWidgetProps) {
  const [openHelp, setOpenHelp] = useState(false);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [step, setStep] = useState(0);

  // Suggestion state
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const closeHelp = () => { setOpenHelp(false); setStep(0); };
  const closeSuggest = () => { setOpenSuggest(false); setMessage(''); setSent(false); setError(''); };

  const handleSuggest = () => {
    setOpenSuggest(true);
    setOpenHelp(false);
  };

  const handleHelp = () => {
    setOpenHelp(true);
    setOpenSuggest(false);
  };

  const handleSend = async () => {
    if (!message.trim()) { setError('Please write something first.'); return; }
    setSending(true);
    setError('');
    const { error: dbErr } = await supabase.from('suggestions').insert({
      user_id: user?.id || null,
      user_name: user?.name || 'Anonymous',
      user_email: user?.email || 'anonymous',
      message: message.trim(),
      category: category.toLowerCase(),
      status: 'unread',
    });
    setSending(false);
    if (dbErr) { setError('Failed to send. Please try again.'); return; }
    setSent(true);
    setMessage('');
  };

  const glowBtn = (label: string, onClick: () => void, active: boolean) => (
    <button
      onClick={onClick}
      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-transform hover:scale-110 active:scale-95"
      style={{
        background: active
          ? 'linear-gradient(135deg, #047857, #10b981)'
          : 'linear-gradient(135deg, #16a34a, #22c55e)',
        boxShadow: active
          ? '0 0 25px rgba(16,185,129,0.8), 0 0 50px rgba(16,185,129,0.4)'
          : '0 0 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.3)',
        color: 'black',
      }}
    >
      {label}
    </button>
  );

  const panelStyle = {
    background: 'linear-gradient(160deg, #0a0a0a, #0f0f0f)',
    border: '1px solid rgba(34,197,94,0.3)',
    boxShadow: '0 0 30px rgba(34,197,94,0.15), 0 20px 60px rgba(0,0,0,0.5)',
  };

  return (
    <>
      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {glowBtn('💡', handleSuggest, openSuggest)}
        {glowBtn('?', handleHelp, openHelp)}
      </div>

      {/* HELP PANEL */}
      <AnimatePresence>
        {openHelp && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeHelp} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-32 right-6 z-50 w-80 rounded-2xl overflow-hidden"
              style={panelStyle}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-black text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>?</span>
                  <span className="text-white font-semibold text-sm">How to use ApeAcademy</span>
                </div>
                <button onClick={closeHelp} className="text-gray-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-5 py-5">
                  <h3 className="font-bold text-base mb-2" style={{ color: '#22c55e' }}>{steps[step].title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{steps[step].body}</p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-1.5 pb-3">
                {steps.map((_, i) => (
                  <button key={i} onClick={() => setStep(i)} className="rounded-full transition-all"
                    style={{ width: i === step ? '20px' : '6px', height: '6px',
                      background: i === step ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
                ))}
              </div>

              <div className="flex items-center justify-between px-5 pb-5 gap-3">
                <button onClick={prev} disabled={step === 0}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-30">
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>
                <span className="text-xs text-gray-600">{step + 1} / {steps.length}</span>
                {step < steps.length - 1 ? (
                  <button onClick={next} className="flex items-center gap-1 text-xs font-semibold transition-colors"
                    style={{ color: '#22c55e' }}>
                    Next <ChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button onClick={closeHelp} className="text-xs font-semibold px-3 py-1 rounded-lg text-black"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                    Got it
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SUGGESTION PANEL */}
      <AnimatePresence>
        {openSuggest && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSuggest} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-32 right-6 z-50 w-80 rounded-2xl overflow-hidden"
              style={panelStyle}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-black text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>💡</span>
                  <span className="text-white font-semibold text-sm">Share a Suggestion</span>
                </div>
                <button onClick={closeSuggest} className="text-gray-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 py-5">
                {sent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4">
                    <div className="text-4xl mb-3">🦍</div>
                    <p className="text-white font-semibold mb-1">Got it, thanks!</p>
                    <p className="text-gray-400 text-sm">Your suggestion means a lot. We actually read these.</p>
                    <button onClick={closeSuggest} className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg text-black"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Category */}
                    <div className="mb-3">
                      <p className="text-gray-400 text-xs mb-2">Category</p>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map(cat => (
                          <button key={cat} onClick={() => setCategory(cat)}
                            className="text-xs px-2.5 py-1 rounded-full transition-all"
                            style={{
                              background: category === cat ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'rgba(255,255,255,0.08)',
                              color: category === cat ? 'black' : '#9ca3af',
                              fontWeight: category === cat ? '600' : '400',
                            }}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-3">
                      <p className="text-gray-400 text-xs mb-2">Your message</p>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Tell us what you think, what's broken, or what you'd love to see..."
                        rows={4}
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none outline-none focus:ring-1 transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(34,197,94,0.2)',
                          lineHeight: '1.5',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(34,197,94,0.2)'}
                      />
                    </div>

                    {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

                    <button onClick={handleSend} disabled={sending}
                      className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send Suggestion</>}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
