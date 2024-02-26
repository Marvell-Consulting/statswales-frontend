import { Router } from 'express';

export const healthcheck = Router();

healthcheck.get('/', (req, res) => {
    res.json({
        status: 'App is running',
        notes: 'Expand endpoint to check for database connection and other services.'
    });
});
