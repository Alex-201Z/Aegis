// ============================================
// AEGIS - User Routes
// ============================================

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  findUserById,
  getUserSettings,
  updateUserSettings,
  getUserProgress,
  getAlertsByUser,
  getAssetsByUser,
} from '../data/store';
import { calculateSecurityScore } from '../services/scoreService';

export const userRouter = Router();

// All routes require authentication
userRouter.use(authenticate);

// GET /api/user/profile
userRouter.get(
  '/profile',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await findUserById(req.userId!);

      if (!user) {
        return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
      }

      const [assets, alerts, score] = await Promise.all([
        getAssetsByUser(req.userId!),
        getAlertsByUser(req.userId!),
        calculateSecurityScore(req.userId!),
      ]);

      const completedActions = alerts
        .flatMap((a) => a.recommendedActions)
        .filter((a) => a.isCompleted).length;

      res.json({
        success: true,
        data: {
          ...user,
          securityScore: score,
          monitoredAssets: assets,
          alertsCount: alerts.filter((a) => !a.isRead).length,
          completedActions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/user/settings
userRouter.get(
  '/settings',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settings = await getUserSettings(req.userId!);

      if (!settings) {
        return next(new AppError('Settings not found', 404, 'SETTINGS_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/user/settings
userRouter.put(
  '/settings',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settings = await updateUserSettings(req.userId!, req.body);

      if (!settings) {
        return next(new AppError('Failed to update settings', 500, 'UPDATE_FAILED'));
      }

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/user/progress
userRouter.get(
  '/progress',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const progress = await getUserProgress(req.userId!);

      if (!progress) {
        return next(new AppError('Progress not found', 404, 'PROGRESS_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
);
