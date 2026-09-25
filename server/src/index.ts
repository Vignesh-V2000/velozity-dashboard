import 'dotenv/config';
import { env } from './config/env';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { getActivities } from './controllers/activity.controller';
import { auth } from './middleware/auth';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import taskTopRoutes from './routes/taskTop.routes';
import notificationRoutes from './routes/notification.routes';
import clientRoutes from './routes/client.routes';

import { initSocket } from './socket';
import { setIO } from './controllers/task.controller';
import { startOverdueJob } from './jobs/queue';
import './jobs/overdueTask.job'; // register processor

const app = express();
const httpServer = http.createServer(app);

// --- Middleware ---
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskTopRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clients', clientRoutes);
app.get('/api/activities', auth, getActivities);

// Health check
app.get('/api/health', (_req: import('express').Request, res: import('express').Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Error handler (MUST be last) ---
app.use(errorHandler);

// --- Socket.io ---
const io = initSocket(httpServer);
setIO(io);

// --- Start ---
httpServer.listen(env.PORT, async () => {
  logger.info(`✅ Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  try {
    await startOverdueJob();
  } catch (err) {
    logger.warn('Could not start overdue job (Redis may be unavailable):', err);
  }
});

export { app, io };
