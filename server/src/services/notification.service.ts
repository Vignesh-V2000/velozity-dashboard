import prisma from '../config/database';
import { NotificationType } from '@prisma/client';

interface CreateNotificationArgs {
  userId: string;
  actorId: string;
  taskId?: string;
  type: NotificationType | string;
  message: string;
}

export class NotificationService {
  async create(args: CreateNotificationArgs) {
    return prisma.notification.create({
      data: {
        userId: args.userId,
        actorId: args.actorId,
        taskId: args.taskId,
        type: args.type as NotificationType,
        message: args.message,
      },
      include: {
        actor: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, taskNumber: true } },
      },
    });
  }

  async getForUser(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      include: {
        actor: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, taskNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getLastForUser(userId: string) {
    return prisma.notification.findFirst({
      where: { userId },
      include: {
        actor: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, taskNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

export const notificationService = new NotificationService();
