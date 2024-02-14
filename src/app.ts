import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Express server is running' });
});

export default app;
