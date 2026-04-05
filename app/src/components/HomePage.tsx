import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

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
  const { t, i18n } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    setShowLangMenu(false);
  };

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
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="glass w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all text-base"
                title="Toggle dark mode"
              >
                {resolvedTheme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Language switcher */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowLangMenu(v => !v)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 20,
                    padding: '5px 12px',
                    fontSize: 12,
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.code.toUpperCase()}</span>
                </button>

                {showLangMenu && (
                  <>
                    <div
                      onClick={() => setShowLangMenu(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '110%',
                      right: 0,
                      background: resolvedTheme === 'dark' ? '#1a1a2e' : '#ffffff',
                      border: '1px solid rgba(128,128,128,0.2)',
                      borderRadius: 12,
                      padding: 6,
                      zIndex: 20,
                      minWidth: 155,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                    }}>
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => switchLanguage(lang.code)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            padding: '8px 12px',
                            background: lang.code === i18n.language
                              ? 'rgba(34,197,94,0.12)'
                              : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: 13,
                            borderRadius: 8,
                            textAlign: 'left',
                            fontWeight: lang.code === i18n.language ? 700 : 400,
                          }}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* User avatar */}
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
                {t('nav.settings')}
              </Button>
              <Button
                onClick={() => { setShowProfile(false); onLogout(); }}
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-12 page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'Student' })} 👋
          </h1>
          <p className="text-muted-foreground">{t('dashboard.ready')}</p>
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
            { label: t('dashboard.totalAssignments'), value: stats.total,     icon: FileText, color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-700 dark:text-emerald-400' },
            { label: t('dashboard.pending'),          value: stats.pending,   icon: History,  color: 'bg-yellow-100 dark:bg-yellow-900/30',  iconColor: 'text-yellow-600 dark:text-yellow-400'  },
            { label: t('dashboard.completed'),        value: stats.completed, icon: Sparkles, color: 'bg-green-100 dark:bg-green-900/30',   iconColor: 'text-green-600 dark:text-green-400'   },
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
          <Card
            className="bg-gradient-to-br from-emerald-700 to-emerald-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
            onClick={onSubmitAssignment}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('dashboard.submitAssignment')}</h3>
                  <p className="text-white/80">{t('dashboard.submitSubtitle')}</p>
                </div>
                <ChevronRight className="h-8 w-8 text-white/60 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-blue-600 to-indigo-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
            onClick={onRequestTopic}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('dashboard.learnTopic')}</h3>
                  <p className="text-white/80">{t('dashboard.learnSubtitle')}</p>
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
                {t('dashboard.recentAssignments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <style>{`.dp{animation:dp 1.5s ease-in-out infinite} .sp{animation:sp 1s linear infinite} @keyframes dp{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes sp{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              {userAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{t('dashboard.noAssignments')}</p>
                  <p className="text-sm">{t('dashboard.noAssignmentsSubtitle')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAssignments.map((assignment) => {
                    const statusMap: Record<string, any> = {
                      pending:    { label: t('status.pending'),    bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
                      submitted:  { label: t('status.submitted'),  bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
                      paid:       { label: t('status.paid'),       bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', dot: '#3b82f6', pulse: true  },
                      generating: { label: t('status.generating'), bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: '#c084fc', dot: '#a855f7', pulse: true  },
                      completed:  { label: t('status.completed'),  bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80', dot: '#22c55e', pulse: false },
                    };
                    const cfg = statusMap[assignment.status] || statusMap.pending;
                    return (
                      <div
                        key={assignment.id}
                        onClick={() => setSelectedAssignment(assignment)}
                        style={{ background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '16px', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
                              <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, color: resolvedTheme === 'dark' ? '#4ade80' : '#15803d', textTransform: 'uppercase' as const }}>{assignment.assignment_type}</span>
                              {assignment.course_name && <span style={{ fontSize: '11px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#6b7280' }}>{assignment.course_name}</span>}
                            </div>
                            <p style={{ fontSize: '13px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.65)' : '#374151', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{assignment.description || 'No description'}</p>
                          </div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '100px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: cfg.text, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                            <span className={cfg.pulse ? 'dp' : ''} style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }}/>
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.3)' : '#9ca3af', marginBottom: assignment.delivery_url || assignment.status === 'generating' ? '10px' : '0' }}>
                          {assignment.due_date && <span>⏰ Due {assignment.due_date}</span>}
                          {assignment.payment_amount && <span style={{ color: 'rgba(74,222,128,0.6)' }}>£{Number(assignment.payment_amount).toFixed(2)} paid</span>}
                        </div>
                        {assignment.delivery_url && (
                          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: '#86efac' }}>📄 Your document is ready</span>
                            <a href={assignment.delivery_url} target="_blank" rel="noreferrer" style={{ background: '#22c55e', color: '#052e16', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}>Open 🔗</a>
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
                <CardTitle onClick={onOpenSettings} className="text-lg font-semibold flex items-center gap-2 text-foreground cursor-pointer">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  {t('dashboard.yourPreferences')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{t('dashboard.location')}</div>
                      <div className="font-semibold text-foreground">{preferences.country}</div>
                      <div className="text-xs text-muted-foreground">{preferences.region}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{t('dashboard.schoolLevel')}</div>
                      <div className="font-semibold text-foreground">{preferences.schoolLevel}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{t('dashboard.department')}</div>
                      <div className="font-semibold text-foreground">{preferences.department}</div>
                    </div>
                  </div>
                </div>
                <Button onClick={onSelectRegion} variant="outline" className="mt-6 rounded-xl">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('dashboard.updatePreferences')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!preferences && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
            <Card className="glass-card border border-emerald-200 dark:border-emerald-900/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-foreground mb-3">{t('dashboard.getStarted')}</h3>
                <p className="text-muted-foreground mb-6">{t('dashboard.getStartedSubtitle')}</p>
                <Button
                  onClick={onSelectRegion}
                  className="rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600"
                >
                  {t('dashboard.selectRegion')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Assignment detail drawer */}
      {selectedAssignment && (
        <>
          <div
            onClick={() => setSelectedAssignment(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            background: resolvedTheme === 'dark' ? '#1a1a2e' : '#ffffff',
            borderRadius: '20px 20px 0 0',
            maxHeight: '80vh', overflowY: 'auto',
            padding: '24px 20px 40px',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width: 40, height: 4, background: '#ccc', borderRadius: 2, margin: '0 auto 20px' }} />
            <button
              onClick={() => setSelectedAssignment(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: 'inherit' }}
            >✕</button>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                {selectedAssignment.assignment_type}
              </span>
              <span style={{ fontSize: 12, color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#6b7280' }}>
                {selectedAssignment.course_name}
              </span>
            </div>

            <div style={{ fontSize: 13, color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#6b7280', marginBottom: 8 }}>
              Teacher: {selectedAssignment.teacher_name || 'N/A'} · Due: {selectedAssignment.due_date || 'N/A'}
            </div>

            <div style={{ fontSize: 14, color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.8)' : '#374151', lineHeight: 1.7, marginBottom: 20, background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9fafb', padding: 14, borderRadius: 10 }}>
              {selectedAssignment.description || 'No description provided.'}
            </div>

            {selectedAssignment.status === 'completed' && selectedAssignment.delivery_url && (
              <div>
                <a href={selectedAssignment.delivery_url} target="_blank" rel="noreferrer" style={{ display: 'block', background: '#22c55e', color: 'white', textAlign: 'center', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 10 }}>
                  View Your Document
                </a>
                <p style={{ fontSize: 12, color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#9ca3af', textAlign: 'center' }}>
                  Open in browser and press Ctrl+S to save offline
                </p>
              </div>
            )}
            {selectedAssignment.status === 'generating' && (
              <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, padding: 14, textAlign: 'center', color: '#c084fc', fontSize: 13 }}>
                Claude is generating your document. Check back in 1-2 minutes.
              </div>
            )}
            {(selectedAssignment.status === 'submitted' || selectedAssignment.status === 'analyzed') && (
              <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, padding: 14, textAlign: 'center', color: '#ca8a04', fontSize: 13 }}>
                Awaiting payment confirmation
              </div>
            )}
            {selectedAssignment.status === 'paid' && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: 14, textAlign: 'center', color: '#22c55e', fontSize: 13 }}>
                Payment received - generating your document...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
