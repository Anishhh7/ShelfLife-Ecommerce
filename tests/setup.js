import dotenv from 'dotenv';
dotenv.config({ path: './Config/config.env' });
 
import mongoose from 'mongoose';
 
beforeAll(async () => {
  const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
  await mongoose.connect(DB, {
    serverSelectionTimeoutMS: 20000,
  });
}, 30000);
 
afterAll(async () => {
  await mongoose.connection.close();
}, 15000);