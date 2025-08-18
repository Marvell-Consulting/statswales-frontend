import path from 'node:path';

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import expressReactViews from 'express-react-views';

import { appConfig } from '../shared/config';
import { checkConfig } from '../shared/config/check-config';
import { httpLogger, logger } from '../shared//utils/logger';
import { strictTransport } from '../shared//middleware/strict-transport';
import { rateLimiter } from '../shared//middleware/rate-limiter';
import { i18next, i18nextMiddleware } from '../shared//middleware/translation';
import { languageSwitcher } from '../shared//middleware/language-switcher';
import { initServices } from '../consumer/middleware/services';
import { healthcheck } from '../shared/routes/healthcheck';
import { errorHandler } from '../shared/routes/error-handler';
import { notFound } from '../shared/routes/not-found';
import { consumer } from './routes/consumer';
import { cookies } from '../shared/routes/cookies';
import { feedback } from '../shared/routes/feedback';
import { handleAsset404 } from '../shared/middleware/asset-404';
import { cookieBanner } from '../shared/middleware/cookie-banner';
import { history } from '../shared/middleware/history';
import session from '../shared/middleware/session';
import { staticPages } from '../shared/routes/static-pages';

const app: Application = express();
const config = appConfig();
checkConfig();

logger.info(`App config loaded for '${config.env}' env`);

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(strictTransport);

// asset routes (bypass middleware)
app.use('/assets', express.static(path.join(__dirname, '../public')));
app.use(handleAsset404);

// enable middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());
app.use(cookieBanner);
app.use(i18nextMiddleware.handle(i18next));
app.use(languageSwitcher);
app.use(initServices);
app.use(session);
app.use(history);

// configure the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', expressReactViews.createEngine());

// public routes
app.use('/healthcheck', rateLimiter, healthcheck);
app.use('/:lang/cookies', rateLimiter, cookies);
app.use('/:lang/feedback', rateLimiter, feedback);
app.use('/:lang', rateLimiter, staticPages);
app.use('/:lang', rateLimiter, consumer);

// handle 404s
app.use(notFound);

// handle errors
app.use(errorHandler);

logger.info('Consumer routes loaded');

export default app;
