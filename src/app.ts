import path from 'node:path';

import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';

import { checkConfig } from './config/check-config';
import { httpLogger, logger } from './utils/logger';
import session from './middleware/session';
import { ensureAuthenticated } from './middleware/ensure-authenticated';
import { rateLimiter } from './middleware/rate-limiter';
import { i18next, i18nextMiddleware } from './middleware/translation';
import { auth } from './routes/auth';
import { healthcheck } from './routes/healthcheck';
import { publish } from './routes/publish';
import { view } from './routes/view';
import { appConfig } from './config';

checkConfig();

const app: Application = express();

const config = appConfig();

logger.info(`App config loaded for '${config.env}' env`);

app.disable('x-powered-by');

app.set('trust proxy', 1);

// enable middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());
app.use(i18nextMiddleware.handle(i18next));
app.use(session);

// configure the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load Routes
app.use('/public', express.static(`${__dirname}/public`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/assets', express.static(`${__dirname}/assets`));
app.use('/auth', rateLimiter, auth);
app.use('/healthcheck', rateLimiter, healthcheck);

app.use('/:lang/publish', rateLimiter, ensureAuthenticated, publish);
app.use('/:lang/dataset', rateLimiter, ensureAuthenticated, view);
app.use('/:lang/healthcheck', rateLimiter, healthcheck);

app.get('/', (req: Request, res: Response) => {
    const lang = req.headers['accept-language'] || req.headers['Accept-Language'] || req.i18n.language || 'en-GB';
    if (lang.includes('cy')) {
        res.redirect('/cy-GB');
    } else {
        res.redirect('/en-GB');
    }
});

app.get('/:lang/', rateLimiter, ensureAuthenticated, (req: Request, res: Response) => {
    res.render('index');
});

export default app;
