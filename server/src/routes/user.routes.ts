import { Router } from 'express';
import { getUsers, createUser, getDevelopers, getOnlineCount } from '../controllers/user.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createUserSchema } from '../validators/auth.validator';

const router = Router();

router.use(auth);

router.get('/', roleGuard('ADMIN'), getUsers);
router.post('/', roleGuard('ADMIN'), validate(createUserSchema), createUser);
router.get('/developers', roleGuard('ADMIN', 'PM'), getDevelopers);
router.get('/online-count', roleGuard('ADMIN'), getOnlineCount);

export default router;
