import type { User, Assignment, UserPreferences, ActivityLog, Payment, Alert, AIAnalysis } from '@/types';

const STORAGE_KEYS = {
  USER: 'apeacademy_user',
  USERS: 'apeacademy_users',
  PREFERENCES: 'apeacademy_preferences',
  ASSIGNMENTS: 'apeacademy_assignments',
  AUTH_TOKEN: 'apeacademy_token',
  ACTIVITY_LOGS: 'apeacademy_activity_logs',
  PAYMENTS: 'apeacademy_payments',
  ANALYSES: 'apeacademy_analyses',
  ALERTS: 'apeacademy_alerts',
};

// ==================== USER AUTHENTICATION ====================

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `token_${user.id}`);
  
  // Also add to users list for admin
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

export const getAllUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const logout = (): void => {
  const user = getUser();
  if (user) {
    logActivity({
      type: 'user_logout',
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      description: `${user.name} logged out`,
    });
  }
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin';
};

// ==================== USER PREFERENCES ====================

export const savePreferences = (preferences: UserPreferences): void => {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  
  const user = getUser();
  if (user) {
    const updatedUser = { 
      ...user, 
      region: preferences.region,
      country: preferences.country,
      schoolLevel: preferences.schoolLevel,
      department: preferences.department,
    };
    saveUser(updatedUser);
  }
};

export const getPreferences = (): UserPreferences | null => {
  const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  return prefs ? JSON.parse(prefs) : null;
};

// ==================== ASSIGNMENTS ====================

export const saveAssignment = (assignment: Assignment): void => {
  const assignments = getAssignments();
  const existingIndex = assignments.findIndex(a => a.id === assignment.id);
  if (existingIndex >= 0) {
    assignments[existingIndex] = { ...assignments[existingIndex], ...assignment, updatedAt: new Date().toISOString() };
  } else {
    assignments.push(assignment);
  }
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
};

export const getAssignments = (): Assignment[] => {
  const assignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return assignments ? JSON.parse(assignments) : [];
};

export const getAssignmentById = (id: string): Assignment | null => {
  const assignments = getAssignments();
  return assignments.find(a => a.id === id) || null;
};

export const updateAssignment = (id: string, updates: Partial<Assignment>): void => {
  const assignments = getAssignments();
  const index = assignments.findIndex(a => a.id === id);
  if (index !== -1) {
    assignments[index] = { ...assignments[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }
};

export const getUserAssignments = (userId: string): Assignment[] => {
  return getAssignments().filter(a => a.userId === userId);
};

export const deleteAssignment = (id: string): void => {
  const assignments = getAssignments().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
};

// ==================== AI ANALYSIS ====================

export const saveAnalysis = (analysis: AIAnalysis): void => {
  const analyses = getAnalyses();
  const existingIndex = analyses.findIndex(a => a.id === analysis.id);
  if (existingIndex >= 0) {
    analyses[existingIndex] = analysis;
  } else {
    analyses.push(analysis);
  }
  localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
};

export const getAnalyses = (): AIAnalysis[] => {
  const analyses = localStorage.getItem(STORAGE_KEYS.ANALYSES);
  return analyses ? JSON.parse(analyses) : [];
};

export const getAnalysisByAssignmentId = (assignmentId: string): AIAnalysis | null => {
  const analyses = getAnalyses();
  return analyses.find(a => a.assignmentId === assignmentId) || null;
};

// ==================== PAYMENTS ====================

export const savePayment = (payment: Payment): void => {
  const payments = getPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const getPayments = (): Payment[] => {
  const payments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return payments ? JSON.parse(payments) : [];
};

export const getPaymentById = (id: string): Payment | null => {
  const payments = getPayments();
  return payments.find(p => p.id === id) || null;
};

export const getPaymentsByAssignmentId = (assignmentId: string): Payment[] => {
  return getPayments().filter(p => p.assignmentId === assignmentId);
};

// ==================== ACTIVITY LOGS ====================

export const logActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>): void => {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    ...activity,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog); // Add to beginning
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.pop();
  }
  
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
};

export const getActivityLogs = (): ActivityLog[] => {
  const logs = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
  return logs ? JSON.parse(logs) : [];
};

export const getRecentActivityLogs = (limit: number = 50): ActivityLog[] => {
  return getActivityLogs().slice(0, limit);
};

export const clearActivityLogs = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
};

// ==================== ALERTS ====================

export const addAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>): void => {
  const alerts = getAlerts();
  const newAlert: Alert = {
    ...alert,
    id: `alert_${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  alerts.unshift(newAlert);
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
};

export const getAlerts = (): Alert[] => {
  const alerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
  return alerts ? JSON.parse(alerts) : [];
};

export const markAlertAsRead = (id: string): void => {
  const alerts = getAlerts();
  const index = alerts.findIndex(a => a.id === id);
  if (index !== -1) {
    alerts[index].read = true;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }
};

export const deleteAlert = (id: string): void => {
  const alerts = getAlerts().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
};

// ==================== DASHBOARD STATS ====================

export const getDashboardStats = () => {
  const users = getAllUsers();
  const assignments = getAssignments();
  const payments = getPayments();
  const logs = getActivityLogs();
  
  const today = new Date().toISOString().split('T')[0];
  
  const newUsersToday = users.filter(u => u.createdAt?.startsWith(today)).length;
  const assignmentsToday = logs.filter(l => 
    l.type === 'assignment_created' && l.timestamp.startsWith(today)
  ).length;
  
  const revenueToday = payments
    .filter(p => p.status === 'completed' && p.createdAt.startsWith(today))
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalUsers: users.length,
    totalAssignments: assignments.length,
    totalRevenue,
    pendingAssignments: assignments.filter(a => a.status === 'pending').length,
    analyzingAssignments: assignments.filter(a => a.status === 'analyzing').length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    newUsersToday,
    assignmentsToday,
    revenueToday,
  };
};

// ==================== INITIALIZATION ====================

export const initializeDemoData = (): void => {
  // Check if already initialized
  if (localStorage.getItem('apeacademy_initialized')) return;
  
  // Create admin user
  const adminUser: User = {
    id: 'admin_001',
    name: 'Admin User',
    email: 'admin@apeacademy.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  
  const users = [adminUser];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Add some sample activity logs
  logActivity({
    type: 'admin_action',
    userId: adminUser.id,
    userName: adminUser.name,
    userEmail: adminUser.email,
    description: 'System initialized with demo data',
  });
  
  localStorage.setItem('apeacademy_initialized', 'true');
};
