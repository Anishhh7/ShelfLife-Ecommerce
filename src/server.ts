import 'dotenv/config';
import app from './app';
import prisma, { connectDatabase } from './lib/prisma';
import { logger } from './lib/logger';

await connectDatabase().catch((err) => {
  logger.fatal({ err }, 'database unreachable — exiting');
  process.exit(1);
});

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`server listening on ${process.env.PORT || 3000}`);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'unhandled rejection:shutting down');
  server.close(
    () => void prisma.$disconnect().finally(() => process.exit(1))
  );
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaught exception:shutting down');
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received: closing gracefully');
  server.close(
    () => void prisma.$disconnect().finally(() => process.exit(0))
  );
});
