import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from './logger';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  logger.fatal('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5_000, // default 0 = wait forever
});

// Unhandled 'error' on the pool crashes the process
pool.on('error', (err) => logger.error({ err }, 'idle postgres client error'));

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Await this in server.ts before listen()
export const connectDatabase = async () => {
  await prisma.$queryRaw`SELECT 1`;
  logger.info('Database connected successfully');
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  await pool.end();
};

export default prisma;
