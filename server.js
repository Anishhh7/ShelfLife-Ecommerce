import dotenv from 'dotenv';
import mongoose from 'mongoose';

//catch synchronous errors//

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception');
  console.error(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './Config/config.env', quiet: true });

const { default: app } = await import('./app.js');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('MongoDB Connected'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Sever connected at ${port} !!!`);

  //Catch unhandled Promise Rejections//

  process.on('Unhandled Rejection', (err) => {
    console.error('Unhandled Rejection !!!');
    console.error(err.name, err.message);

    server.close(() => {
      process.exit(1);
    });
  });
});
