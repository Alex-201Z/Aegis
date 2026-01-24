// ============================================
// AEGIS - Authentication Routes
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createUser, verifyPassword, findUserById } from '../data/store';
import { generateTokens, verifyRefreshToken, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
authRouter.post(
  '/register',
  strictRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        return next(
          new AppError(validation.error.errors[0].message, 400, 'VALIDATION_ERROR')
        );
      }

      const { email, username, password } = validation.data;

      const user = await createUser(email, username, password);
      const tokens = generateTokens(user);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            rank: user.rank,
            xp: user.xp,
            isPremium: user.isPremium,
          },
          tokens,
        },
      });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return next(new AppError('Email or username already taken', 409, 'USER_EXISTS'));
      }
      next(error);
    }
  }
);

// POST /api/auth/login
authRouter.post(
  '/login',
  strictRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        return next(
          new AppError(validation.error.errors[0].message, 400, 'VALIDATION_ERROR')
        );
      }

      const { email, password } = validation.data;

      const user = await verifyPassword(email, password);

      if (!user) {
        return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
      }

      const tokens = generateTokens(user);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            rank: user.rank,
            xp: user.xp,
            isPremium: user.isPremium,
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/refresh
authRouter.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return next(new AppError('Refresh token required', 400, 'MISSING_TOKEN'));
      }

      const userId = verifyRefreshToken(refreshToken);

      if (!userId) {
        return next(new AppError('Invalid refresh token', 401, 'INVALID_TOKEN'));
      }

      const user = await findUserById(userId);

      if (!user) {
        return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
      }

      const tokens = generateTokens(user);

      res.json({
        success: true,
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  // In a real implementation, we would invalidate the refresh token
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});
