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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { User, UserPreferences } from '@/types';
import { ASSIGNMENT_STATUS_LABELS } from '@/data/constants';
import { getUserAssignments } from '@/utils/storage';

interface HomePageProps {
  user: User | null;
  preferences: UserPreferences | null;
  onSubmitAssignment: () => void;
  onSelectRegion: () => void;
  onLogin: () => void;
  onLogout: () => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
}

export function HomePage({
  user,
  preferences,
  onSubmitAssignment,
  onSelectRegion,
  onLogin,
  onLogout,
  showProfile,
  setShowProfile,
}: HomePageProps) {
  const userAssignments = user ? getUserAssignments(user.id) : [];
  const recentAssignments = userAssignments.slice(0, 3);

  const stats = {
    total: userAssignments.length,
    pending: userAssignments.filter(a => a.status === 'pending' || a.status === 'analyzing').length,
    completed: userAssignments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-40">
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
              <span className="text-2xl font-bold text-gray-900">ApeAcademy</span>
            </div>

            <button
              onClick={() => (user ? setShowProfile(!showProfile) : onLogin())}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <UserIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Dropdown */}
      {showProfile && user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-6 z-50"
        >
          <div className="backdrop-blur-2xl bg-white/95 rounded-2xl border border-white/20 shadow-xl p-4 w-64">
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-200">
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                {user.role === 'admin' && (
                  <Badge className="mt-2 bg-red-500 text-white">Admin</Badge>
                )}
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to ace your assignments? Let's get started.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Assignments</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <History className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences Card */}
        {preferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-semibold text-gray-900">{preferences.country}</div>
                      <div className="text-xs text-gray-500">{preferences.region}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">School Level</div>
                      <div className="font-semibold text-gray-900">{preferences.schoolLevel}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Department</div>
                      <div className="font-semibold text-gray-900">{preferences.department}</div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onSelectRegion}
                  variant="outline"
                  className="mt-6 rounded-xl"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Submit Assignment Card */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-700 to-emerald-500 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
            onClick={onSubmitAssignment}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Submit Assignment
                  </h3>
                  <p className="text-white/80">
                    Get AI-powered analysis and pricing for your assignment
                  </p>
                </div>
                <ChevronRight className="h-8 w-8 text-white/60 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Assignments Card */}
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                Recent Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No assignments yet</p>
                  <p className="text-sm">Submit your first assignment above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{assignment.courseName}</p>
                        <p className="text-sm text-gray-500">{assignment.assignmentType}</p>
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

        {/* Info Section */}
        {!preferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Get Started Today
                </h3>
                <p className="text-gray-600 mb-6">
                  Select your region and preferences to personalize your experience
                </p>
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
