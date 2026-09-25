import { Router, Request, Response, NextFunction } from 'express';
import { auth } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

router.use(auth);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { company: 'asc' } });
    res.json({ success: true, data: clients });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, company } = req.body;
    const client = await prisma.client.create({ data: { name, email, company } });
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
});

export default router;
