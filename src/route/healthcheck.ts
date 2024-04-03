import { Router } from 'express';

export const healthcheck = Router();

healthcheck.get('/', (req, res) => {
    const status = `{"${req.t('status-field')}": "${req.t('app-running')}", "${req.t('notes-field')}": "${req.t('health-notes')}"}`;
    const responseJson = JSON.parse(status);
    res.json(responseJson);
});
