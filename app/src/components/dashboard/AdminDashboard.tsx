import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  MessageSquare,
  BookOpen,
  LogOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useAssignments } from '@/hooks/useAssignments';
import type { Assignment } from '@/types';
import { ACTIVITY_TYPE_LABELS, ASSIGNMENT_STATUS_LABELS } from '@/data/constants';
import { getAllUsers } from '@/services/database';
import { fadeInUp, staggerContainer } from '@/data/constants';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // Your contact details — used for quick-contact buttons
  const OWNER_EMAIL = 'j0shbankole19@gmail.com';
  const OWNER_WHATSAPP = '+2349051717561'; // cleaned number
  const OWNER_SNAPCHAT = 'https://www.snapchat.com/add/j0shh.b?share_id=8ht5Xy9NMAA&locale=en-US';

  const buildWhatsAppLink = (assignment: Assignment) => {
    const msg = encodeURIComponent(
      `Hi! I'm contacting you about your ApeAcademy assignment:

` +
      `📚 Course: ${assignment.courseName}
` +
      `📝 Type: ${assignment.assignmentType}
` +
      `🎓 Class: ${assignment.className}
` +
      `👤 Student: ${assignment.userName || 'N/A'}
` +
      `📧 Email: ${assignment.userEmail || 'N/A'}
` +
      `📅 Due: ${assignment.dueDate}
` +
      `🆔 Order ID: ${assignment.id.slice(-8)}

` +
      `Please reply to confirm receipt.`
    );
    const number = (assignment.platformContact || '').replace(/[^0-9+]/g, '');
    return `https://wa.me/${number}?text=${msg}`;
  };

  const buildEmailLink = (assignment: Assignment) => {
    const subject = encodeURIComponent(`ApeAcademy Order #${assignment.id.slice(-8)} — ${assignment.courseName}`);
    const body = encodeURIComponent(
      `Hi ${assignment.userName || 'there'},

` +
      `Thank you for submitting your assignment on ApeAcademy!

` +
      `Order Details:
` +
      `• Course: ${assignment.courseName}
` +
      `• Type: ${assignment.assignmentType}
` +
      `• Class: ${assignment.className}
` +
      `• Teacher: ${assignment.teacherName}
` +
      `• Due Date: ${assignment.dueDate}
` +
      `• Order ID: ${assignment.id.slice(-8)}

` +
      `We are working on your assignment and will deliver it to you shortly.

` +
      `Best regards,
ApeAcademy Team`
    );
    const studentEmail = assignment.platform === 'Email' ? assignment.platformContact : assignment.userEmail;
    return `mailto:${studentEmail}?subject=${subject}&body=${body}`;
  };

  const { stats, chartData, refresh: refreshStats } = useDashboardStats();
  const { logs, filters: logFilters, updateFilters: updateLogFilters, refresh: refreshLogs } = useActivityLogs(100);
  const { assignments, filters: assignmentFilters, updateFilters: updateAssignmentFilters, refresh: refreshAssignments } = useAssignments();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    getAllUsers().then(setUsers);
    fetchSuggestions();
    fetchTopics();
  }, []);

  const handleRefresh = () => {
    refreshStats();
    refreshLogs();
    refreshAssignments();
    getAllUsers().then(setUsers);
    fetchSuggestions();
    fetchTopics();
  };

  const fetchSuggestions = async () => {
    setSuggestionsLoading(true);
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    setSuggestions(data || []);
    setSuggestionsLoading(false);
  };

  const fetchTopics = async () => {
    setTopicsLoading(true);
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false });
    setTopics(data || []);
    setTopicsLoading(false);
  };

  const handleMarkSuggestionRead = async (id: string) => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('suggestions').update({ status: 'read' }).eq('id', id);
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'read' } : s));
  };

  const updateTopicStatus = async (id: string, status: string) => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('topics').update({ status }).eq('id', id);
    setTopics(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateAssignmentStatusAdmin = async (id: string, status: string) => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('assignments').update({ status }).eq('id', id);
    refreshAssignments();
  };

  const handleMarkAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const unreadAlerts = alerts.filter(a => !a.read);

  const StatCard = ({ title, value, icon: Icon, trend, color }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    trend?: string;
    color: string;
  }) => (
    <motion.div variants={fadeInUp}>
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Ape Academy Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="backdrop-blur-xl bg-white/50 border border-white/20 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
              Alerts
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
              Suggestions
              {suggestions.filter(s => s.status === 'unread').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                  {suggestions.filter(s => s.status === 'unread').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="topics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
              Topics
              {topics.filter(t => t.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {topics.filter(t => t.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                trend={`+${stats.newUsersToday} today`}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Assignments"
                value={stats.totalAssignments}
                icon={FileText}
                trend={`+${stats.assignmentsToday} today`}
                color="bg-emerald-500"
              />
              <StatCard
                title="Total Revenue"
                value={`£${stats.totalRevenue.toFixed(2)}`}
                icon={DollarSign}
                trend={`+£${stats.revenueToday.toFixed(2)} today`}
                color="bg-green-500"
              />
              <StatCard
                title="Pending Actions"
                value={stats.pendingAssignments + stats.analyzingAssignments}
                icon={AlertCircle}
                trend={`${stats.analyzingAssignments} analyzing`}
                color="bg-orange-500"
              />
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Assignment Activity (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {chartData.assignments.datasets[0].data.map((value, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(value * 20, 4)}px` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg min-h-[4px]"
                          />
                          <span className="text-xs text-gray-500">{chartData.assignments.labels[index]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
                <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Revenue (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {chartData.revenue.datasets[0].data.map((value, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(value * 2, 4)}px` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg min-h-[4px]"
                          />
                          <span className="text-xs text-gray-500">{chartData.revenue.labels[index]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {logs.slice(0, 5).map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${ACTIVITY_TYPE_LABELS[log.type]?.color || 'bg-gray-500'}`}>
                          {ACTIVITY_TYPE_LABELS[log.type]?.icon || '📋'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{log.description}</p>
                          <p className="text-xs text-gray-500">
                            {log.userName} • {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {ACTIVITY_TYPE_LABELS[log.type]?.label || log.type}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-semibold">All Assignments</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search assignments..."
                        value={assignmentFilters.search}
                        onChange={(e) => updateAssignmentFilters({ search: e.target.value })}
                        className="pl-10 w-64 rounded-xl"
                      />
                    </div>
                    <select
                      value={assignmentFilters.status}
                      onChange={(e) => updateAssignmentFilters({ status: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="analyzing">Analyzing</option>
                      <option value="analyzed">Analyzed</option>
                      <option value="paid">Paid</option>
                      <option value="submitted">Submitted</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-mono text-xs">{assignment.id.slice(-8)}</TableCell>
                          <TableCell>{assignment.userName || 'Unknown'}</TableCell>
                          <TableCell>{assignment.assignmentType}</TableCell>
                          <TableCell>{assignment.courseName}</TableCell>
                          <TableCell>
                            <Badge className={`${ASSIGNMENT_STATUS_LABELS[assignment.status]?.bgColor} ${ASSIGNMENT_STATUS_LABELS[assignment.status]?.color} border-0`}>
                              {ASSIGNMENT_STATUS_LABELS[assignment.status]?.label || assignment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>£{assignment.paymentAmount?.toFixed(2) || '-'}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(assignment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowAssignmentDetails(true);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-mono text-xs">{user.id.slice(-8)}</TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.country || '-'}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-semibold">Activity Log</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search logs..."
                        value={logFilters.search}
                        onChange={(e) => updateLogFilters({ search: e.target.value })}
                        className="pl-10 w-64 rounded-xl"
                      />
                    </div>
                    <select
                      value={logFilters.status}
                      onChange={(e) => updateLogFilters({ status: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                    >
                      <option value="">All Types</option>
                      {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${ACTIVITY_TYPE_LABELS[log.type]?.color || 'bg-gray-500'}`}>
                        {ACTIVITY_TYPE_LABELS[log.type]?.icon || '📋'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{log.description}</p>
                        <p className="text-xs text-gray-500">
                          {log.userName || 'System'} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {ACTIVITY_TYPE_LABELS[log.type]?.label || log.type}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p>No alerts at this time</p>
                    </div>
                  ) : (
                    alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start gap-4 p-4 rounded-xl border ${
                          alert.read ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-purple-200 shadow-sm'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.type === 'error' ? 'bg-red-100 text-red-600' :
                          alert.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                          alert.type === 'success' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.type === 'error' ? <XCircle className="h-5 w-5" /> :
                           alert.type === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                           alert.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                           <Clock className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                            {!alert.read && (
                              <span className="w-2 h-2 bg-red-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!alert.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAlertRead(alert.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="topics" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Topic Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topicsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No topic requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topics.map((t, index) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${
                          t.status === 'pending'
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-gray-50/50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{t.topic_name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{t.subject}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{t.level}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                t.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{t.status}</span>
                            </div>
                            {t.specific_questions && (
                              <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Questions:</span> {t.specific_questions}</p>
                            )}
                            {t.additional_context && (
                              <p className="text-sm text-gray-500 mb-2"><span className="font-medium">Context:</span> {t.additional_context}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                              <span>👤 {t.user_name || 'Anonymous'}</span>
                              <span>📧 {t.user_email || '-'}</span>
                              <span>📱 {t.platform}: {t.platform_contact}</span>
                              <span>🕐 {new Date(t.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {t.status !== 'in_progress' && t.status !== 'completed' && (
                                <Button size="sm" variant="outline"
                                  onClick={() => updateTopicStatus(t.id, 'in_progress')}
                                  className="text-xs rounded-lg border-blue-300 text-blue-600 hover:bg-blue-50">
                                  🔄 Mark In Progress
                                </Button>
                              )}
                              {t.status !== 'completed' && (
                                <Button size="sm" variant="outline"
                                  onClick={() => updateTopicStatus(t.id, 'completed')}
                                  className="text-xs rounded-lg border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                                  ✅ Mark Completed
                                </Button>
                              )}
                              {t.platform === 'WhatsApp' && t.platform_contact && (
                                <a href={`https://wa.me/${t.platform_contact.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent('Hi! Your topic request for "' + t.topic_name + '" is ready. We will send your learning document shortly. 🦍')}`}
                                  target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline"
                                    className="text-xs rounded-lg border-green-300 text-green-600 hover:bg-green-50">
                                    💬 WhatsApp Student
                                  </Button>
                                </a>
                              )}
                              {t.platform === 'Email' && t.platform_contact && (
                                <a href={`mailto:${t.platform_contact}?subject=Your ApeAcademy Topic: ${t.topic_name}&body=Hi! Your learning document for "${t.topic_name}" is ready. We will send it to you shortly. 🦍`}>
                                  <Button size="sm" variant="outline"
                                    className="text-xs rounded-lg border-blue-300 text-blue-600 hover:bg-blue-50">
                                    ✉️ Email Student
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  Student Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No suggestions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((s, index) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border transition-colors ${
                          s.status === 'unread'
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-gray-50/50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 capitalize">
                                {s.category}
                              </span>
                              {s.status === 'unread' && (
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed">{s.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {s.user_name || 'Anonymous'} • {s.user_email || ''} • {new Date(s.created_at).toLocaleString()}
                            </p>
                          </div>
                          {s.status === 'unread' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkSuggestionRead(s.id)}
                              className="text-xs text-emerald-600 hover:text-emerald-700 shrink-0"
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      {/* Assignment Details Dialog */}
      <Dialog open={showAssignmentDetails} onOpenChange={setShowAssignmentDetails}>
        <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/95">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              ID: {selectedAssignment?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">User</label>
                  <p className="font-medium">{selectedAssignment.userName || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Type</label>
                  <p className="font-medium">{selectedAssignment.assignmentType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Course</label>
                  <p className="font-medium">{selectedAssignment.courseName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Class</label>
                  <p className="font-medium">{selectedAssignment.className}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <Badge className={`${ASSIGNMENT_STATUS_LABELS[selectedAssignment.status]?.bgColor} ${ASSIGNMENT_STATUS_LABELS[selectedAssignment.status]?.color} border-0 mt-1`}>
                    {ASSIGNMENT_STATUS_LABELS[selectedAssignment.status]?.label || selectedAssignment.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Payment Amount</label>
                  <p className="font-medium">£{selectedAssignment.paymentAmount?.toFixed(2) || 'Not set'}</p>
                </div>
              </div>
              
              {selectedAssignment.analysis && (
                <div className="p-4 rounded-xl bg-emerald-50">
                  <h4 className="font-semibold text-purple-900 mb-2">AI Analysis</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Complexity:</span>{' '}
                      <span className="capitalize">{selectedAssignment.analysis.complexity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Hours:</span>{' '}
                      {selectedAssignment.analysis.estimatedHours}
                    </div>
                    <div>
                      <span className="text-gray-500">Confidence:</span>{' '}
                      {Math.round(selectedAssignment.analysis.confidence * 100)}%
                    </div>
                    <div>
                      <span className="text-gray-500">In Scope:</span>{' '}
                      {selectedAssignment.analysis.inScope ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedAssignment.description && (
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="text-sm text-gray-700 mt-1">{selectedAssignment.description}</p>
                </div>
              )}

              {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 text-sm">📎 Attached Files ({selectedAssignment.files.length})</h4>
                  <div className="space-y-2">
                    {selectedAssignment.files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">📄</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-400">{file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}</p>
                          </div>
                        </div>
                        {file.url && (
                          <a href={file.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                            style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                            Open
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedAssignment.files || selectedAssignment.files.length === 0) && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-500">
                  📎 No files attached to this assignment
                </div>
              )}

              {/* Contact Student Section */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-1">Contact Student</h4>
                <p className="text-xs text-emerald-700 mb-3">
                  Preferred: <span className="font-bold">{selectedAssignment.platform}</span>
                  {' — '}{selectedAssignment.platformContact}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAssignment.platform === 'WhatsApp' && (
                    <a
                      href={buildWhatsAppLink(selectedAssignment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 4px 12px rgba(37,211,102,0.4)' }}
                    >
                      💬 Message on WhatsApp
                    </a>
                  )}
                  {selectedAssignment.platform === 'Email' && (
                    <a
                      href={buildEmailLink(selectedAssignment)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #4285F4, #1a73e8)', boxShadow: '0 4px 12px rgba(66,133,244,0.4)' }}
                    >
                      ✉️ Send Email
                    </a>
                  )}
                  {selectedAssignment.platform === 'Snapchat' && (
                    <a
                      href={OWNER_SNAPCHAT}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #FFFC00, #FFD700)', color: '#000', boxShadow: '0 4px 12px rgba(255,252,0,0.4)' }}
                    >
                      👻 Open Snapchat — {selectedAssignment.platformContact}
                    </a>
                  )}
                  {/* Always show fallback email to student's account email */}
                  {selectedAssignment.platform !== 'Email' && selectedAssignment.userEmail && (
                    <a
                      href={buildEmailLink(selectedAssignment)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 text-sm font-semibold border border-gray-300 bg-white transition-all hover:scale-105 hover:border-emerald-400"
                    >
                      ✉️ Also email: {selectedAssignment.userEmail}
                    </a>
                  )}
                </div>
              </div>

              {/* Update Assignment Status */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['pending','analyzing','analyzed','submitted','completed','rejected'].map(s => (
                    <Button key={s} size="sm" variant="outline"
                      onClick={() => { updateAssignmentStatusAdmin(selectedAssignment!.id, s); setSelectedAssignment(prev => prev ? {...prev, status: s as any} : prev); }}
                      className={`text-xs rounded-lg capitalize ${selectedAssignment?.status === s ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : ''}`}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Your Details (reminder) */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                <span>📧 Your email: <span className="font-mono text-gray-700">{OWNER_EMAIL}</span></span>
                <span>💬 Your WhatsApp: <span className="font-mono text-gray-700">{OWNER_WHATSAPP}</span></span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
