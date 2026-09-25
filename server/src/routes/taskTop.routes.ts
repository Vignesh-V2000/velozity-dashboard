// Top-level task routes (for /api/tasks/:id operations)
import { Router } from 'express';
import { getTaskById, updateTask, updateTaskStatus } from '../controllers/task.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { updateTaskSchema, updateTaskStatusSchema } from '../validators/task.validator';

const router = Router();

router.use(auth);

router.get('/:id', getTaskById);
router.put('/:id', roleGuard('ADMIN', 'PM'), validate(updateTaskSchema), updateTask);
router.patch('/:id/status', validate(updateTaskStatusSchema), updateTaskStatus);

export default router;
