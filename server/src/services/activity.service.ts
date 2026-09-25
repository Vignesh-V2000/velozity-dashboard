import prisma from '../config/database';
import { Role } from '@prisma/client';

interface LogArgs {
  userId: string;
  projectId: string;
  taskId?: string;
  action: string;
  details?: Record<string, unknown>;
}

export class ActivityService {
  async log(args: LogArgs) {
    return prisma.activityLog.create({
      data: {
        userId: args.userId,
        projectId: args.projectId,
        taskId: args.taskId,
        action: args.action,
        details: args.details as any,
      },
    });
  }

  async getActivities(userId: string, role: Role, since?: string, limit = 50) {
    const where: any = {};

    if (since) {
      where.createdAt = { gt: new Date(since) };
    }

    if (role === Role.PM) {
      where.project = { createdById: userId };
    } else if (role === Role.DEVELOPER) {
      where.OR = [{ userId }, { task: { assignedToId: userId } }];
    }
    // ADMIN: no filter — sees all

    return prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, taskNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getProjectActivities(projectId: string, since?: string, limit = 50) {
    const where: any = { projectId };
    if (since) where.createdAt = { gt: new Date(since) };

    return prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, taskNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const activityService = new ActivityService();
