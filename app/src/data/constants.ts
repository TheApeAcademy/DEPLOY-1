import type { RegionData } from '@/types';

export const REGIONS: RegionData[] = [
  {
    region: 'Europe',
    countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Poland'],
  },
  {
    region: 'America',
    countries: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
  },
  {
    region: 'Gulf',
    countries: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
  },
  {
    region: 'Africa',
    countries: ['Nigeria', 'South Africa', 'Egypt', 'Kenya', 'Ghana', 'Morocco', 'Ethiopia', 'Tanzania'],
  },
  {
    region: 'Asia',
    countries: ['China', 'Japan', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia'],
  },
  {
    region: 'Oceania',
    countries: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
  },
];

export const SCHOOL_LEVELS = ['Primary', 'Middle', 'High', 'University'];

export const DEPARTMENTS: { [key: string]: string[] } = {
  Primary: ['General Education'],
  Middle: ['General Education', 'STEM Focus', 'Arts & Humanities'],
  High: ['Science', 'Arts', 'Technology', 'Commercial', 'Engineering'],
  University: [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Medicine',
    'Law',
    'Arts & Humanities',
    'Natural Sciences',
    'Social Sciences',
  ],
};

export const PLATFORMS = ['WhatsApp', 'Email', 'Snapchat', 'Telegram', 'Instagram', 'Discord'];

export const ASSIGNMENT_TYPES = ['Essay', 'Research Paper', 'Project', 'Homework', 'Lab Report', 'Presentation', 'Case Study', 'Thesis', 'Dissertation', 'Other'];

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export const ACTIVITY_TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  user_registered: { label: 'New User', color: 'bg-green-500', icon: '👤' },
  user_login: { label: 'Login', color: 'bg-blue-500', icon: '🔑' },
  user_logout: { label: 'Logout', color: 'bg-gray-500', icon: '🚪' },
  user_updated: { label: 'Profile Updated', color: 'bg-purple-500', icon: '✏️' },
  assignment_created: { label: 'Assignment Created', color: 'bg-yellow-500', icon: '📝' },
  assignment_analyzing: { label: 'AI Analyzing', color: 'bg-indigo-500', icon: '🤖' },
  assignment_analyzed: { label: 'Analysis Complete', color: 'bg-teal-500', icon: '✅' },
  assignment_paid: { label: 'Payment Received', color: 'bg-green-500', icon: '💰' },
  assignment_submitted: { label: 'Assignment Submitted', color: 'bg-blue-500', icon: '📤' },
  assignment_completed: { label: 'Assignment Completed', color: 'bg-green-500', icon: '🎉' },
  assignment_rejected: { label: 'Assignment Rejected', color: 'bg-red-500', icon: '❌' },
  payment_initiated: { label: 'Payment Started', color: 'bg-orange-500', icon: '💳' },
  payment_completed: { label: 'Payment Successful', color: 'bg-green-500', icon: '✅' },
  payment_failed: { label: 'Payment Failed', color: 'bg-red-500', icon: '⚠️' },
  payment_refunded: { label: 'Payment Refunded', color: 'bg-purple-500', icon: '↩️' },
  admin_action: { label: 'Admin Action', color: 'bg-red-500', icon: '🔧' },
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  analyzing: { label: 'Analyzing', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  analyzed: { label: 'Analyzed', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  paid: { label: 'Paid', color: 'text-green-600', bgColor: 'bg-green-100' },
  submitted: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
};

// Admin credentials (for demo purposes)
export const ADMIN_CREDENTIALS = {
  email: 'admin@apeacademy.com',
  password: 'admin123', // In production, this would be hashed
};

// API Placeholders
export const API_PLACEHOLDERS = {
  WISE: {
    API_KEY: 'YOUR_WISE_API_KEY_HERE',
    API_URL: 'https://api.wise.com/v1',
    PROFILE_ID: 'YOUR_WISE_PROFILE_ID_HERE',
  },
  OPENAI: {
    API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    API_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4',
  },
  STRIPE: {
    PUBLIC_KEY: 'YOUR_STRIPE_PUBLIC_KEY_HERE',
    SECRET_KEY: 'YOUR_STRIPE_SECRET_KEY_HERE',
  },
};

// Animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
