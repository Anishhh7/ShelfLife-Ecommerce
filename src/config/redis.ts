import { Redis } from 'ioredis';
import { logger } from '../lib/logger';

const redis = new Redis({
  host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,

});
export default redis;

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error) => {
  logger.error({error}, 'Redis connection error');
});