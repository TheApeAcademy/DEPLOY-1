import { motion } from 'motion/react';

interface ConversionPageProps {
  onSubmitAssignment: () => void;
  onLogin: () => void;
}

export function ConversionPage({ onSubmitAssignment }: ConversionPageProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: '#0f1117' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-12"
      >
        <span className="text-4xl">🦍</span>
        <span className="text-2xl font-bold text-white">ApeAcademy</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl font-black text-white text-center leading-tight mb-10 max-w-2xl"
      >
        Get it done. Actually understand it. Never get flagged.
      </motion.h1>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-4 mb-10 w-full max-w-sm"
      >
        {[
          { text: 'Assignment Doc — ready to submit' },
          { text: 'Study Doc — actually understand it' },
          { text: 'Undetectable — passes TurnItIn' },
        ].map((benefit, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)' }}
            >
              <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 800 }}>✓</span>
            </div>
            <span className="text-white text-lg font-medium">{benefit.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Pricing */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xl font-semibold mb-8"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        Starting from <span className="text-white font-black">£8</span>
      </motion.p>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSubmitAssignment}
        className="text-white text-lg font-bold px-10 py-5 rounded-2xl mb-10"
        style={{
          background: 'linear-gradient(135deg,#14532d,#15803d 40%,#22c55e)',
          boxShadow: '0 8px 32px rgba(34,197,94,0.35)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Submit Your Assignment →
      </motion.button>

      {/* Platform row */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="text-sm text-center"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Delivered via&nbsp; <span style={{ color: 'rgba(255,255,255,0.5)' }}>💬 WhatsApp</span>
        &nbsp;·&nbsp;<span style={{ color: 'rgba(255,255,255,0.5)' }}>👻 Snapchat</span>
        &nbsp;·&nbsp;<span style={{ color: 'rgba(255,255,255,0.5)' }}>✉️ Email</span>
      </motion.p>
    </div>
  );
}
