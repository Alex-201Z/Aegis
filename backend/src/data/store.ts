// ============================================
// AEGIS - In-Memory Data Store
// ============================================
// Note: In production, this would be replaced with a proper database

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import type {
  User,
  MonitoredAsset,
  DataBreach,
  BreachAlert,
  SecurityAction,
  SecurityScore,
  AIConversation,
  UserSettings,
  SecurityChecklist,
  Badge,
  UserProgress,
} from '@aegis/shared';

// Sample breach data for demonstration
const sampleBreaches: DataBreach[] = [
  {
    id: 'breach-1',
    name: 'Adobe',
    domain: 'adobe.com',
    breachDate: new Date('2013-10-04'),
    addedDate: new Date('2013-12-04'),
    modifiedDate: new Date('2022-05-15'),
    pwnCount: 152445165,
    description: 'In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text.',
    dataClasses: ['email_addresses', 'passwords', 'usernames'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'breach-2',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    breachDate: new Date('2012-05-05'),
    addedDate: new Date('2016-05-21'),
    modifiedDate: new Date('2021-06-29'),
    pwnCount: 164611595,
    description: 'In May 2016, LinkedIn had 164 million email addresses and passwords exposed. Originally hacked in 2012, the data remained out of sight until being offered for sale on a dark market site 4 years later.',
    dataClasses: ['email_addresses', 'passwords'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'breach-3',
    name: 'Dropbox',
    domain: 'dropbox.com',
    breachDate: new Date('2012-07-01'),
    addedDate: new Date('2016-08-31'),
    modifiedDate: new Date('2016-08-31'),
    pwnCount: 68648009,
    description: 'In mid-2012, Dropbox suffered a data breach which exposed the stored credentials of tens of millions of their customers.',
    dataClasses: ['email_addresses', 'passwords'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'breach-4',
    name: 'Twitter',
    domain: 'twitter.com',
    breachDate: new Date('2022-01-01'),
    addedDate: new Date('2023-01-05'),
    modifiedDate: new Date('2023-01-05'),
    pwnCount: 211524284,
    description: 'In early 2023, over 200 million records scraped from Twitter appeared on a popular hacking forum. The data was obtained sometime in 2021 by abusing an API.',
    dataClasses: ['email_addresses', 'usernames', 'phone_numbers'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'breach-5',
    name: 'Canva',
    domain: 'canva.com',
    breachDate: new Date('2019-05-24'),
    addedDate: new Date('2019-05-31'),
    modifiedDate: new Date('2019-05-31'),
    pwnCount: 137272116,
    description: 'In May 2019, the graphic design tool website Canva suffered a data breach that impacted 137 million subscribers.',
    dataClasses: ['email_addresses', 'usernames', 'passwords'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
];

// In-memory stores
const users: Map<string, User & { passwordHash: string }> = new Map();
const assets: Map<string, MonitoredAsset> = new Map();
const alerts: Map<string, BreachAlert> = new Map();
const actions: Map<string, SecurityAction> = new Map();
const conversations: Map<string, AIConversation> = new Map();
const settings: Map<string, UserSettings> = new Map();
const checklists: Map<string, SecurityChecklist> = new Map();

// User methods
export const createUser = async (
  email: string,
  username: string,
  password: string
): Promise<User> => {
  const existingUser = Array.from(users.values()).find(
    (u) => u.email === email || u.username === username
  );

  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = uuidv4();
  const now = new Date();

  const user: User & { passwordHash: string } = {
    id,
    email,
    username,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    isPremium: false,
    rank: 'novice',
    xp: 0,
  };

  users.set(id, user);

  // Create default settings
  settings.set(id, {
    userId: id,
    notifications: {
      emailAlerts: true,
      pushAlerts: true,
      breachAlertsSeverity: 'medium',
      weeklyReport: true,
      actionReminders: true,
    },
    privacy: {
      shareAnonymousStats: false,
      dataRetentionDays: 365,
    },
    appearance: {
      theme: 'dark',
      language: 'fr',
      compactMode: false,
    },
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const findUserByEmail = async (email: string) => {
  return Array.from(users.values()).find((u) => u.email === email);
};

export const findUserById = async (id: string) => {
  const user = users.get(id);
  if (user) {
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const verifyPassword = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserXp = async (userId: string, xpToAdd: number) => {
  const user = users.get(userId);
  if (!user) return null;

  user.xp += xpToAdd;

  // Update rank based on XP
  if (user.xp >= 7000) user.rank = 'architect';
  else if (user.xp >= 3500) user.rank = 'sentinel';
  else if (user.xp >= 1500) user.rank = 'guardian';
  else if (user.xp >= 500) user.rank = 'defender';
  else user.rank = 'novice';

  user.updatedAt = new Date();
  users.set(userId, user);

  return user;
};

// Asset methods
export const createAsset = async (
  userId: string,
  type: MonitoredAsset['type'],
  value: string,
  label?: string
): Promise<MonitoredAsset> => {
  const id = uuidv4();
  const now = new Date();

  const asset: MonitoredAsset = {
    id,
    userId,
    type,
    value,
    label,
    addedAt: now,
    lastChecked: now,
    breachCount: 0,
    status: 'checking',
  };

  assets.set(id, asset);
  return asset;
};

export const getAssetsByUser = async (userId: string): Promise<MonitoredAsset[]> => {
  return Array.from(assets.values()).filter((a) => a.userId === userId);
};

export const updateAssetStatus = async (
  assetId: string,
  status: MonitoredAsset['status'],
  breachCount?: number
) => {
  const asset = assets.get(assetId);
  if (!asset) return null;

  asset.status = status;
  asset.lastChecked = new Date();
  if (breachCount !== undefined) {
    asset.breachCount = breachCount;
  }

  assets.set(assetId, asset);
  return asset;
};

export const deleteAsset = async (assetId: string, userId: string) => {
  const asset = assets.get(assetId);
  if (!asset || asset.userId !== userId) return false;

  assets.delete(assetId);
  return true;
};

// Breach methods
export const getAllBreaches = (): DataBreach[] => {
  return sampleBreaches;
};

export const getBreachById = (id: string): DataBreach | undefined => {
  return sampleBreaches.find((b) => b.id === id);
};

export const checkEmailBreaches = (email: string): DataBreach[] => {
  // Simulate finding breaches for an email
  // In production, this would query actual breach databases
  const domain = email.split('@')[1];
  const random = Math.random();

  // Simulate some emails being in breaches
  if (random < 0.7) {
    // 70% chance of being in at least one breach
    const numBreaches = Math.floor(Math.random() * 3) + 1;
    return sampleBreaches.slice(0, numBreaches);
  }

  return [];
};

// Alert methods
export const createAlert = async (
  userId: string,
  assetId: string,
  breach: DataBreach,
  severity: BreachAlert['severity']
): Promise<BreachAlert> => {
  const id = uuidv4();

  const alert: BreachAlert = {
    id,
    userId,
    assetId,
    breachId: breach.id,
    breach,
    detectedAt: new Date(),
    isRead: false,
    isResolved: false,
    severity,
    recommendedActions: generateRecommendedActions(breach),
  };

  alerts.set(id, alert);
  return alert;
};

export const getAlertsByUser = async (userId: string): Promise<BreachAlert[]> => {
  return Array.from(alerts.values())
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
};

export const markAlertRead = async (alertId: string, userId: string) => {
  const alert = alerts.get(alertId);
  if (!alert || alert.userId !== userId) return null;

  alert.isRead = true;
  alerts.set(alertId, alert);
  return alert;
};

export const resolveAlert = async (alertId: string, userId: string) => {
  const alert = alerts.get(alertId);
  if (!alert || alert.userId !== userId) return null;

  alert.isResolved = true;
  alerts.set(alertId, alert);
  return alert;
};

// Action methods
const generateRecommendedActions = (breach: DataBreach): SecurityAction[] => {
  const actions: SecurityAction[] = [];
  const now = new Date();

  if (breach.dataClasses.includes('passwords')) {
    actions.push({
      id: uuidv4(),
      type: 'change_password',
      title: `Change your password on ${breach.name}`,
      description: `Your password was exposed in the ${breach.name} breach. Change it immediately and ensure you're not using it elsewhere.`,
      priority: 'urgent',
      estimatedTime: '5 minutes',
      isCompleted: false,
      relatedBreachId: breach.id,
      xpReward: 30,
    });
  }

  if (!breach.dataClasses.includes('auth_tokens')) {
    actions.push({
      id: uuidv4(),
      type: 'enable_mfa',
      title: `Enable 2FA on ${breach.name}`,
      description: `Add an extra layer of security by enabling two-factor authentication on your ${breach.name} account.`,
      priority: 'high',
      estimatedTime: '10 minutes',
      isCompleted: false,
      relatedBreachId: breach.id,
      xpReward: 75,
    });
  }

  actions.push({
    id: uuidv4(),
    type: 'check_activity',
    title: `Review account activity on ${breach.name}`,
    description: `Check your recent account activity for any suspicious logins or unauthorized actions.`,
    priority: 'medium',
    estimatedTime: '5 minutes',
    isCompleted: false,
    relatedBreachId: breach.id,
    xpReward: 25,
  });

  return actions;
};

export const getActionsByUser = async (userId: string): Promise<SecurityAction[]> => {
  const userAlerts = await getAlertsByUser(userId);
  return userAlerts.flatMap((alert) => alert.recommendedActions);
};

export const completeAction = async (actionId: string, userId: string) => {
  const userAlerts = await getAlertsByUser(userId);

  for (const alert of userAlerts) {
    const action = alert.recommendedActions.find((a) => a.id === actionId);
    if (action) {
      action.isCompleted = true;
      action.completedAt = new Date();
      alerts.set(alert.id, alert);

      // Award XP
      await updateUserXp(userId, action.xpReward);

      return action;
    }
  }

  return null;
};

// Settings methods
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  return settings.get(userId) || null;
};

export const updateUserSettings = async (
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings | null> => {
  const current = settings.get(userId);
  if (!current) return null;

  const updated = {
    ...current,
    ...updates,
    notifications: { ...current.notifications, ...updates.notifications },
    privacy: { ...current.privacy, ...updates.privacy },
    appearance: { ...current.appearance, ...updates.appearance },
  };

  settings.set(userId, updated);
  return updated;
};

// Conversation methods
export const createConversation = async (userId: string): Promise<AIConversation> => {
  const id = uuidv4();
  const now = new Date();

  const conversation: AIConversation = {
    id,
    userId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  conversations.set(id, conversation);
  return conversation;
};

export const getConversation = async (
  conversationId: string,
  userId: string
): Promise<AIConversation | null> => {
  const conv = conversations.get(conversationId);
  if (!conv || conv.userId !== userId) return null;
  return conv;
};

export const addMessageToConversation = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) => {
  const conv = conversations.get(conversationId);
  if (!conv) return null;

  conv.messages.push({
    id: uuidv4(),
    role,
    content,
    timestamp: new Date(),
  });
  conv.updatedAt = new Date();

  conversations.set(conversationId, conv);
  return conv;
};

// Progress methods
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  const user = users.get(userId);
  if (!user) return null;

  const xpToNext = user.rank === 'architect'
    ? 0
    : user.rank === 'sentinel'
    ? 7000 - user.xp
    : user.rank === 'guardian'
    ? 3500 - user.xp
    : user.rank === 'defender'
    ? 1500 - user.xp
    : 500 - user.xp;

  return {
    userId,
    rank: user.rank,
    xp: user.xp,
    xpToNextRank: Math.max(0, xpToNext),
    badges: [], // Would be populated from a badges table
    streakDays: 1, // Would be calculated from login history
    lastActiveDate: new Date(),
  };
};

export {
  sampleBreaches,
};
