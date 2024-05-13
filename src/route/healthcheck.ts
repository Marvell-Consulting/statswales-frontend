import { env } from 'process';

import { Router } from 'express';
import pino from 'pino';

import { API } from '../controllers/api';

export const logger = pino({
    name: 'StatsWales-Alpha-App: Healthcheck',
    level: 'debug'
});

const BACKEND_API_URL = env.BACKEND_API_URL || 'http://localhost:3001';
const APIInstance = new API(BACKEND_API_URL, logger);

export const healthcheck = Router();

healthcheck.get('/', (req, res) => {
    const lang = req.i18n.language || 'en-GB';
    logger.info(`Healthcheck requested in ${lang}`);
    const statusMsg = req.t('app-running');

    res.json({
        status: statusMsg,
        notes: req.t('health-notes'),
        services: {
            backend_connected: APIInstance.ping()
        }
    });
});
