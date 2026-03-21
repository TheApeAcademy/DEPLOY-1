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
  BookOpen,
  Sun,
  Moon
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
  const { resolvedTheme, toggleTheme } = useTheme();

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
              <button
                onClick={toggleTheme}
                className="glass w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                title="Toggle dark mode"
              >
                {resolvedTheme === 'dark'
                  ? <Sun className="h-4 w-4 text-emerald-400" />
                  : <Moon className="h-4 w-4 text-emerald-700" />}
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
                onClick={onLogout}
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
                  <p className="text-white/80">Get a personalised learning document — £20 flat</p>
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
              {recentAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No assignments yet</p>
                  <p className="text-sm">Submit your first assignment above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/8 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{assignment.course_name}</p>
                        <p className="text-sm text-muted-foreground">{assignment.assignment_type}</p>
                      </div>
                      <Badge className={`${ASSIGNMENT_STATUS_LABELS[assignment.status]?.bgColor} ${ASSIGNMENT_STATUS_LABELS[assignment.status]?.color} border-0`}>
                        {ASSIGNMENT_STATUS_LABELS[assignment.status]?.label || assignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {preferences && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
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
    </div>
  );
}
