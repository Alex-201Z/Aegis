// ============================================
// AEGIS - Constants
// ============================================

// User Ranks Configuration
export const RANKS = {
  novice: { name: 'Novice', minXp: 0, maxXp: 499, color: '#6B7280' },
  defender: { name: 'Defender', minXp: 500, maxXp: 1499, color: '#10B981' },
  guardian: { name: 'Guardian', minXp: 1500, maxXp: 3499, color: '#3B82F6' },
  sentinel: { name: 'Sentinel', minXp: 3500, maxXp: 6999, color: '#8B5CF6' },
  architect: { name: 'Architect', minXp: 7000, maxXp: Infinity, color: '#F59E0B' },
} as const;

// Security Score Weights
export const SCORE_WEIGHTS = {
  passwords: 0.35,
  mfa: 0.30,
  exposure: 0.25,
  hygiene: 0.10,
} as const;

// XP Rewards
export const XP_REWARDS = {
  completeAction: 25,
  resolveAlert: 50,
  addAsset: 10,
  dailyLogin: 5,
  weeklyReview: 100,
  perfectScore: 500,
  enableMfa: 75,
  changePassword: 30,
} as const;

// Alert Severity Configuration
export const SEVERITY_CONFIG = {
  low: { color: '#6B7280', label: 'Low', icon: 'info' },
  medium: { color: '#F59E0B', label: 'Medium', icon: 'warning' },
  high: { color: '#EF4444', label: 'High', icon: 'alert-triangle' },
  critical: { color: '#DC2626', label: 'Critical', icon: 'alert-octagon' },
} as const;

// Data Classes Risk Levels
export const DATA_CLASS_RISK: Record<string, number> = {
  email_addresses: 2,
  passwords: 10,
  usernames: 1,
  phone_numbers: 4,
  physical_addresses: 5,
  ip_addresses: 2,
  dates_of_birth: 3,
  credit_cards: 10,
  social_security_numbers: 10,
  bank_accounts: 10,
  security_questions: 7,
  auth_tokens: 8,
  biometric_data: 9,
  browsing_history: 3,
  employment: 2,
  government_ids: 9,
};

// API Rate Limits
export const RATE_LIMITS = {
  breachCheck: { requests: 10, windowMs: 60000 }, // 10 per minute
  aiChat: { requests: 20, windowMs: 60000 }, // 20 per minute
  general: { requests: 100, windowMs: 60000 }, // 100 per minute
} as const;

// Password Strength Criteria
export const PASSWORD_CRITERIA = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
  maxRepeatingChars: 3,
} as const;

// Checklist Items
export const DEFAULT_CHECKLIST_ITEMS = [
  // Passwords
  { category: 'passwords', title: 'Use unique passwords', importance: 'essential' },
  { category: 'passwords', title: 'Use a password manager', importance: 'essential' },
  { category: 'passwords', title: 'Passwords are 12+ characters', importance: 'essential' },
  { category: 'passwords', title: 'No personal info in passwords', importance: 'recommended' },
  // Authentication
  { category: 'authentication', title: 'Enable 2FA on email', importance: 'essential' },
  { category: 'authentication', title: 'Enable 2FA on banking', importance: 'essential' },
  { category: 'authentication', title: 'Enable 2FA on social media', importance: 'recommended' },
  { category: 'authentication', title: 'Use authenticator app over SMS', importance: 'recommended' },
  { category: 'authentication', title: 'Set up backup codes', importance: 'recommended' },
  // Devices
  { category: 'devices', title: 'Device encryption enabled', importance: 'essential' },
  { category: 'devices', title: 'Auto-lock enabled', importance: 'essential' },
  { category: 'devices', title: 'OS up to date', importance: 'essential' },
  { category: 'devices', title: 'Antivirus installed', importance: 'recommended' },
  // Accounts
  { category: 'accounts', title: 'Review connected apps', importance: 'recommended' },
  { category: 'accounts', title: 'Remove unused accounts', importance: 'recommended' },
  { category: 'accounts', title: 'Check account activity', importance: 'recommended' },
  // Privacy
  { category: 'privacy', title: 'Review privacy settings', importance: 'recommended' },
  { category: 'privacy', title: 'Limit data sharing', importance: 'advanced' },
  { category: 'privacy', title: 'Use private browsing for sensitive tasks', importance: 'advanced' },
  // Backup
  { category: 'backup', title: 'Email backup codes saved', importance: 'essential' },
  { category: 'backup', title: 'Recovery email set up', importance: 'essential' },
  { category: 'backup', title: 'Data backup strategy', importance: 'recommended' },
] as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  BREACH_ALERT: 'breach_alert',
  SCORE_UPDATE: 'score_update',
  ACTION_REMINDER: 'action_reminder',
  RANK_UP: 'rank_up',
  BADGE_UNLOCKED: 'badge_unlocked',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  // User
  PROFILE: '/api/user/profile',
  SETTINGS: '/api/user/settings',
  PROGRESS: '/api/user/progress',
  // Security
  SCORE: '/api/security/score',
  BREACHES: '/api/security/breaches',
  ALERTS: '/api/security/alerts',
  ACTIONS: '/api/security/actions',
  CHECKLIST: '/api/security/checklist',
  // Assets
  ASSETS: '/api/assets',
  CHECK_ASSET: '/api/assets/check',
  // AI
  CHAT: '/api/ai/chat',
  EXPLAIN: '/api/ai/explain',
} as const;
