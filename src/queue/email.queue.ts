import { Queue } from 'bullmq';
import redis from '../config/redis';

export interface EmailJob {
  email: string;
  subject: string;
  message: string;
}

const emailQueue = new Queue<EmailJob>('email-queue', {
  connection: redis,
});


export default emailQueue;
