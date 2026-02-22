// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  region?: string;
  country?: string;
  schoolLevel?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

// File Types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  url?: string;
  publicId?: string;
  uploadError?: string;
}

// Assignment Types
export type AssignmentStatus = 'pending' | 'analyzing' | 'analyzed' | 'paid' | 'submitted' | 'completed' | 'rejected';

export interface Assignment {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  assignmentType: string;
  courseName: string;
  className: string;
  teacherName: string;
  dueDate: string;
  platform: string;
  platformContact: string;
  description?: string;
  files: FileInfo[];
  status: AssignmentStatus;
  createdAt: string;
  updatedAt?: string;
  paymentId?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  // AI Analysis
  analysis?: AIAnalysis;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  assignmentId: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  estimatedCost: number;
  currency: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedHours: number;
  wordCount?: number;
  pageCount?: number;
  subjectArea?: string;
  requirements: string[];
  inScope: boolean;
  outOfScopeReason?: string;
  confidence: number;
  createdAt: string;
  completedAt?: string;
}

// Payment Types
export interface Payment {
  id: string;
  assignmentId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  provider: 'wise' | 'stripe' | 'paypal';
  providerTransactionId?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: PaymentMetadata;
}

export interface PaymentMetadata {
  wiseQuoteId?: string;
  wiseTransferId?: string;
  exchangeRate?: number;
  fee?: number;
  recipientAmount?: number;
  recipientCurrency?: string;
}

// Activity Log Types
export type ActivityType = 
  | 'user_registered' 
  | 'user_login' 
  | 'user_logout' 
  | 'user_updated'
  | 'assignment_created'
  | 'assignment_analyzing'
  | 'assignment_analyzed'
  | 'assignment_paid'
  | 'assignment_submitted'
  | 'assignment_completed'
  | 'assignment_rejected'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'payment_refunded'
  | 'admin_action';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  userId?: string;
  userName?: string;
  userEmail?: string;
  assignmentId?: string;
  paymentId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

// Region Types
export interface RegionData {
  region: string;
  countries: string[];
}

export interface UserPreferences {
  region: string;
  country: string;
  schoolLevel: string;
  department: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalAssignments: number;
  totalRevenue: number;
  pendingAssignments: number;
  analyzingAssignments: number;
  completedAssignments: number;
  failedPayments: number;
  newUsersToday: number;
  assignmentsToday: number;
  revenueToday: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// Alert Types
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Wise API Types
export interface WiseQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  exchangeRate: number;
  fee: number;
  estimatedDelivery: string;
}

export interface WiseTransfer {
  id: string;
  quoteId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

// Filter Types
export interface TableFilters {
  search: string;
  status: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
