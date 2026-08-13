import app from './app.js';
import dotenv from 'dotenv';
dotenv.config({ path: './env', quiet: true });
import prisma from './config/prisma.js';


async function startServer() {
  await prisma.$connect();
  console.log('Database connected');

  const port: number = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Server connected at ${port}!!!`);
  });
}

startServer();
