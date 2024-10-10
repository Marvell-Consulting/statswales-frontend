import { NextFunction, Request, Response, Router } from 'express';

export const homepage = Router();

homepage.get('/', async (req: Request, res: Response, next: NextFunction) => {
    res.render('index');
});
