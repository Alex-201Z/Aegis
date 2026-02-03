import { io, Socket } from 'socket.io-client';
import type { BreachAlert, SecurityScore, Badge } from '@aegis/shared';

let socket: Socket | null = null;

export interface SocketEventHandlers {
  onBreachAlert?: (alert: BreachAlert) => void;
  onScoreUpdate?: (score: SecurityScore) => void;
  onBadgeUnlocked?: (badge: Badge) => void;
  onRankUp?: (data: { newRank: string; xp: number }) => void;
}

export function initSocket(token: string, handlers: SocketEventHandlers) {
  if (socket?.connected) {
    return socket;
  }

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Connected to Aegis real-time server');
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
  });

  socket.on('welcome', (data) => {
    console.log('Welcome message:', data);
  });

  // Event handlers
  if (handlers.onBreachAlert) {
    socket.on('breach_alert', handlers.onBreachAlert);
  }

  if (handlers.onScoreUpdate) {
    socket.on('score_update', handlers.onScoreUpdate);
  }

  if (handlers.onBadgeUnlocked) {
    socket.on('badge_unlocked', handlers.onBadgeUnlocked);
  }

  if (handlers.onRankUp) {
    socket.on('rank_up', handlers.onRankUp);
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
