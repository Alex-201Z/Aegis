// ============================================
// AEGIS - Security Score Service
// ============================================

import type { SecurityScore, ScoreComponent } from '@aegis/shared';
import { getAssetsByUser, getAlertsByUser } from '../data/store';
import { getSecurityChecklist } from './checklistService';

/**
 * Calculate the user's overall security score
 */
export async function calculateSecurityScore(userId: string): Promise<SecurityScore> {
  const [assets, alerts, checklist] = await Promise.all([
    getAssetsByUser(userId),
    getAlertsByUser(userId),
    getSecurityChecklist(userId),
  ]);

  // Calculate password score
  const passwordScore = calculatePasswordScore(alerts);

  // Calculate MFA score
  const mfaScore = calculateMfaScore(alerts, checklist);

  // Calculate exposure score
  const exposureScore = calculateExposureScore(assets, alerts);

  // Calculate hygiene score
  const hygieneScore = calculateHygieneScore(checklist);

  // Calculate weighted overall score
  const overall = Math.round(
    passwordScore.score * 0.35 +
    mfaScore.score * 0.30 +
    exposureScore.score * 0.25 +
    hygieneScore.score * 0.10
  );

  // Determine trend (simplified - in production would compare to historical data)
  const trend = overall >= 70 ? 'up' : overall >= 50 ? 'stable' : 'down';
  const trendPercentage = Math.floor(Math.random() * 10) - 3; // Simulated

  return {
    overall,
    breakdown: {
      passwords: passwordScore,
      mfa: mfaScore,
      exposure: exposureScore,
      hygiene: hygieneScore,
    },
    lastUpdated: new Date(),
    trend,
    trendPercentage,
  };
}

function calculatePasswordScore(alerts: Awaited<ReturnType<typeof getAlertsByUser>>): ScoreComponent {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for password-related breaches
  const passwordBreaches = alerts.filter((a) =>
    a.breach.dataClasses.includes('passwords' as any) && !a.isResolved
  );

  let score = 100;

  if (passwordBreaches.length > 0) {
    score -= passwordBreaches.length * 20;
    issues.push(`${passwordBreaches.length} account(s) with exposed passwords`);
    recommendations.push('Change passwords for breached accounts immediately');
  }

  // Check for completed password change actions
  const pendingPasswordActions = alerts
    .flatMap((a) => a.recommendedActions)
    .filter((a) => a.type === 'change_password' && !a.isCompleted);

  if (pendingPasswordActions.length > 0) {
    score -= pendingPasswordActions.length * 10;
    issues.push(`${pendingPasswordActions.length} pending password changes`);
    recommendations.push('Complete pending password changes');
  }

  return {
    score: Math.max(0, score),
    weight: 35,
    issues,
    recommendations: recommendations.length > 0 ? recommendations : ['Great job keeping your passwords secure!'],
  };
}

function calculateMfaScore(
  alerts: Awaited<ReturnType<typeof getAlertsByUser>>,
  checklist: Awaited<ReturnType<typeof getSecurityChecklist>>
): ScoreComponent {
  const issues: string[] = [];
  const recommendations: string[] = [];

  let score = 100;

  // Check MFA-related checklist items
  const mfaItems = checklist.items.filter((item) =>
    item.category === 'authentication'
  );

  const completedMfa = mfaItems.filter((item) => item.isCompleted).length;
  const totalMfa = mfaItems.length;

  if (totalMfa > 0) {
    const mfaCompletion = (completedMfa / totalMfa) * 100;
    if (mfaCompletion < 100) {
      score -= Math.round((100 - mfaCompletion) * 0.5);
      issues.push(`${totalMfa - completedMfa} authentication improvements pending`);
      recommendations.push('Enable 2FA on all important accounts');
    }
  }

  // Check for pending MFA actions from breach alerts
  const pendingMfaActions = alerts
    .flatMap((a) => a.recommendedActions)
    .filter((a) => a.type === 'enable_mfa' && !a.isCompleted);

  if (pendingMfaActions.length > 0) {
    score -= pendingMfaActions.length * 15;
    issues.push(`${pendingMfaActions.length} accounts need 2FA enabled`);
    recommendations.push('Enable two-factor authentication where available');
  }

  return {
    score: Math.max(0, score),
    weight: 30,
    issues,
    recommendations: recommendations.length > 0 ? recommendations : ['Your authentication security is strong!'],
  };
}

function calculateExposureScore(
  assets: Awaited<ReturnType<typeof getAssetsByUser>>,
  alerts: Awaited<ReturnType<typeof getAlertsByUser>>
): ScoreComponent {
  const issues: string[] = [];
  const recommendations: string[] = [];

  let score = 100;

  // Count breached assets
  const breachedAssets = assets.filter((a) => a.status === 'breached');
  const atRiskAssets = assets.filter((a) => a.status === 'at_risk');

  if (breachedAssets.length > 0) {
    score -= breachedAssets.length * 15;
    issues.push(`${breachedAssets.length} monitored asset(s) found in data breaches`);
    recommendations.push('Review and secure accounts linked to breached emails');
  }

  if (atRiskAssets.length > 0) {
    score -= atRiskAssets.length * 5;
    issues.push(`${atRiskAssets.length} asset(s) at elevated risk`);
  }

  // Check for unresolved critical alerts
  const criticalAlerts = alerts.filter(
    (a) => (a.severity === 'critical' || a.severity === 'high') && !a.isResolved
  );

  if (criticalAlerts.length > 0) {
    score -= criticalAlerts.length * 10;
    issues.push(`${criticalAlerts.length} high-priority alert(s) need attention`);
    recommendations.push('Address critical security alerts as soon as possible');
  }

  // Bonus for having monitored assets
  if (assets.length === 0) {
    score -= 20;
    issues.push('No assets being monitored');
    recommendations.push('Add your email addresses to monitor for breaches');
  }

  return {
    score: Math.max(0, score),
    weight: 25,
    issues,
    recommendations: recommendations.length > 0 ? recommendations : ['Your digital exposure is well managed!'],
  };
}

function calculateHygieneScore(
  checklist: Awaited<ReturnType<typeof getSecurityChecklist>>
): ScoreComponent {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Calculate completion percentage
  const completedCount = checklist.items.filter((item) => item.isCompleted).length;
  const essentialItems = checklist.items.filter((item) => item.importance === 'essential');
  const essentialCompleted = essentialItems.filter((item) => item.isCompleted).length;

  // Base score on overall completion
  let score = Math.round((completedCount / checklist.items.length) * 100);

  // Penalty for incomplete essential items
  const incompleteEssential = essentialItems.length - essentialCompleted;
  if (incompleteEssential > 0) {
    score -= incompleteEssential * 10;
    issues.push(`${incompleteEssential} essential security task(s) incomplete`);
    recommendations.push('Complete essential security checklist items');
  }

  // General completion feedback
  if (completedCount < checklist.items.length * 0.5) {
    issues.push('Security checklist less than 50% complete');
    recommendations.push('Work through your security checklist regularly');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: 10,
    issues,
    recommendations: recommendations.length > 0 ? recommendations : ['You maintain excellent security hygiene!'],
  };
}
