import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';

export class ProjectService {
  async getProjects(userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return prisma.project.findMany({
        include: {
          client: true,
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (role === Role.PM) {
      return prisma.project.findMany({
        where: { createdById: userId },
        include: {
          client: true,
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // DEVELOPER: projects where they have assigned tasks
    return prisma.project.findMany({
      where: { tasks: { some: { assignedToId: userId } } },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProjectById(id: string, userId: string, role: Role) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) throw new NotFoundError('Project');

    if (role === Role.PM && project.createdById !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }

    if (role === Role.DEVELOPER) {
      const hasTask = await prisma.task.findFirst({
        where: { projectId: id, assignedToId: userId },
      });
      if (!hasTask) throw new ForbiddenError('You do not have access to this project');
    }

    return project;
  }

  async createProject(data: { name: string; description?: string; status?: any; clientId: string }, createdById: string) {
    return prisma.project.create({
      data: { ...data, createdById },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateProject(id: string, data: any, userId: string, role: Role) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundError('Project');

    if (role === Role.PM && project.createdById !== userId) {
      throw new ForbiddenError('You can only update your own projects');
    }

    return prisma.project.update({
      where: { id },
      data,
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async deleteProject(id: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundError('Project');
    await prisma.project.delete({ where: { id } });
  }

  async getProjectStats() {
    const [total, byStatus, overdueTasks] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({ by: ['status'], _count: true }),
      prisma.task.count({ where: { isOverdue: true } }),
    ]);
    return { total, byStatus, overdueTasks };
  }
}

export const projectService = new ProjectService();
