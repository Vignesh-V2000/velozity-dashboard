import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';
import { env } from '../config/env';

export class AuthService {
  async createUser(email: string, password: string, name: string, role: Role) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('Email already in use');

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const rawRefreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: { token: rawRefreshToken, userId: user.id, expiresAt },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async refresh(rawToken: string) {
    let payload: { id: string };
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: rawToken } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new NotFoundError('User');

    // Rotate: revoke old token, issue new pair
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const newAccess = generateAccessToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const newRaw = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: newRaw, userId: user.id, expiresAt } });

    return { accessToken: newAccess, refreshToken: newRaw, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async logout(rawToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: rawToken },
      data: { revoked: true },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }
}

export const authService = new AuthService();
