import { Router } from 'express';
import { getProjectActivities } from '../controllers/activity.controller';
import { auth } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(auth);
router.get('/', getProjectActivities);

export default router;
