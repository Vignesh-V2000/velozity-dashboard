import { overdueQueue } from './queue';
import prisma from '../config/database';
import { logger } from '../utils/logger';

overdueQueue.process(async (_job) => {
  const now = new Date();

  const result = await prisma.task.updateMany({
    where: {
      dueDate: { lt: now },
      status: { notIn: ['DONE'] },
      isOverdue: false,
    },
    data: { isOverdue: true },
  });

  if (result.count > 0) {
    logger.info(`Overdue job: flagged ${result.count} task(s) as overdue`);
  }

  return { flagged: result.count };
});

overdueQueue.on('completed', (job, result) => {
  if (result.flagged > 0) {
    logger.info(`Overdue job completed: ${result.flagged} tasks flagged`, { jobId: job.id });
  }
});

overdueQueue.on('failed', (job, err) => {
  logger.error('Overdue job failed', { jobId: job.id, error: err.message });
});

logger.info('Overdue task job worker registered');
