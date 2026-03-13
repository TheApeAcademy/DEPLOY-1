import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

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
    body: 'Monitor your assignment status on your dashboard — from submitted to in progress to completed. You will be notified at every stage.',
  },
  {
    title: 'Settings & Preferences',
    body: 'Tap your avatar top-right to access Settings. Change your name, password, toggle dark mode, and manage notifications.',
  },
  {
    title: 'Need More Help?',
    body: 'Reach us anytime at apeacad3my@gmail.com. We are here to make sure you succeed.',
  },
];

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const close = () => { setOpen(false); setStep(0); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-black font-bold text-xl transition-transform hover:scale-110 active:scale-95 neon-pulse"
        style={{
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          boxShadow: '0 0 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.3)',
        }}
        aria-label="Help"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0a0a0a, #0f0f0f)',
                border: '1px solid rgba(34,197,94,0.3)',
                boxShadow: '0 0 30px rgba(34,197,94,0.15), 0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-black text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
                  >
                    ?
                  </span>
                  <span className="text-white font-semibold text-sm">How to use ApeAcademy</span>
                </div>
                <button onClick={close} className="text-gray-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 py-5"
                >
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: '#22c55e' }}
                  >
                    {steps[step].title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {steps[step].body}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-1.5 pb-3">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === step ? '20px' : '6px',
                      height: '6px',
                      background: i === step ? '#22c55e' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between px-5 pb-5 gap-3">
                <button
                  onClick={prev}
                  disabled={step === 0}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>

                <span className="text-xs text-gray-600">
                  {step + 1} / {steps.length}
                </span>

                {step < steps.length - 1 ? (
                  <button
                    onClick={next}
                    className="flex items-center gap-1 text-xs font-semibold transition-colors"
                    style={{ color: '#22c55e' }}
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={close}
                    className="text-xs font-semibold px-3 py-1 rounded-lg text-black"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
                  >
                    Got it
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
