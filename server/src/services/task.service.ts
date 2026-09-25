import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { Role, TaskStatus } from '@prisma/client';
import { activityService } from './activity.service';
import { notificationService } from './notification.service';

export class TaskService {
  async getTasks(projectId: string, userId: string, role: Role, filters: any = {}) {
    const where: any = { projectId };

    if (role === Role.DEVELOPER) {
      where.assignedToId = userId;
    }

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.isOverdue !== undefined) where.isOverdue = filters.isOverdue;
    if (filters.assignedToId && role !== Role.DEVELOPER) where.assignedToId = filters.assignedToId;
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total, page, limit };
  }

  async getTaskById(id: string, userId: string, role: Role) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, createdById: true } },
      },
    });
    if (!task) throw new NotFoundError('Task');

    if (role === Role.DEVELOPER && task.assignedToId !== userId) {
      throw new ForbiddenError('You can only view tasks assigned to you');
    }
    return task;
  }

  async createTask(
    projectId: string,
    data: { title: string; description?: string; priority?: any; dueDate?: string; assignedToId?: string },
    creatorId: string,
    creatorName: string,
    io?: any,
  ) {
    // Get next task number for this project
    const lastTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { taskNumber: 'desc' },
      select: { taskNumber: true },
    });
    const taskNumber = (lastTask?.taskNumber ?? 0) + 1;

    const task = await prisma.task.create({
      data: {
        projectId,
        taskNumber,
        title: data.title,
        description: data.description,
        priority: data.priority ?? 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignedToId: data.assignedToId,
        createdById: creatorId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Log activity
    const activity = await activityService.log({
      userId: creatorId,
      projectId,
      taskId: task.id,
      action: 'TASK_CREATED',
      details: { taskTitle: task.title, taskNumber: task.taskNumber },
    });

    // Emit real-time activity
    if (io) {
      const activityWithUser = await prisma.activityLog.findUnique({
        where: { id: activity.id },
        include: { user: { select: { id: true, name: true } } },
      });
      io.to(`project:${projectId}`).emit('activity:new', activityWithUser);
      io.to('global-feed').emit('activity:new', activityWithUser);
    }

    // Notify assignee if assigned
    if (data.assignedToId) {
      const notif = await notificationService.create({
        userId: data.assignedToId,
        actorId: creatorId,
        taskId: task.id,
        type: 'TASK_ASSIGNED',
        message: `${creatorName} assigned you to Task #${taskNumber}: ${task.title}`,
      });
      if (io) {
        io.to(`user:${data.assignedToId}`).emit('notification:new', notif);
      }
    }

    return task;
  }

  async updateTask(id: string, data: any, userId: string, role: Role, userName: string, io?: any) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { createdById: true, id: true } } },
    });
    if (!task) throw new NotFoundError('Task');

    if (role === Role.PM && task.project.createdById !== userId) {
      throw new ForbiddenError('You can only update tasks in your projects');
    }

    const old = { ...task };
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Log + emit status change
    if (data.status && data.status !== old.status) {
      const act = await activityService.log({
        userId,
        projectId: task.projectId,
        taskId: id,
        action: 'STATUS_CHANGE',
        details: { from: old.status, to: data.status, taskTitle: task.title, taskNumber: task.taskNumber },
      });
      if (io) {
        const actWithUser = await prisma.activityLog.findUnique({
          where: { id: act.id },
          include: { user: { select: { id: true, name: true } } },
        });
        io.to(`project:${task.projectId}`).emit('activity:new', actWithUser);
        io.to('global-feed').emit('activity:new', actWithUser);
      }
    }

    // Log + emit assignment change
    if (data.assignedToId && data.assignedToId !== old.assignedToId) {
      const act = await activityService.log({
        userId,
        projectId: task.projectId,
        taskId: id,
        action: 'TASK_ASSIGNED',
        details: { taskTitle: task.title, taskNumber: task.taskNumber, assigneeName: userName },
      });
      if (io) {
        const actWithUser = await prisma.activityLog.findUnique({
          where: { id: act.id },
          include: { user: { select: { id: true, name: true } } },
        });
        io.to(`project:${task.projectId}`).emit('activity:new', actWithUser);
        io.to('global-feed').emit('activity:new', actWithUser);
      }
      const notif = await notificationService.create({
        userId: data.assignedToId,
        actorId: userId,
        taskId: id,
        type: 'TASK_ASSIGNED',
        message: `${userName} assigned you to Task #${task.taskNumber}: ${task.title}`,
      });
      if (io) {
        io.to(`user:${data.assignedToId}`).emit('notification:new', notif);
      }
    }

    return updated;
  }

  async updateTaskStatus(id: string, status: TaskStatus, userId: string, role: Role, userName: string, io?: any) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { id: true, createdById: true } } },
    });
    if (!task) throw new NotFoundError('Task');

    if (role === Role.DEVELOPER && task.assignedToId !== userId) {
      throw new ForbiddenError('You can only update status of tasks assigned to you');
    }

    const oldStatus = task.status;
    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    const activity = await activityService.log({
      userId,
      projectId: task.projectId,
      taskId: id,
      action: 'STATUS_CHANGE',
      details: { from: oldStatus, to: status, taskTitle: task.title, taskNumber: task.taskNumber },
    });

    // Emit to Socket.io if available
    if (io) {
      const activityWithUser = await prisma.activityLog.findUnique({
        where: { id: activity.id },
        include: { user: { select: { id: true, name: true } } },
      });
      io.to(`project:${task.projectId}`).emit('activity:new', activityWithUser);
      io.to('global-feed').emit('activity:new', activityWithUser);
    }

    // Notify PM when task goes to IN_REVIEW
    if (status === TaskStatus.IN_REVIEW) {
      await notificationService.create({
        userId: task.project.createdById,
        actorId: userId,
        taskId: id,
        type: 'TASK_IN_REVIEW',
        message: `${userName} moved Task #${task.taskNumber} to IN REVIEW: ${task.title}`,
      });
      if (io) {
        const notif = await notificationService.getLastForUser(task.project.createdById);
        if (notif) io.to(`user:${task.project.createdById}`).emit('notification:new', notif);
      }
    }

    return updated;
  }
}

export const taskService = new TaskService();
