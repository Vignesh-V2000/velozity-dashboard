import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { socketAuth } from './auth.socket';
import { registerActivityHandlers } from './activity.socket';
import { registerPresenceHandlers } from './presence.socket';
import { registerNotificationHandlers } from './notification.socket';
import { logger } from '../utils/logger';

let io: SocketServer;

export function initSocket(httpServer: HTTPServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${user.name} (${user.role})`);

    // Admin joins global-feed room
    if (user.role === 'ADMIN') {
      socket.join('global-feed');
    }
    // Each user joins their personal notification room
    socket.join(`user:${user.id}`);

    registerActivityHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerNotificationHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${user.name}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
