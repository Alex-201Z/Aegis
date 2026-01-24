// ============================================
// AEGIS - AI Assistant Routes
// ============================================

import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { strictRateLimiter } from '../middleware/rateLimiter';
import {
  createConversation,
  getConversation,
  addMessageToConversation,
  getAlertsByUser,
} from '../data/store';
import { generateAIResponse, explainSecurityTopic } from '../services/aiService';

export const aiRouter = Router();

// All routes require authentication
aiRouter.use(authenticate);

// Validation schemas
const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  conversationId: z.string().optional(),
});

const explainSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  context: z.string().optional(),
});

// POST /api/ai/chat
aiRouter.post(
  '/chat',
  strictRateLimiter,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validation = chatSchema.safeParse(req.body);

      if (!validation.success) {
        return next(
          new AppError(validation.error.errors[0].message, 400, 'VALIDATION_ERROR')
        );
      }

      const { message, conversationId } = validation.data;

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await getConversation(conversationId, req.userId!);
        if (!conversation) {
          return next(new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND'));
        }
      } else {
        conversation = await createConversation(req.userId!);
      }

      // Add user message
      await addMessageToConversation(conversation.id, 'user', message);

      // Get user context for better responses
      const alerts = await getAlertsByUser(req.userId!);
      const unresolvedAlerts = alerts.filter((a) => !a.isResolved);

      // Generate AI response
      const response = await generateAIResponse(message, {
        conversationHistory: conversation.messages,
        unresolvedAlerts: unresolvedAlerts.length,
        recentBreaches: alerts.slice(0, 3).map((a) => a.breach.name),
      });

      // Add assistant response
      await addMessageToConversation(conversation.id, 'assistant', response);

      const updatedConversation = await getConversation(conversation.id, req.userId!);

      res.json({
        success: true,
        data: {
          conversationId: conversation.id,
          response,
          conversation: updatedConversation,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/ai/explain
aiRouter.post(
  '/explain',
  strictRateLimiter,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validation = explainSchema.safeParse(req.body);

      if (!validation.success) {
        return next(
          new AppError(validation.error.errors[0].message, 400, 'VALIDATION_ERROR')
        );
      }

      const { topic, context } = validation.data;

      const explanation = await explainSecurityTopic(topic, context);

      res.json({
        success: true,
        data: explanation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/ai/tips
aiRouter.get(
  '/tips',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tips = [
        {
          id: '1',
          title: 'Use unique passwords',
          description: 'Never reuse passwords across different accounts. If one service is breached, all your accounts become vulnerable.',
          category: 'passwords',
        },
        {
          id: '2',
          title: 'Enable two-factor authentication',
          description: '2FA adds an extra layer of security. Even if your password is compromised, attackers cannot access your account without the second factor.',
          category: 'authentication',
        },
        {
          id: '3',
          title: 'Be wary of phishing',
          description: 'Always verify the sender of emails and check URLs before clicking. Legitimate services will never ask for your password via email.',
          category: 'awareness',
        },
        {
          id: '4',
          title: 'Keep software updated',
          description: 'Security patches fix known vulnerabilities. Keeping your software updated protects you from known exploits.',
          category: 'maintenance',
        },
        {
          id: '5',
          title: 'Review app permissions',
          description: 'Regularly check which apps have access to your accounts and revoke permissions for apps you no longer use.',
          category: 'privacy',
        },
      ];

      // Randomly select 3 tips
      const selectedTips = tips.sort(() => Math.random() - 0.5).slice(0, 3);

      res.json({
        success: true,
        data: selectedTips,
      });
    } catch (error) {
      next(error);
    }
  }
);
