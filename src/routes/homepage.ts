import { Router } from 'express';

export const homepage = Router();

homepage.get('/', async (req, res, next) => {
    res.render('index');
});
