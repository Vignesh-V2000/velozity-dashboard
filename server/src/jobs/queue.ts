import Bull from 'bull';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const overdueQueue = new Bull('overdue-tasks', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Add a repeatable job that runs every 5 minutes
export async function startOverdueJob() {
  // Remove old repeatable jobs first to avoid duplicates on restart
  const repeatableJobs = await overdueQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await overdueQueue.removeRepeatableByKey(job.key);
  }

  await overdueQueue.add({}, { repeat: { cron: '*/5 * * * *' } });
  logger.info('Overdue task job scheduled (every 5 minutes)');
}
