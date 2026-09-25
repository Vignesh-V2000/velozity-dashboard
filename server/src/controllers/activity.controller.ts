import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';

export async function getActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const since = req.query.since as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const activities = await activityService.getActivities(req.user.id, req.user.role, since, limit);
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
}

export async function getProjectActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const since = req.query.since as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const activities = await activityService.getProjectActivities(projectId, since, limit);
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
}
