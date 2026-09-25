import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async getDeveloperUsers() {
    return prisma.user.findMany({
      where: { role: 'DEVELOPER' },
      select: { id: true, name: true, email: true },
    });
  }
}

export const userService = new UserService();
