import path from 'node:path';

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';

import { appConfig } from './config';
import { checkConfig } from './config/check-config';
import { httpLogger, logger } from './utils/logger';
import session from './middleware/session';
import { ensureAuthenticated } from './middleware/ensure-authenticated';
import { rateLimiter } from './middleware/rate-limiter';
import { i18next, i18nextMiddleware } from './middleware/translation';
import { languageSwitcher } from './middleware/language-switcher';
import { initServices } from './middleware/services';
import { auth } from './routes/auth';
import { healthcheck } from './routes/healthcheck';
import { publish } from './routes/publish';
import { developer } from './routes/developer';
import { errorHandler } from './routes/error-handler';
import { homepage } from './routes/homepage';
import { notFound } from './routes/not-found';
import { guidance } from './routes/guidance';
import { consumer } from './routes/consumer';
import { cookies } from './routes/cookie';
import { handleAsset404 } from './middleware/asset-404';
import { admin } from './routes/admin';

const app: Application = express();
const config = appConfig();
checkConfig();

logger.info(`App config loaded for '${config.env}' env`);

app.disable('x-powered-by');
app.set('trust proxy', 1);

// asset routes (bypass middleware)
app.use('/public', express.static(`${__dirname}/public`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/assets', express.static(`${__dirname}/assets`));
app.use(handleAsset404);

// enable middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());
app.use(session);
app.use(i18nextMiddleware.handle(i18next));
app.use(languageSwitcher);
app.use(initServices);

// configure the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// public routes
app.use('/healthcheck', rateLimiter, healthcheck);
app.use('/:lang/auth', rateLimiter, auth);
app.use('/:lang/published', rateLimiter, consumer);
app.use('/:lang/guidance', rateLimiter, guidance);
app.use('/:lang/cookies', rateLimiter, ensureAuthenticated, cookies);

// authenticated routes
app.use('/:lang/publish', rateLimiter, ensureAuthenticated, publish);
app.use('/:lang/developer', rateLimiter, ensureAuthenticated, developer);
app.use('/:lang/admin', rateLimiter, ensureAuthenticated, admin);
app.use('/:lang', rateLimiter, ensureAuthenticated, homepage);

// handle 404s
app.all('*', notFound);

// handle errors
app.use(errorHandler);

logger.info('Routes loaded');

export default app;
