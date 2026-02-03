// ============================================
// AEGIS - Core Type Definitions
// ============================================

// User & Authentication
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  rank: UserRank;
  xp: number;
}

export type UserRank = 'novice' | 'defender' | 'guardian' | 'sentinel' | 'architect';

export interface UserProfile extends User {
  securityScore: SecurityScore;
  monitoredAssets: MonitoredAsset[];
  alertsCount: number;
  completedActions: number;
}

// Authentication
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// Security Score
export interface SecurityScore {
  overall: number; // 0-100
  breakdown: SecurityScoreBreakdown;
  lastUpdated: Date;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface SecurityScoreBreakdown {
  passwords: ScoreComponent;
  mfa: ScoreComponent;
  exposure: ScoreComponent;
  hygiene: ScoreComponent;
}

export interface ScoreComponent {
  score: number; // 0-100
  weight: number; // Percentage weight in overall score
  issues: string[];
  recommendations: string[];
}

// Monitored Assets
export interface MonitoredAsset {
  id: string;
  userId: string;
  type: AssetType;
  value: string; // Email, username, etc.
  label?: string;
  addedAt: Date;
  lastChecked: Date;
  breachCount: number;
  status: AssetStatus;
}

export type AssetType = 'email' | 'username' | 'phone' | 'domain';
export type AssetStatus = 'safe' | 'at_risk' | 'breached' | 'checking';

// Data Breaches
export interface DataBreach {
  id: string;
  name: string;
  domain: string;
  breachDate: Date;
  addedDate: Date;
  modifiedDate: Date;
  pwnCount: number;
  description: string;
  dataClasses: DataClass[];
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
  logoPath?: string;
}

export type DataClass =
  | 'email_addresses'
  | 'passwords'
  | 'usernames'
  | 'phone_numbers'
  | 'physical_addresses'
  | 'ip_addresses'
  | 'dates_of_birth'
  | 'credit_cards'
  | 'social_security_numbers'
  | 'bank_accounts'
  | 'security_questions'
  | 'auth_tokens'
  | 'biometric_data'
  | 'browsing_history'
  | 'employment'
  | 'government_ids';

export interface BreachAlert {
  id: string;
  userId: string;
  assetId: string;
  breachId: string;
  breach: DataBreach;
  detectedAt: Date;
  isRead: boolean;
  isResolved: boolean;
  severity: AlertSeverity;
  recommendedActions: SecurityAction[];
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Security Actions & Recommendations
export interface SecurityAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  priority: ActionPriority;
  estimatedTime: string; // e.g., "5 minutes"
  isCompleted: boolean;
  completedAt?: Date;
  relatedAssetId?: string;
  relatedBreachId?: string;
  xpReward: number;
}

export type ActionType =
  | 'change_password'
  | 'enable_mfa'
  | 'review_account'
  | 'check_activity'
  | 'update_recovery'
  | 'revoke_sessions'
  | 'enable_alerts'
  | 'security_audit';

export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';

// AI Assistant
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: AIMessageContext;
}

export interface AIMessageContext {
  relatedBreaches?: string[];
  relatedActions?: string[];
  securityTopic?: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  topic?: string;
}

export interface AIExplanation {
  topic: string;
  summary: string;
  details: string;
  riskLevel: AlertSeverity;
  actionable: SecurityAction[];
  sources?: string[];
}

// Gamification
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  xpReward: number;
  unlockedAt?: Date;
  requirements: BadgeRequirement[];
}

export type BadgeCategory = 'security' | 'learning' | 'vigilance' | 'milestone';

export interface BadgeRequirement {
  type: string;
  target: number;
  current: number;
}

export interface UserProgress {
  userId: string;
  rank: UserRank;
  xp: number;
  xpToNextRank: number;
  badges: Badge[];
  streakDays: number;
  lastActiveDate: Date;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  timestamp: Date;
}

// WebSocket Events
export type WebSocketEvent =
  | { type: 'breach_alert'; payload: BreachAlert }
  | { type: 'score_update'; payload: SecurityScore }
  | { type: 'action_reminder'; payload: SecurityAction }
  | { type: 'rank_up'; payload: { newRank: UserRank; xp: number } }
  | { type: 'badge_unlocked'; payload: Badge };

// Settings
export interface UserSettings {
  userId: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  pushAlerts: boolean;
  breachAlertsSeverity: AlertSeverity; // Minimum severity to notify
  weeklyReport: boolean;
  actionReminders: boolean;
}

export interface PrivacySettings {
  shareAnonymousStats: boolean;
  dataRetentionDays: number;
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  compactMode: boolean;
}

// Security Checklist
export interface SecurityChecklist {
  id: string;
  userId: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  lastUpdated: Date;
}

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  importance: 'essential' | 'recommended' | 'advanced';
}

export type ChecklistCategory =
  | 'passwords'
  | 'authentication'
  | 'devices'
  | 'accounts'
  | 'privacy'
  | 'backup';
