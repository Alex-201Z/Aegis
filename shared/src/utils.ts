// ============================================
// AEGIS - Utility Functions
// ============================================

import {
  UserRank,
  AlertSeverity,
  DataClass,
  SecurityScore,
  ScoreComponent
} from './types';
import { RANKS, DATA_CLASS_RISK, SCORE_WEIGHTS } from './constants';

/**
 * Calculate the user rank based on XP
 */
export function calculateRank(xp: number): UserRank {
  if (xp >= RANKS.architect.minXp) return 'architect';
  if (xp >= RANKS.sentinel.minXp) return 'sentinel';
  if (xp >= RANKS.guardian.minXp) return 'guardian';
  if (xp >= RANKS.defender.minXp) return 'defender';
  return 'novice';
}

/**
 * Calculate XP needed to reach next rank
 */
export function xpToNextRank(currentXp: number): number {
  const currentRank = calculateRank(currentXp);
  const rankOrder: UserRank[] = ['novice', 'defender', 'guardian', 'sentinel', 'architect'];
  const currentIndex = rankOrder.indexOf(currentRank);

  if (currentIndex === rankOrder.length - 1) {
    return 0; // Already at max rank
  }

  const nextRank = rankOrder[currentIndex + 1];
  return RANKS[nextRank].minXp - currentXp;
}

/**
 * Calculate breach severity based on exposed data types
 */
export function calculateBreachSeverity(dataClasses: DataClass[]): AlertSeverity {
  let maxRisk = 0;

  for (const dataClass of dataClasses) {
    const risk = DATA_CLASS_RISK[dataClass] || 1;
    maxRisk = Math.max(maxRisk, risk);
  }

  if (maxRisk >= 9) return 'critical';
  if (maxRisk >= 7) return 'high';
  if (maxRisk >= 4) return 'medium';
  return 'low';
}

/**
 * Calculate overall security score from components
 */
export function calculateOverallScore(breakdown: Record<string, ScoreComponent>): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, component] of Object.entries(breakdown)) {
    const weight = SCORE_WEIGHTS[key as keyof typeof SCORE_WEIGHTS] || 0;
    totalScore += component.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight * 100) / 100 : 0;
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Yellow
  if (score >= 40) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

/**
 * Mask email for privacy display
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(Math.min(local.length - 2, 5)) + local[local.length - 1]
    : local[0] + '*';

  return `${maskedLocal}@${domain}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (password.length >= 20) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;

  // Penalties
  if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters
  if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeating characters

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate a secure random ID
 */
export function generateId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);

  // Use crypto if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format number with K/M/B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
