import { Router } from 'express';
import pino from 'pino';

// eslint-disable-next-line import/no-cycle
import { API } from '../controllers/api';

export const logger = pino({
    name: 'StatsWales-Alpha-App: Healthcheck',
    level: 'debug'
});

const APIInstance = new API();

export const healthcheck = Router();

healthcheck.get('/', async (req, res) => {
    const lang = req.i18n.language || 'en-GB';
    logger.info(`Healthcheck requested in ${lang}`);
    const statusMsg = req.t('app-running');
    const beConnected = await APIInstance.ping();
    res.json({
        status: statusMsg,
        notes: req.t('health-notes'),
        services: {
            backend_connected: beConnected
        }
    });
});
