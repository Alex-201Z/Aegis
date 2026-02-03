// ============================================
// AEGIS - Security Checklist Service
// ============================================

import { v4 as uuidv4 } from 'uuid';
import type { SecurityChecklist, ChecklistItem, ChecklistCategory } from '@aegis/shared';
import { DEFAULT_CHECKLIST_ITEMS } from '@aegis/shared';

// In-memory store for checklists
const checklists: Map<string, SecurityChecklist> = new Map();

/**
 * Get or create a security checklist for a user
 */
export async function getSecurityChecklist(userId: string): Promise<SecurityChecklist> {
  let checklist = checklists.get(userId);

  if (!checklist) {
    checklist = createDefaultChecklist(userId);
    checklists.set(userId, checklist);
  }

  return checklist;
}

/**
 * Update a checklist item's completion status
 */
export async function updateChecklistItem(
  userId: string,
  itemId: string,
  isCompleted: boolean
): Promise<SecurityChecklist | null> {
  const checklist = await getSecurityChecklist(userId);

  const item = checklist.items.find((i) => i.id === itemId);
  if (!item) return null;

  item.isCompleted = isCompleted;
  item.completedAt = isCompleted ? new Date() : undefined;

  // Update counts
  checklist.completedCount = checklist.items.filter((i) => i.isCompleted).length;
  checklist.lastUpdated = new Date();

  checklists.set(userId, checklist);
  return checklist;
}

/**
 * Create a default checklist for a new user
 */
function createDefaultChecklist(userId: string): SecurityChecklist {
  const items: ChecklistItem[] = DEFAULT_CHECKLIST_ITEMS.map((item) => ({
    id: uuidv4(),
    category: item.category as ChecklistCategory,
    title: item.title,
    description: getItemDescription(item.title),
    isCompleted: false,
    importance: item.importance as 'essential' | 'recommended' | 'advanced',
  }));

  return {
    id: uuidv4(),
    userId,
    items,
    completedCount: 0,
    totalCount: items.length,
    lastUpdated: new Date(),
  };
}

/**
 * Get detailed description for a checklist item
 */
function getItemDescription(title: string): string {
  const descriptions: Record<string, string> = {
    'Use unique passwords':
      'Each account should have a different password. If one service is breached, your other accounts remain safe.',
    'Use a password manager':
      'A password manager securely stores and generates strong passwords, so you only need to remember one master password.',
    'Passwords are 12+ characters':
      'Longer passwords are exponentially harder to crack. Aim for at least 12 characters with a mix of types.',
    'No personal info in passwords':
      'Avoid using birthdays, names, or other personal information that could be guessed or found online.',
    'Enable 2FA on email':
      'Your email is the key to all your accounts. Protect it with two-factor authentication.',
    'Enable 2FA on banking':
      'Financial accounts are high-value targets. Always enable the strongest authentication available.',
    'Enable 2FA on social media':
      'Social media accounts can be used for identity theft and social engineering. Add 2FA for protection.',
    'Use authenticator app over SMS':
      'SMS can be intercepted through SIM swapping. Authenticator apps are more secure.',
    'Set up backup codes':
      'Save backup codes in a secure location in case you lose access to your 2FA device.',
    'Device encryption enabled':
      'Enable full-disk encryption to protect your data if your device is lost or stolen.',
    'Auto-lock enabled':
      'Set your devices to lock automatically after a short period of inactivity.',
    'OS up to date':
      'Security patches fix known vulnerabilities. Keep your operating system updated.',
    'Antivirus installed':
      'While not foolproof, antivirus software provides an additional layer of protection.',
    'Review connected apps':
      'Regularly check which third-party apps have access to your accounts and revoke unnecessary permissions.',
    'Remove unused accounts':
      'Old accounts can be breached without you knowing. Delete accounts you no longer use.',
    'Check account activity':
      'Periodically review login history and account activity for signs of unauthorized access.',
    'Review privacy settings':
      'Check privacy settings on social media and other services to control what information is public.',
    'Limit data sharing':
      'Be selective about what personal information you share online and with services.',
    'Use private browsing for sensitive tasks':
      'Use incognito/private mode for banking and other sensitive activities on shared computers.',
    'Email backup codes saved':
      'Store email account recovery codes securely offline in case you lose access.',
    'Recovery email set up':
      'Set up a recovery email address to regain access if you forget your password.',
    'Data backup strategy':
      'Regularly back up important data following the 3-2-1 rule: 3 copies, 2 media types, 1 offsite.',
  };

  return descriptions[title] || 'Complete this security task to improve your overall security posture.';
}

/**
 * Get checklist statistics for a user
 */
export async function getChecklistStats(userId: string) {
  const checklist = await getSecurityChecklist(userId);

  const byCategory = checklist.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, completed: 0 };
    }
    acc[item.category].total++;
    if (item.isCompleted) acc[item.category].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const byImportance = checklist.items.reduce((acc, item) => {
    if (!acc[item.importance]) {
      acc[item.importance] = { total: 0, completed: 0 };
    }
    acc[item.importance].total++;
    if (item.isCompleted) acc[item.importance].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  return {
    overall: {
      total: checklist.totalCount,
      completed: checklist.completedCount,
      percentage: Math.round((checklist.completedCount / checklist.totalCount) * 100),
    },
    byCategory,
    byImportance,
  };
}
