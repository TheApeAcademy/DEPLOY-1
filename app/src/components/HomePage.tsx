import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  MapPin,
  GraduationCap,
  FileText,
  LogOut,
  Settings,
  Plus,
  History,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { User, UserPreferences } from '@/types';
import { ASSIGNMENT_STATUS_LABELS } from '@/data/constants';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import i18n, { applyDirection } from '@/i18n';

interface HomePageProps {
  user: User | null;
  preferences: UserPreferences | null;
  onSubmitAssignment: () => void;
  onRequestTopic: () => void;
  onSelectRegion: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
}

export function HomePage({
  user,
  preferences,
  onSubmitAssignment,
  onRequestTopic,
  onSelectRegion,
  onLogin,
  onLogout,
  onOpenSettings,
  showProfile,
  setShowProfile,
}: HomePageProps) {
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('apeacademy_ui_language') || 'EN';
  });
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('apeacademy_ui_language');
    if (saved) {
      const codeMap: Record<string, string> = { EN: 'en', FR: 'fr', ES: 'es', AR: 'ar' };
      const code = codeMap[saved] || 'en';
      i18n.changeLanguage(code);
      applyDirection(code);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchAssignments = async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setUserAssignments(data);
    };
    fetchAssignments();
  }, [user]);

  const recentAssignments = userAssignments.slice(0, 3);

  const stats = {
    total: userAssignments.length,
    pending: userAssignments.filter(a => a.status === 'pending' || a.status === 'analyzing').length,
    completed: userAssignments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-3xl"
              >
                🦍
              </motion.div>
              <span className="text-2xl font-bold text-foreground">ApeAcademy</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  🌐 {currentLanguage}
                </button>
                {showLanguageMenu && (
                  <div style={{ position: 'absolute', top: '36px', right: 0, background: resolvedTheme === 'dark' ? 'rgba(15,15,15,0.97)' : '#fff', border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '130px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    {[
                      { label: 'English', code: 'en', display: 'EN' },
                      { label: 'French', code: 'fr', display: 'FR' },
                      { label: 'Spanish', code: 'es', display: 'ES' },
                      { label: 'Arabic', code: 'ar', display: 'AR' },
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          applyDirection(lang.code);
                          localStorage.setItem('apeacademy_ui_language', lang.display);
                          setCurrentLanguage(lang.display);
                          setShowLanguageMenu(false);
                          if (lang.code === 'ar') {
                            document.documentElement.setAttribute('dir', 'rtl');
                          } else {
                            document.documentElement.setAttribute('dir', 'ltr');
                          }
                        }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: currentLanguage === lang.display ? 'rgba(34,197,94,0.12)' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: currentLanguage === lang.display ? '#4ade80' : resolvedTheme === 'dark' ? '#f0fdf4' : '#111827', fontWeight: currentLanguage === lang.display ? 700 : 400 }}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={toggleTheme}
                className="glass w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all text-base"
                title="Toggle dark mode"
              >
                {resolvedTheme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => (user ? setShowProfile(!showProfile) : onLogin())}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <UserIcon className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {showProfile && user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-6 z-50"
        >
          <div className="glass rounded-2xl shadow-xl p-4 w-64">
            <div className="space-y-3">
              <div className="pb-3 border-b border-border/30">
                <div className="font-semibold text-foreground">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                {user.role === 'admin' && (
                  <Badge className="mt-2 bg-red-500 text-white">Admin</Badge>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Free credits:</span>
                  <Badge className={`text-xs px-2 py-0.5 ${(user.freeCredits ?? 0) > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-muted-foreground border-transparent'}`}>
                    {(user.freeCredits ?? 0) > 0 ? `${user.freeCredits} remaining` : '0 remaining'}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => { setShowProfile(false); onOpenSettings(); }}
                variant="ghost"
                className="w-full justify-start text-foreground hover:bg-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => { setShowProfile(false); onLogout(); }}
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-12 page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground">Ready to ace your assignments? Let's get started.</p>
        </motion.div>

        {/* Free credit banner */}
        {user && (user.freeCredits ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <p className="text-sm font-medium text-foreground">
              🎁 You have <span className="font-bold text-emerald-400">1 free assignment</span> — Submit now and get your first document for free!
            </p>
            <Button
              onClick={onSubmitAssignment}
              className="shrink-0 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}
            >
              Claim Free Assignment →
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Total Assignments', value: stats.total, icon: FileText, color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Pending', value: stats.pending, icon: History, color: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Completed', value: stats.completed, icon: Sparkles, color: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-emerald-700 to-emerald-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
            onClick={onSubmitAssignment}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Submit Assignment</h3>
                  <p className="text-white/80">Get AI-powered analysis and pricing instantly</p>
                </div>
                <ChevronRight className="h-8 w-8 text-white/60 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-indigo-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
            onClick={onRequestTopic}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Learn a Topic</h3>
                  <p className="text-white/80">Get a personalised learning document for £20 flat</p>
                </div>
                <ChevronRight className="h-8 w-8 text-white/60 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <History className="h-5 w-5 text-muted-foreground" />
                Recent Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <style>{`.dp{animation:dp 1.5s ease-in-out infinite} .sp{animation:sp 1s linear infinite} @keyframes dp{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes sp{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              {userAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No assignments yet</p>
                  <p className="text-sm">Submit your first assignment above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAssignments.map((assignment) => {
                    const statusMap: Record<string, any> = {
                      pending:    { label: 'Submitted',    bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
                      submitted:  { label: 'Submitted',    bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
                      paid:       { label: 'Paid ✓',       bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', dot: '#3b82f6', pulse: true  },
                      generating: { label: '⚡ Generating',bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: '#c084fc', dot: '#a855f7', pulse: true  },
                      completed:  { label: '✓ Completed',  bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80', dot: '#22c55e', pulse: false },
                    };
                    const cfg = statusMap[assignment.status] || statusMap.pending;
                    const cardBg = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff';
                    const cardBorder = resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb';
                    const titleColor = resolvedTheme === 'dark' ? '#ffffff' : '#111827';
                    const courseColor = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : '#6b7280';
                    const dueDateColor = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#9ca3af';
                    return (
                      <div
                        key={assignment.id}
                        style={{ background: cardBg, border: cardBorder, borderRadius: '14px', padding: '16px', cursor: 'pointer' }}
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
                              <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase' as const }}>{assignment.assignment_type}</span>
                              {assignment.course_name && <span style={{ fontSize: '11px', color: courseColor }}>{assignment.course_name}</span>}
                            </div>
                            <p style={{ fontSize: '13px', color: titleColor, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{assignment.description || 'No description'}</p>
                          </div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '100px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: cfg.text, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                            <span className={cfg.pulse ? 'dp' : ''} style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }}/>
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: dueDateColor, marginBottom: assignment.delivery_url || assignment.status === 'generating' ? '10px' : '0' }}>
                          {assignment.due_date && <span>⏰ Due {assignment.due_date}</span>}
                          {assignment.payment_amount && <span style={{ color: 'rgba(74,222,128,0.6)' }}>£{Number(assignment.payment_amount).toFixed(2)} paid</span>}
                        </div>
                        {assignment.delivery_url && (
                          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: '#86efac' }}>📄 Your document is ready</span>
                            <a href={assignment.delivery_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ background: '#22c55e', color: '#052e16', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}>Open 🔗</a>
                          </div>
                        )}
                        {assignment.status === 'generating' && (
                          <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '10px', padding: '8px 14px', fontSize: '11px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="sp">⚡</span> Claude is generating your document - check back in a minute
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {preferences && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle onClick={() => onOpenSettings()} className="text-lg font-semibold flex items-center gap-2 text-foreground cursor-pointer">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-semibold text-foreground">{preferences.country}</div>
                      <div className="text-xs text-muted-foreground">{preferences.region}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">School Level</div>
                      <div className="font-semibold text-foreground">{preferences.schoolLevel}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Department</div>
                      <div className="font-semibold text-foreground">{preferences.department}</div>
                    </div>
                  </div>
                </div>
                <Button onClick={onSelectRegion} variant="outline" className="mt-6 rounded-xl">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!preferences && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
            <Card className="glass-card border border-emerald-200 dark:border-emerald-900/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-foreground mb-3">Get Started Today</h3>
                <p className="text-muted-foreground mb-6">Select your region and preferences to personalise your experience</p>
                <Button
                  onClick={onSelectRegion}
                  className="rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600"
                >
                  Select Region Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Assignment Detail Drawer */}
      {selectedAssignment && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setSelectedAssignment(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          />
          {/* Drawer */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              maxHeight: '80vh',
              overflowY: 'auto',
              background: resolvedTheme === 'dark' ? 'rgba(15,15,15,0.97)' : '#ffffff',
              borderRadius: '20px 20px 0 0',
              border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : '#d1d5db' }} />
            </div>
            {/* Close button */}
            <button
              onClick={() => setSelectedAssignment(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: resolvedTheme === 'dark' ? '#fff' : '#111827' }}
            >
              ×
            </button>
            {/* Content */}
            <div style={{ padding: '16px 24px 32px' }}>
              {/* Type badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase' as const }}>
                  {selectedAssignment.assignment_type}
                </span>
                {(() => {
                  const statusMap: Record<string, any> = {
                    pending:    { label: 'Submitted',    bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
                    submitted:  { label: 'Submitted',    bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
                    paid:       { label: 'Paid ✓',       bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', dot: '#3b82f6', pulse: true  },
                    generating: { label: '⚡ Generating',bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: '#c084fc', dot: '#a855f7', pulse: true  },
                    completed:  { label: '✓ Completed',  bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80', dot: '#22c55e', pulse: false },
                  };
                  const cfg = statusMap[selectedAssignment.status] || statusMap.pending;
                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '100px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: cfg.text }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>

              {/* Course name */}
              {selectedAssignment.course_name && (
                <p style={{ fontSize: '13px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#6b7280', marginBottom: '8px' }}>
                  📚 {selectedAssignment.course_name}
                </p>
              )}

              {/* Teacher */}
              {selectedAssignment.teacher_name && (
                <p style={{ fontSize: '13px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#6b7280', marginBottom: '8px' }}>
                  👨‍🏫 {selectedAssignment.teacher_name}
                </p>
              )}

              {/* Due date */}
              {selectedAssignment.due_date && (
                <p style={{ fontSize: '13px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#9ca3af', marginBottom: '12px' }}>
                  ⏰ Due: {selectedAssignment.due_date}
                </p>
              )}

              {/* Description */}
              {selectedAssignment.description && (
                <div style={{ background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.75)' : '#374151', lineHeight: 1.6, margin: 0 }}>
                    {selectedAssignment.description}
                  </p>
                </div>
              )}

              {/* Status-specific CTAs */}
              {selectedAssignment.status === 'completed' && selectedAssignment.delivery_url && (
                <div style={{ marginBottom: '16px' }}>
                  <a
                    href={selectedAssignment.delivery_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block', width: '100%', textAlign: 'center', background: 'linear-gradient(135deg, #047857, #22c55e)', color: '#fff', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 800, textDecoration: 'none', boxSizing: 'border-box' as const }}
                  >
                    View Your Document 📄
                  </a>
                  <p style={{ fontSize: '12px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#9ca3af', textAlign: 'center', marginTop: '8px' }}>
                    Your document is ready. Open it in your browser and save it.
                  </p>
                </div>
              )}

              {selectedAssignment.status === 'generating' && (
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#c084fc', fontWeight: 600, marginBottom: '6px' }}>
                    ⚡ Claude is generating your document...
                  </p>
                  <p style={{ fontSize: '12px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>
                    Check back in 1–2 minutes
                  </p>
                </div>
              )}

              {(selectedAssignment.status === 'submitted' || selectedAssignment.status === 'analyzed') && (
                <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 600 }}>
                    ⏳ Awaiting payment confirmation
                  </p>
                </div>
              )}

              {selectedAssignment.status === 'paid' && (
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#60a5fa', fontWeight: 600 }}>
                    ✓ Payment received — generating your document...
                  </p>
                </div>
              )}

              {selectedAssignment.status === 'pending' && (
                <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 600 }}>
                    ⏳ Awaiting payment confirmation
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
