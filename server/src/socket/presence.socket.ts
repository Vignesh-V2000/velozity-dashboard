import { Server, Socket } from 'socket.io';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const user = socket.data.user;
  const redis = getRedisClient();

  // Add user to online set
  redis.sadd('online:users', user.id).then(async () => {
    const count = await redis.scard('online:users');
    io.emit('presence:update', { count });
    logger.debug(`${user.name} came online. Total online: ${count}`);
  });

  socket.on('disconnect', async () => {
    await redis.srem('online:users', user.id);
    const count = await redis.scard('online:users');
    io.emit('presence:update', { count });
    logger.debug(`${user.name} went offline. Total online: ${count}`);
  });
}
