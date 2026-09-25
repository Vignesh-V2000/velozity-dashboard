import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/database';

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.data.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
