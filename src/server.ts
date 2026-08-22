import 'dotenv/config';
import app from './app';
import type { Server } from 'node:http';
import prisma from './lib/prisma';

/////////Catch Sychronous errors////////////////////
let server: Server;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const startServer = async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    const port: number = Number(process.env.PORT) || 3000;

    server = app.listen(port, () => {
      console.log(`Server connected at ${port}!!!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

///////// Catch Unhandled Promise Rejections ////////////////////

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection !!!  Shutting down....');

  if (reason instanceof Error) {
    console.error(reason.name, reason.message);
  } else {
    console.error('Rejection reason:', reason);
  }

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
