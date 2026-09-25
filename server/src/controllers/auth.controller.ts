import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
    }
    const result = await authService.refresh(token);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
