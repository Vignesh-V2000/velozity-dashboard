import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';

let _io: any;
export function setIO(io: any) { _io = io; }

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const result = await taskService.getTasks(projectId, req.user.id, req.user.role, req.query);
    res.json({
      success: true,
      data: result.tasks,
      pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const task = await taskService.createTask(projectId, req.body, req.user.id, req.user.name, _io);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id, req.user.role, req.user.name, _io);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const task = await taskService.updateTaskStatus(req.params.id, status, req.user.id, req.user.role, req.user.name, _io);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}
