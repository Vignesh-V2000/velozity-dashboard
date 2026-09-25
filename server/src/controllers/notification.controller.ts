import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const [notifications, unreadCount] = await Promise.all([
      notificationService.getForUser(req.user.id, limit),
      notificationService.getUnreadCount(req.user.id),
    ]);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, data: { message: 'All marked as read' } });
  } catch (err) {
    next(err);
  }
}
