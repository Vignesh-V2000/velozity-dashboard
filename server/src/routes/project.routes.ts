import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getProjectStats } from '../controllers/project.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import taskRoutes from './task.routes';
import activityRoutes from './activity.routes';

const router = Router();

router.use(auth);

router.get('/stats', roleGuard('ADMIN'), getProjectStats);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', roleGuard('ADMIN', 'PM'), validate(createProjectSchema), createProject);
router.put('/:id', roleGuard('ADMIN', 'PM'), validate(updateProjectSchema), updateProject);
router.delete('/:id', roleGuard('ADMIN'), deleteProject);

// Nested task and activity routes
router.use('/:projectId/tasks', taskRoutes);
router.use('/:projectId/activities', activityRoutes);

export default router;
