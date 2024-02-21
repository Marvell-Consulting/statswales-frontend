import { Router } from 'express';

export const apiRoute = Router();

apiRoute.get('/', (req, res) => {
    res.json({ message: 'API is available' });
});
