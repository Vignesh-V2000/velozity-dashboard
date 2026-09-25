import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';
import { getRedisClient } from '../config/redis';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role } = req.body;
    const user = await authService.createUser(email, password, name, role);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getDevelopers(req: Request, res: Response, next: NextFunction) {
  try {
    const devs = await userService.getDeveloperUsers();
    res.json({ success: true, data: devs });
  } catch (err) {
    next(err);
  }
}

export async function getOnlineCount(req: Request, res: Response, next: NextFunction) {
  try {
    const redis = getRedisClient();
    const count = await redis.scard('online:users');
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
}
