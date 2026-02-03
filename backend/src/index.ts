// ============================================
// AEGIS - Backend Entry Point
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { securityRouter } from './routes/security';
import { assetsRouter } from './routes/assets';
import { aiRouter } from './routes/ai';
import { setupWebSocket } from './websocket';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/security', securityRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/ai', aiRouter);

// Error handling
app.use(errorHandler);

// WebSocket setup
setupWebSocket(io);

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  logger.info(`Aegis server running on port ${PORT}`);
  logger.info(`WebSocket server ready`);
});

export { app, io };
