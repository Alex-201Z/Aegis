// ============================================
// AEGIS - Assets Routes
// ============================================

import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { strictRateLimiter } from '../middleware/rateLimiter';
import {
  createAsset,
  getAssetsByUser,
  deleteAsset,
  updateAssetStatus,
  checkEmailBreaches,
  createAlert,
} from '../data/store';
import { calculateBreachSeverity } from '@aegis/shared';
import { io } from '../index';

export const assetsRouter = Router();

// All routes require authentication
assetsRouter.use(authenticate);

// Validation schema
const createAssetSchema = z.object({
  type: z.enum(['email', 'username', 'phone', 'domain']),
  value: z.string().min(1, 'Value is required'),
  label: z.string().optional(),
});

// GET /api/assets
assetsRouter.get(
  '/',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const assets = await getAssetsByUser(req.userId!);

      res.json({
        success: true,
        data: assets,
        meta: {
          total: assets.length,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/assets
assetsRouter.post(
  '/',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validation = createAssetSchema.safeParse(req.body);

      if (!validation.success) {
        return next(
          new AppError(validation.error.errors[0].message, 400, 'VALIDATION_ERROR')
        );
      }

      const { type, value, label } = validation.data;

      // Check for existing asset
      const existingAssets = await getAssetsByUser(req.userId!);
      const duplicate = existingAssets.find(
        (a) => a.type === type && a.value.toLowerCase() === value.toLowerCase()
      );

      if (duplicate) {
        return next(new AppError('This asset is already being monitored', 409, 'ASSET_EXISTS'));
      }

      const asset = await createAsset(req.userId!, type, value, label);

      // Immediately check for breaches
      if (type === 'email') {
        const breaches = checkEmailBreaches(value);
        if (breaches.length > 0) {
          await updateAssetStatus(asset.id, 'breached', breaches.length);

          // Create alerts for each breach
          for (const breach of breaches) {
            const severity = calculateBreachSeverity(breach.dataClasses as any);
            const alert = await createAlert(req.userId!, asset.id, breach, severity);

            // Emit real-time alert
            io.to(`user:${req.userId}`).emit('breach_alert', alert);
          }

          asset.status = 'breached';
          asset.breachCount = breaches.length;
        } else {
          await updateAssetStatus(asset.id, 'safe', 0);
          asset.status = 'safe';
        }
      }

      res.status(201).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/assets/check
assetsRouter.post(
  '/check',
  strictRateLimiter,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { assetId } = req.body;

      if (!assetId) {
        return next(new AppError('Asset ID is required', 400, 'VALIDATION_ERROR'));
      }

      const assets = await getAssetsByUser(req.userId!);
      const asset = assets.find((a) => a.id === assetId);

      if (!asset) {
        return next(new AppError('Asset not found', 404, 'ASSET_NOT_FOUND'));
      }

      // Mark as checking
      await updateAssetStatus(asset.id, 'checking');

      // Perform breach check
      if (asset.type === 'email') {
        const breaches = checkEmailBreaches(asset.value);

        if (breaches.length > 0) {
          await updateAssetStatus(asset.id, 'breached', breaches.length);

          // Create new alerts for any new breaches
          for (const breach of breaches) {
            const severity = calculateBreachSeverity(breach.dataClasses as any);
            const alert = await createAlert(req.userId!, asset.id, breach, severity);
            io.to(`user:${req.userId}`).emit('breach_alert', alert);
          }

          res.json({
            success: true,
            data: {
              asset: { ...asset, status: 'breached', breachCount: breaches.length },
              breachesFound: breaches.length,
              breaches,
            },
          });
        } else {
          await updateAssetStatus(asset.id, 'safe', 0);

          res.json({
            success: true,
            data: {
              asset: { ...asset, status: 'safe', breachCount: 0 },
              breachesFound: 0,
              breaches: [],
            },
          });
        }
      } else {
        // For non-email assets, just mark as safe for now
        await updateAssetStatus(asset.id, 'safe', 0);

        res.json({
          success: true,
          data: {
            asset: { ...asset, status: 'safe', breachCount: 0 },
            breachesFound: 0,
            breaches: [],
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/assets/:id
assetsRouter.delete(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const deleted = await deleteAsset(req.params.id, req.userId!);

      if (!deleted) {
        return next(new AppError('Asset not found', 404, 'ASSET_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: { message: 'Asset deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);
