import express from 'express';
import type { Application } from 'express';
import morgan from 'morgan';


const app: Application = express();
app.set('query parser', 'extended')

app.use(express.json());


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

export default app;
