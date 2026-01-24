// ============================================
// AEGIS - WebSocket Server Setup
// ============================================

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { WS_EVENTS } from '@aegis/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'aegis-dev-secret-change-in-production';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

/**
 * Setup WebSocket server with authentication and event handlers
 */
export function setupWebSocket(io: SocketIOServer) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        username: string;
      };

      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`WebSocket connected: ${socket.userId}`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle subscription to specific event types
    socket.on(WS_EVENTS.SUBSCRIBE, (eventTypes: string[]) => {
      eventTypes.forEach((eventType) => {
        socket.join(`event:${eventType}`);
        logger.debug(`User ${socket.userId} subscribed to ${eventType}`);
      });
    });

    // Handle unsubscription
    socket.on(WS_EVENTS.UNSUBSCRIBE, (eventTypes: string[]) => {
      eventTypes.forEach((eventType) => {
        socket.leave(`event:${eventType}`);
        logger.debug(`User ${socket.userId} unsubscribed from ${eventType}`);
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket disconnected: ${socket.userId}, reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`WebSocket error for user ${socket.userId}:`, error);
    });

    // Send welcome message
    socket.emit('welcome', {
      message: 'Connected to Aegis real-time security alerts',
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  logger.info('WebSocket server initialized');
}

/**
 * Emit an event to a specific user
 */
export function emitToUser(
  io: SocketIOServer,
  userId: string,
  event: string,
  data: unknown
) {
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit an event to all users subscribed to a specific event type
 */
export function emitToEventSubscribers(
  io: SocketIOServer,
  eventType: string,
  data: unknown
) {
  io.to(`event:${eventType}`).emit(eventType, data);
}

/**
 * Broadcast an event to all connected users
 */
export function broadcast(io: SocketIOServer, event: string, data: unknown) {
  io.emit(event, data);
}
