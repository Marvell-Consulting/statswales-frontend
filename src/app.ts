import path from 'node:path';

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';

import { checkConfig } from './config/check-config';
import { httpLogger, logger } from './utils/logger';
import session from './middleware/session';
import { ensureAuthenticated } from './middleware/ensure-authenticated';
import { rateLimiter } from './middleware/rate-limiter';
import { i18next, i18nextMiddleware } from './middleware/translation';
import { languageSwitcher } from './middleware/language-switcher';
import { auth } from './routes/auth';
import { healthcheck } from './routes/healthcheck';
import { publish } from './routes/publish';
import { view } from './routes/view';
import { appConfig } from './config';
import { errorHandler } from './routes/error-handler';
import { NotFoundException } from './exceptions/not-found.exception';
import { homepage } from './routes/homepage';

const app: Application = express();
const config = appConfig();
checkConfig();

logger.info(`App config loaded for '${config.env}' env`);

app.disable('x-powered-by');
app.set('trust proxy', 1);

// enable middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());
app.use(session);
app.use(i18nextMiddleware.handle(i18next));
app.use(languageSwitcher);

// configure the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// load routes
app.use('/public', express.static(`${__dirname}/public`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/assets', express.static(`${__dirname}/assets`));

app.use('/healthcheck', rateLimiter, healthcheck);
app.use('/:lang/auth', rateLimiter, auth);
app.use('/:lang/publish', rateLimiter, ensureAuthenticated, publish);
app.use('/:lang/dataset', rateLimiter, ensureAuthenticated, view);
app.use('/:lang', rateLimiter, ensureAuthenticated, homepage);

// handle errors
app.use((req, res, next) => {
    next(new NotFoundException('Page not found'));
});

app.use(errorHandler);

logger.info('Routes loaded');

export default app;
