import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export function generateAccessToken(user: TokenPayload): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY } as SignOptions,
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
}
