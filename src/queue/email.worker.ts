import { Worker } from 'bullmq';
import redis from '../config/redis';
import { logger } from '../lib/logger';
import sendEmail from '../config/email';
import type { EmailJob } from './email.queue';

const emailWorker = new Worker<EmailJob>(
  'email-queue',
  async (job) => {
    logger.info(
      {
        jobId: job.id,
        jobName: job.name,
        data: job.data,
      },
      'Processing email Job'
    );

    await sendEmail(job.data);

    logger.info(
      {
        jobId: job.id,
      },
      'Email sent successfully'
    );
  },
  {
    connection: redis,
  }
);

emailWorker.on('completed', (job) => {
  logger.info(
    {
      jonId: job.id,
    },
    'Email job completed'
  );
});

emailWorker.on('failed', (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      error,
    },
    'Email job failed'
  );
});
logger.info('Email worker started');
export default emailWorker;
