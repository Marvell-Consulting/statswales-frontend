import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Express server is running' });
});

export default app;
