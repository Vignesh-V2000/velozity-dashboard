import { Server, Socket } from 'socket.io';
import { activityService } from '../services/activity.service';
import { logger } from '../utils/logger';

export function registerActivityHandlers(io: Server, socket: Socket) {
  const user = socket.data.user;

  // Client requests to join a project room (for real-time activity feed)
  socket.on('project:join', (projectId: string) => {
    socket.join(`project:${projectId}`);
    logger.debug(`${user.name} joined project room: ${projectId}`);
  });

  socket.on('project:leave', (projectId: string) => {
    socket.leave(`project:${projectId}`);
    logger.debug(`${user.name} left project room: ${projectId}`);
  });

  // Client requests missed events since last seen timestamp
  socket.on('activity:catchup', async ({ since, projectId }: { since?: string; projectId?: string }) => {
    try {
      let activities;
      if (projectId) {
        activities = await activityService.getProjectActivities(projectId, since, 20);
      } else {
        activities = await activityService.getActivities(user.id, user.role, since, 20);
      }
      socket.emit('activity:catchup:response', activities);
    } catch (err) {
      logger.error('activity:catchup error:', err);
    }
  });
}
