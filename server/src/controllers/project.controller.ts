import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { activityService } from '../services/activity.service';

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.getProjects(req.user.id, req.user.role);
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    await activityService.log({
      userId: req.user.id,
      projectId: project.id,
      action: 'PROJECT_CREATED',
      details: { projectName: project.name },
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id, req.user.role);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function getProjectStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await projectService.getProjectStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
