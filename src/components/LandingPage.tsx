import { motion } from 'motion/react';
import { ChevronRight, Zap, Globe, Shield, Trophy } from 'lucide-react';

interface LandingPageProps {
  onSubmitAssignment: () => void;
  onSelectRegion: () => void;
  onLogin: () => void;
}

export function LandingPage({ onSubmitAssignment, onSelectRegion, onLogin }: LandingPageProps) {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Rapid turnaround without compromising quality',
    },
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'Luxury-grade work that exceeds expectations',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Supporting students across continents and time zones',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated Dark Forest Green Background */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #022c22 100%)' }}>
        {/* Animated emerald orbs */}
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(5,150,105,0.25)' }}
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(4,120,87,0.2)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'rgba(6,78,59,0.3)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col p-6 md:p-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-4xl"
            >
              🦍
            </motion.div>
            <span className="text-2xl font-bold text-white">ApeAcademy</span>
          </div>
          <button
            onClick={onLogin}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #047857, #10b981)',
              boxShadow: '0 4px 15px rgba(5,150,105,0.4)',
            }}
          >
            Sign In
          </button>
        </motion.header>

        {/* Glass Hero Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-center max-w-5xl mx-auto text-center w-full"
        >
          {/* Glass morphism container */}
          <div
            className="relative rounded-3xl p-10 md:p-16 mb-10 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* Inner glow top edge */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)' }}
            />

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 flex justify-center"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34d399',
                }}
              >
                <Trophy className="h-4 w-4" />
                <span>Academic Excellence Hub 🎓</span>
              </div>
            </motion.div>

            {/* Gorilla */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-8xl mb-8"
            >
              🦍
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4"
            >
              Elite Academic Support 🚀
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="block text-4xl md:text-5xl mt-2"
                style={{
                  background: 'linear-gradient(135deg, #34d399, #6ee7b7, #a7f3d0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Your Competitive Edge 💎
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-2xl mx-auto mb-10"
            >
              Premium Assignment Review ✨ — delivered with unmatched quality, precision, and speed.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={onSubmitAssignment}
                className="group inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #047857, #10b981)',
                  boxShadow: '0 8px 25px rgba(5,150,105,0.45)',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 35px rgba(16,185,129,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 25px rgba(5,150,105,0.45)')}
              >
                Submit Assignment
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onSelectRegion}
                className="group inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #064e3b, #065f46)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  color: '#34d399',
                  boxShadow: '0 8px 25px rgba(2,44,34,0.5)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #065f46, #047857)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(5,150,105,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #064e3b, #065f46)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(2,44,34,0.5)';
                }}
              >
                Select Your Region
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="grid md:grid-cols-3 gap-4 w-full"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-2xl p-6 transition-all cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.25)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <feature.icon className="h-8 w-8 mb-4" style={{ color: '#34d399' }} />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-10 text-center"
        >
          <p className="text-white/30 text-sm">
            © 2026 ApeAcademy. Assignment Success System 📈
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
