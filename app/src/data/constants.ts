import type { RegionData } from '@/types';

export const REGIONS: RegionData[] = [
  {
    region: 'Europe',
    countries: [
      'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
      'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
      'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland',
      'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg',
      'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia',
      'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia',
      'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom',
    ],
  },
  {
    region: 'North America',
    countries: [
      'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica',
      'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala',
      'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama',
      'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
      'Trinidad and Tobago', 'United States',
    ],
  },
  {
    region: 'South America',
    countries: [
      'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador',
      'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela',
    ],
  },
  {
    region: 'Africa',
    countries: [
      'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde',
      'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'DR Congo',
      'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia',
      'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya',
      'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
      'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
      'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
      'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia',
      'Uganda', 'Zambia', 'Zimbabwe',
    ],
  },
  {
    region: 'Middle East',
    countries: [
      'Bahrain', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon',
      'Oman', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey',
      'United Arab Emirates', 'Yemen',
    ],
  },
  {
    region: 'Asia',
    countries: [
      'Afghanistan', 'Armenia', 'Azerbaijan', 'Bangladesh', 'Bhutan', 'Brunei',
      'Cambodia', 'China', 'Georgia', 'India', 'Indonesia', 'Japan', 'Kazakhstan',
      'Kyrgyzstan', 'Laos', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal',
      'North Korea', 'Pakistan', 'Philippines', 'Singapore', 'South Korea', 'Sri Lanka',
      'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkmenistan', 'Uzbekistan', 'Vietnam',
    ],
  },
  {
    region: 'Oceania',
    countries: [
      'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru',
      'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands',
      'Tonga', 'Tuvalu', 'Vanuatu',
    ],
  },
];

export const COUNTRY_DATA: Record<string, { flag: string; currency: string }> = {
  // Europe
  'Albania': { flag: '🇦🇱', currency: 'ALL' }, 'Andorra': { flag: '🇦🇩', currency: 'EUR' },
  'Austria': { flag: '🇦🇹', currency: 'EUR' }, 'Belarus': { flag: '🇧🇾', currency: 'BYN' },
  'Belgium': { flag: '🇧🇪', currency: 'EUR' }, 'Bosnia and Herzegovina': { flag: '🇧🇦', currency: 'BAM' },
  'Bulgaria': { flag: '🇧🇬', currency: 'BGN' }, 'Croatia': { flag: '🇭🇷', currency: 'EUR' },
  'Cyprus': { flag: '🇨🇾', currency: 'EUR' }, 'Czech Republic': { flag: '🇨🇿', currency: 'CZK' },
  'Denmark': { flag: '🇩🇰', currency: 'DKK' }, 'Estonia': { flag: '🇪🇪', currency: 'EUR' },
  'Finland': { flag: '🇫🇮', currency: 'EUR' }, 'France': { flag: '🇫🇷', currency: 'EUR' },
  'Germany': { flag: '🇩🇪', currency: 'EUR' }, 'Greece': { flag: '🇬🇷', currency: 'EUR' },
  'Hungary': { flag: '🇭🇺', currency: 'HUF' }, 'Iceland': { flag: '🇮🇸', currency: 'ISK' },
  'Ireland': { flag: '🇮🇪', currency: 'EUR' }, 'Italy': { flag: '🇮🇹', currency: 'EUR' },
  'Kosovo': { flag: '🇽🇰', currency: 'EUR' }, 'Latvia': { flag: '🇱🇻', currency: 'EUR' },
  'Liechtenstein': { flag: '🇱🇮', currency: 'CHF' }, 'Lithuania': { flag: '🇱🇹', currency: 'EUR' },
  'Luxembourg': { flag: '🇱🇺', currency: 'EUR' }, 'Malta': { flag: '🇲🇹', currency: 'EUR' },
  'Moldova': { flag: '🇲🇩', currency: 'MDL' }, 'Monaco': { flag: '🇲🇨', currency: 'EUR' },
  'Montenegro': { flag: '🇲🇪', currency: 'EUR' }, 'Netherlands': { flag: '🇳🇱', currency: 'EUR' },
  'North Macedonia': { flag: '🇲🇰', currency: 'MKD' }, 'Norway': { flag: '🇳🇴', currency: 'NOK' },
  'Poland': { flag: '🇵🇱', currency: 'PLN' }, 'Portugal': { flag: '🇵🇹', currency: 'EUR' },
  'Romania': { flag: '🇷🇴', currency: 'RON' }, 'Russia': { flag: '🇷🇺', currency: 'RUB' },
  'San Marino': { flag: '🇸🇲', currency: 'EUR' }, 'Serbia': { flag: '🇷🇸', currency: 'RSD' },
  'Slovakia': { flag: '🇸🇰', currency: 'EUR' }, 'Slovenia': { flag: '🇸🇮', currency: 'EUR' },
  'Spain': { flag: '🇪🇸', currency: 'EUR' }, 'Sweden': { flag: '🇸🇪', currency: 'SEK' },
  'Switzerland': { flag: '🇨🇭', currency: 'CHF' }, 'Ukraine': { flag: '🇺🇦', currency: 'UAH' },
  'United Kingdom': { flag: '🇬🇧', currency: 'GBP' },
  // North America
  'Antigua and Barbuda': { flag: '🇦🇬', currency: 'XCD' }, 'Bahamas': { flag: '🇧🇸', currency: 'BSD' },
  'Barbados': { flag: '🇧🇧', currency: 'BBD' }, 'Belize': { flag: '🇧🇿', currency: 'BZD' },
  'Canada': { flag: '🇨🇦', currency: 'CAD' }, 'Costa Rica': { flag: '🇨🇷', currency: 'CRC' },
  'Cuba': { flag: '🇨🇺', currency: 'CUP' }, 'Dominica': { flag: '🇩🇲', currency: 'XCD' },
  'Dominican Republic': { flag: '🇩🇴', currency: 'DOP' }, 'El Salvador': { flag: '🇸🇻', currency: 'USD' },
  'Grenada': { flag: '🇬🇩', currency: 'XCD' }, 'Guatemala': { flag: '🇬🇹', currency: 'GTQ' },
  'Haiti': { flag: '🇭🇹', currency: 'HTG' }, 'Honduras': { flag: '🇭🇳', currency: 'HNL' },
  'Jamaica': { flag: '🇯🇲', currency: 'JMD' }, 'Mexico': { flag: '🇲🇽', currency: 'MXN' },
  'Nicaragua': { flag: '🇳🇮', currency: 'NIO' }, 'Panama': { flag: '🇵🇦', currency: 'PAB' },
  'Saint Kitts and Nevis': { flag: '🇰🇳', currency: 'XCD' }, 'Saint Lucia': { flag: '🇱🇨', currency: 'XCD' },
  'Saint Vincent and the Grenadines': { flag: '🇻🇨', currency: 'XCD' },
  'Trinidad and Tobago': { flag: '🇹🇹', currency: 'TTD' }, 'United States': { flag: '🇺🇸', currency: 'USD' },
  // South America
  'Argentina': { flag: '🇦🇷', currency: 'ARS' }, 'Bolivia': { flag: '🇧🇴', currency: 'BOB' },
  'Brazil': { flag: '🇧🇷', currency: 'BRL' }, 'Chile': { flag: '🇨🇱', currency: 'CLP' },
  'Colombia': { flag: '🇨🇴', currency: 'COP' }, 'Ecuador': { flag: '🇪🇨', currency: 'USD' },
  'Guyana': { flag: '🇬🇾', currency: 'GYD' }, 'Paraguay': { flag: '🇵🇾', currency: 'PYG' },
  'Peru': { flag: '🇵🇪', currency: 'PEN' }, 'Suriname': { flag: '🇸🇷', currency: 'SRD' },
  'Uruguay': { flag: '🇺🇾', currency: 'UYU' }, 'Venezuela': { flag: '🇻🇪', currency: 'VES' },
  // Africa
  'Algeria': { flag: '🇩🇿', currency: 'DZD' }, 'Angola': { flag: '🇦🇴', currency: 'AOA' },
  'Benin': { flag: '🇧🇯', currency: 'XOF' }, 'Botswana': { flag: '🇧🇼', currency: 'BWP' },
  'Burkina Faso': { flag: '🇧🇫', currency: 'XOF' }, 'Burundi': { flag: '🇧🇮', currency: 'BIF' },
  'Cabo Verde': { flag: '🇨🇻', currency: 'CVE' }, 'Cameroon': { flag: '🇨🇲', currency: 'XAF' },
  'Central African Republic': { flag: '🇨🇫', currency: 'XAF' }, 'Chad': { flag: '🇹🇩', currency: 'XAF' },
  'Comoros': { flag: '🇰🇲', currency: 'KMF' }, 'Congo': { flag: '🇨🇬', currency: 'XAF' },
  'DR Congo': { flag: '🇨🇩', currency: 'CDF' }, 'Djibouti': { flag: '🇩🇯', currency: 'DJF' },
  'Egypt': { flag: '🇪🇬', currency: 'EGP' }, 'Equatorial Guinea': { flag: '🇬🇶', currency: 'XAF' },
  'Eritrea': { flag: '🇪🇷', currency: 'ERN' }, 'Eswatini': { flag: '🇸🇿', currency: 'SZL' },
  'Ethiopia': { flag: '🇪🇹', currency: 'ETB' }, 'Gabon': { flag: '🇬🇦', currency: 'XAF' },
  'Gambia': { flag: '🇬🇲', currency: 'GMD' }, 'Ghana': { flag: '🇬🇭', currency: 'GHS' },
  'Guinea': { flag: '🇬🇳', currency: 'GNF' }, 'Guinea-Bissau': { flag: '🇬🇼', currency: 'XOF' },
  'Ivory Coast': { flag: '🇨🇮', currency: 'XOF' }, 'Kenya': { flag: '🇰🇪', currency: 'KES' },
  'Lesotho': { flag: '🇱🇸', currency: 'LSL' }, 'Liberia': { flag: '🇱🇷', currency: 'LRD' },
  'Libya': { flag: '🇱🇾', currency: 'LYD' }, 'Madagascar': { flag: '🇲🇬', currency: 'MGA' },
  'Malawi': { flag: '🇲🇼', currency: 'MWK' }, 'Mali': { flag: '🇲🇱', currency: 'XOF' },
  'Mauritania': { flag: '🇲🇷', currency: 'MRU' }, 'Mauritius': { flag: '🇲🇺', currency: 'MUR' },
  'Morocco': { flag: '🇲🇦', currency: 'MAD' }, 'Mozambique': { flag: '🇲🇿', currency: 'MZN' },
  'Namibia': { flag: '🇳🇦', currency: 'NAD' }, 'Niger': { flag: '🇳🇪', currency: 'XOF' },
  'Nigeria': { flag: '🇳🇬', currency: 'NGN' }, 'Rwanda': { flag: '🇷🇼', currency: 'RWF' },
  'São Tomé and Príncipe': { flag: '🇸🇹', currency: 'STN' }, 'Senegal': { flag: '🇸🇳', currency: 'XOF' },
  'Seychelles': { flag: '🇸🇨', currency: 'SCR' }, 'Sierra Leone': { flag: '🇸🇱', currency: 'SLL' },
  'Somalia': { flag: '🇸🇴', currency: 'SOS' }, 'South Africa': { flag: '🇿🇦', currency: 'ZAR' },
  'South Sudan': { flag: '🇸🇸', currency: 'SSP' }, 'Sudan': { flag: '🇸🇩', currency: 'SDG' },
  'Tanzania': { flag: '🇹🇿', currency: 'TZS' }, 'Togo': { flag: '🇹🇬', currency: 'XOF' },
  'Tunisia': { flag: '🇹🇳', currency: 'TND' }, 'Uganda': { flag: '🇺🇬', currency: 'UGX' },
  'Zambia': { flag: '🇿🇲', currency: 'ZMW' }, 'Zimbabwe': { flag: '🇿🇼', currency: 'ZWL' },
  // Middle East
  'Bahrain': { flag: '🇧🇭', currency: 'BHD' }, 'Iran': { flag: '🇮🇷', currency: 'IRR' },
  'Iraq': { flag: '🇮🇶', currency: 'IQD' }, 'Israel': { flag: '🇮🇱', currency: 'ILS' },
  'Jordan': { flag: '🇯🇴', currency: 'JOD' }, 'Kuwait': { flag: '🇰🇼', currency: 'KWD' },
  'Lebanon': { flag: '🇱🇧', currency: 'LBP' }, 'Oman': { flag: '🇴🇲', currency: 'OMR' },
  'Palestine': { flag: '🇵🇸', currency: 'ILS' }, 'Qatar': { flag: '🇶🇦', currency: 'QAR' },
  'Saudi Arabia': { flag: '🇸🇦', currency: 'SAR' }, 'Syria': { flag: '🇸🇾', currency: 'SYP' },
  'Turkey': { flag: '🇹🇷', currency: 'TRY' }, 'United Arab Emirates': { flag: '🇦🇪', currency: 'AED' },
  'Yemen': { flag: '🇾🇪', currency: 'YER' },
  // Asia
  'Afghanistan': { flag: '🇦🇫', currency: 'AFN' }, 'Armenia': { flag: '🇦🇲', currency: 'AMD' },
  'Azerbaijan': { flag: '🇦🇿', currency: 'AZN' }, 'Bangladesh': { flag: '🇧🇩', currency: 'BDT' },
  'Bhutan': { flag: '🇧🇹', currency: 'BTN' }, 'Brunei': { flag: '🇧🇳', currency: 'BND' },
  'Cambodia': { flag: '🇰🇭', currency: 'KHR' }, 'China': { flag: '🇨🇳', currency: 'CNY' },
  'Georgia': { flag: '🇬🇪', currency: 'GEL' }, 'India': { flag: '🇮🇳', currency: 'INR' },
  'Indonesia': { flag: '🇮🇩', currency: 'IDR' }, 'Japan': { flag: '🇯🇵', currency: 'JPY' },
  'Kazakhstan': { flag: '🇰🇿', currency: 'KZT' }, 'Kyrgyzstan': { flag: '🇰🇬', currency: 'KGS' },
  'Laos': { flag: '🇱🇦', currency: 'LAK' }, 'Malaysia': { flag: '🇲🇾', currency: 'MYR' },
  'Maldives': { flag: '🇲🇻', currency: 'MVR' }, 'Mongolia': { flag: '🇲🇳', currency: 'MNT' },
  'Myanmar': { flag: '🇲🇲', currency: 'MMK' }, 'Nepal': { flag: '🇳🇵', currency: 'NPR' },
  'North Korea': { flag: '🇰🇵', currency: 'KPW' }, 'Pakistan': { flag: '🇵🇰', currency: 'PKR' },
  'Philippines': { flag: '🇵🇭', currency: 'PHP' }, 'Singapore': { flag: '🇸🇬', currency: 'SGD' },
  'South Korea': { flag: '🇰🇷', currency: 'KRW' }, 'Sri Lanka': { flag: '🇱🇰', currency: 'LKR' },
  'Taiwan': { flag: '🇹🇼', currency: 'TWD' }, 'Tajikistan': { flag: '🇹🇯', currency: 'TJS' },
  'Thailand': { flag: '🇹🇭', currency: 'THB' }, 'Timor-Leste': { flag: '🇹🇱', currency: 'USD' },
  'Turkmenistan': { flag: '🇹🇲', currency: 'TMT' }, 'Uzbekistan': { flag: '🇺🇿', currency: 'UZS' },
  'Vietnam': { flag: '🇻🇳', currency: 'VND' },
  // Oceania
  'Australia': { flag: '🇦🇺', currency: 'AUD' }, 'Fiji': { flag: '🇫🇯', currency: 'FJD' },
  'Kiribati': { flag: '🇰🇮', currency: 'AUD' }, 'Marshall Islands': { flag: '🇲🇭', currency: 'USD' },
  'Micronesia': { flag: '🇫🇲', currency: 'USD' }, 'Nauru': { flag: '🇳🇷', currency: 'AUD' },
  'New Zealand': { flag: '🇳🇿', currency: 'NZD' }, 'Palau': { flag: '🇵🇼', currency: 'USD' },
  'Papua New Guinea': { flag: '🇵🇬', currency: 'PGK' }, 'Samoa': { flag: '🇼🇸', currency: 'WST' },
  'Solomon Islands': { flag: '🇸🇧', currency: 'SBD' }, 'Tonga': { flag: '🇹🇴', currency: 'TOP' },
  'Tuvalu': { flag: '🇹🇻', currency: 'AUD' }, 'Vanuatu': { flag: '🇻🇺', currency: 'VUV' },
};

export const FEATURED_BY_REGION: Record<string, string[]> = {
  'Europe': ['United Kingdom'],
  'North America': ['United States'],
  'Africa': ['Nigeria'],
  'Middle East': ['United Arab Emirates', 'Bahrain', 'Saudi Arabia'],
};

export const SCHOOL_LEVELS = ['Primary', 'Middle', 'High', 'College', 'University'];

export const DEPARTMENTS: { [key: string]: string[] } = {
  Primary: ['General Education'],
  Middle: ['General Education', 'STEM Focus', 'Arts & Humanities'],
  High: ['Science', 'Arts', 'Technology', 'Commercial', 'Engineering'],
  College: [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Health Sciences',
    'Arts & Humanities',
    'Natural Sciences',
    'Social Sciences',
    'Technology',
  ],
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

export const ASSIGNMENT_TYPES = [
  'Short Assignment', 'Homework', 'Essay', 'Lab Report', 'Presentation',
  'Case Study', 'Project', 'Research Paper', 'Thesis', 'Dissertation',
  'Reflection', 'Literature Review', 'Business Plan', 'Annotated Bibliography',
  'Technical Report', 'Other',
];

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
