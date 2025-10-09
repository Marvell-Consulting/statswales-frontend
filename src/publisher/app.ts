import path from 'node:path';

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import expressReactViews from 'express-react-views';

import { checkConfig } from '../shared/config/check-config';
import { httpLogger, logger } from '../shared/utils/logger';
import { strictTransport } from '../shared/middleware/strict-transport';
import session from '../shared/middleware/session';
import { ensureAuthenticated } from './middleware/ensure-authenticated';
import { rateLimiter } from '../shared/middleware/rate-limiter';
import { i18next, i18nextMiddleware } from '../shared/middleware/translation';
import { languageSwitcher } from '../shared/middleware/language-switcher';
import { initServices } from './middleware/services';
import { handleAsset404 } from '../shared/middleware/asset-404';
import { auth } from './routes/auth';
import { healthcheck } from '../shared/routes/healthcheck';
import { publish } from './routes/publish';
import { developer } from './routes/developer';
import { errorHandler } from '../shared/routes/error-handler';
import { homepage } from './routes/homepage';
import { notFound } from '../shared/routes/not-found';
import { guidance } from './routes/guidance';
import { cookies } from '../shared/routes/cookies';
import { admin } from './routes/admin';
import { cookieBanner } from '../shared/middleware/cookie-banner';
import { history } from '../shared/middleware/history';
import { staticPages } from '../shared/routes/static-pages';

const app: Application = express();
checkConfig();

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
app.use(session);
app.use(cookieBanner);
app.use(i18nextMiddleware.handle(i18next));
app.use(languageSwitcher);
app.use(initServices);
app.use(history);

// configure the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', expressReactViews.createEngine());

// public routes
app.use('/healthcheck', rateLimiter, healthcheck);
app.use('/:lang/auth', rateLimiter, auth);
app.use('/:lang/guidance', rateLimiter, guidance);
app.use('/:lang/cookies', rateLimiter, cookies);
app.use('/:lang', rateLimiter, staticPages);

// authenticated routes
app.use('/:lang/publish', rateLimiter, ensureAuthenticated, publish);
app.use('/:lang/developer', rateLimiter, ensureAuthenticated, developer);
app.use('/:lang/admin', rateLimiter, ensureAuthenticated, admin);
app.use('/:lang', rateLimiter, ensureAuthenticated, homepage);

// handle 404s
app.use(notFound);

// handle errors
app.use(errorHandler);

logger.info('Publisher routes loaded');

export default app;
