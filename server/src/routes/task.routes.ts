import { Router } from 'express';
import { getTasks, createTask } from '../controllers/task.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createTaskSchema } from '../validators/task.validator';

const router = Router({ mergeParams: true });

router.use(auth);

router.get('/', getTasks);
router.post('/', roleGuard('ADMIN', 'PM'), validate(createTaskSchema), createTask);

export default router;
