import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from '@/components/LandingPage';
import { HomePage } from '@/components/HomePage';
import { SubmitAssignmentPage } from '@/components/SubmitAssignmentPage';
import { SuccessPage } from '@/components/SuccessPage';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { RegionSelectionModal } from '@/components/RegionSelectionModal';
import { AuthModal } from '@/components/AuthModal';
import type { User, UserPreferences, Assignment } from '@/types';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut, updateProfile } from '@/services/auth';
import { logActivity } from '@/services/database';

type Page = 'landing' | 'home' | 'submit' | 'success' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — Supabase persists session in localStorage automatically
  useEffect(() => {
    const restoreSession = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setCurrentPage(currentUser.role === 'admin' ? 'admin' : 'home');
        if (currentUser.region && currentUser.country) {
          setPreferences({
            region: currentUser.region,
            country: currentUser.country,
            schoolLevel: currentUser.schoolLevel || '',
            department: currentUser.department || '',
          });
        }
      }
      setIsLoading(false);
    };

    restoreSession();

    // Listen for auth state changes (tab switches, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setCurrentPage('landing');
        setPreferences(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = (newUser: User, isSignup: boolean) => {
    setUser(newUser);
    toast.success(isSignup ? 'Account created! Welcome 🦍' : 'Welcome back!');
    setCurrentPage(newUser.role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = async () => {
    if (user) {
      await logActivity({ type: 'user_logout', userId: user.id, userName: user.name, userEmail: user.email, description: `${user.name} logged out` });
    }
    await signOut();
    setUser(null);
    setPreferences(null);
    setShowProfile(false);
    toast.success('Logged out');
    setCurrentPage('landing');
  };

  const handleRegionComplete = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    setShowRegionModal(false);
    if (user) {
      await updateProfile(user.id, {
        region: prefs.region,
        country: prefs.country,
        school_level: prefs.schoolLevel,
        department: prefs.department,
      });
    }
    toast.success('Preferences saved!');
    if (currentPage === 'landing') setCurrentPage('home');
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setCurrentPage('success');
  };

  const handleNavigateToSubmit = () => {
    if (!user) { setShowAuthModal(true); toast.info('Please log in to submit an assignment'); return; }
    setCurrentPage('submit');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#022c22,#064e3b)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors toastOptions={{
        style: { background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.1)' }
      }} />

      <AnimatePresence mode="wait">
        {currentPage === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onSubmitAssignment={handleNavigateToSubmit} onSelectRegion={() => setShowRegionModal(true)} onLogin={() => setShowAuthModal(true)} />
          </motion.div>
        )}
        {currentPage === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomePage user={user} preferences={preferences} onSubmitAssignment={handleNavigateToSubmit}
              onSelectRegion={() => setShowRegionModal(true)} onLogin={() => setShowAuthModal(true)}
              onLogout={handleLogout} showProfile={showProfile} setShowProfile={setShowProfile} />
          </motion.div>
        )}
        {currentPage === 'submit' && (
          <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SubmitAssignmentPage user={user} onBack={() => setCurrentPage('home')} onSubmit={handleSubmitAssignment} onLogin={() => setShowAuthModal(true)} />
          </motion.div>
        )}
        {currentPage === 'success' && currentAssignment && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuccessPage assignment={currentAssignment} onBackToHome={() => { setCurrentPage('home'); setCurrentAssignment(null); }} />
          </motion.div>
        )}
        {currentPage === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>

      <RegionSelectionModal isOpen={showRegionModal} onClose={() => setShowRegionModal(false)} onComplete={handleRegionComplete} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={handleAuth} />
      {showProfile && <div className="fixed inset-0 z-30" onClick={() => setShowProfile(false)} />}
    </>
  );
}

export default App;
