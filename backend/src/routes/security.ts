// ============================================
// AEGIS - Security Routes
// ============================================

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  getAlertsByUser,
  markAlertRead,
  resolveAlert,
  completeAction,
  getAllBreaches,
  getBreachById,
} from '../data/store';
import { calculateSecurityScore } from '../services/scoreService';
import { getSecurityChecklist, updateChecklistItem } from '../services/checklistService';

export const securityRouter = Router();

// All routes require authentication
securityRouter.use(authenticate);

// GET /api/security/score
securityRouter.get(
  '/score',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const score = await calculateSecurityScore(req.userId!);

      res.json({
        success: true,
        data: score,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/security/breaches
securityRouter.get(
  '/breaches',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const breaches = getAllBreaches();

      res.json({
        success: true,
        data: breaches,
        meta: {
          total: breaches.length,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/security/breaches/:id
securityRouter.get(
  '/breaches/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const breach = getBreachById(req.params.id);

      if (!breach) {
        return next(new AppError('Breach not found', 404, 'BREACH_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: breach,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/security/alerts
securityRouter.get(
  '/alerts',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alerts = await getAlertsByUser(req.userId!);

      res.json({
        success: true,
        data: alerts,
        meta: {
          total: alerts.length,
          unread: alerts.filter((a) => !a.isRead).length,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/security/alerts/:id/read
securityRouter.put(
  '/alerts/:id/read',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await markAlertRead(req.params.id, req.userId!);

      if (!alert) {
        return next(new AppError('Alert not found', 404, 'ALERT_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/security/alerts/:id/resolve
securityRouter.put(
  '/alerts/:id/resolve',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await resolveAlert(req.params.id, req.userId!);

      if (!alert) {
        return next(new AppError('Alert not found', 404, 'ALERT_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/security/actions
securityRouter.get(
  '/actions',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alerts = await getAlertsByUser(req.userId!);
      const actions = alerts.flatMap((alert) => alert.recommendedActions);

      const pending = actions.filter((a) => !a.isCompleted);
      const completed = actions.filter((a) => a.isCompleted);

      res.json({
        success: true,
        data: {
          pending,
          completed,
        },
        meta: {
          totalPending: pending.length,
          totalCompleted: completed.length,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/security/actions/:id/complete
securityRouter.put(
  '/actions/:id/complete',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const action = await completeAction(req.params.id, req.userId!);

      if (!action) {
        return next(new AppError('Action not found', 404, 'ACTION_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: action,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/security/checklist
securityRouter.get(
  '/checklist',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const checklist = await getSecurityChecklist(req.userId!);

      res.json({
        success: true,
        data: checklist,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/security/checklist/:itemId
securityRouter.put(
  '/checklist/:itemId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { isCompleted } = req.body;

      if (typeof isCompleted !== 'boolean') {
        return next(new AppError('isCompleted must be a boolean', 400, 'VALIDATION_ERROR'));
      }

      const checklist = await updateChecklistItem(
        req.userId!,
        req.params.itemId,
        isCompleted
      );

      if (!checklist) {
        return next(new AppError('Checklist item not found', 404, 'ITEM_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: checklist,
      });
    } catch (error) {
      next(error);
    }
  }
);
