import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config({ path: './.env', quiet: true });

const seed = async () => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('Admin password is not defined');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: {
      email: process.env.ADMIN_EMAIL,
    },
    update: {},
    create: {
      name: process.env.ADMIN_NAME!,
      email: process.env.ADMIN_EMAIL!,
      phone: process.env.ADMIN_PHONE!,
      password: hashedPassword,
      passwordConfirm: hashedPassword,
      role: 'Admin',
    },
  });
  console.log('Admin seeded successfully');
};
seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect;
  });
