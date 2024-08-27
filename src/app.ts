import path from 'node:path';

import express, { Application, Request, Response } from 'express';

import passport, { auth } from './routes/auth';
import session from './middleware/session';
import { ensureAuthenticated } from './middleware/ensure-authenticated';
import { rateLimiter } from './middleware/rate-limiter';
import { i18next, i18nextMiddleware } from './middleware/translation';
import { healthcheck } from './routes/healthcheck';
import { publish } from './routes/publish';
import { view } from './routes/view';
import { httpLogger } from './utils/logger';

const app: Application = express();

app.disable('x-powered-by');

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
}

// enable middleware
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use(i18nextMiddleware.handle(i18next));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// configure the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load Routes
app.use('/public', express.static(`${__dirname}/public`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/assets', express.static(`${__dirname}/assets`));
app.use('/auth', auth);
app.use('/healthcheck', healthcheck);

app.use('/:lang/publish', publish, rateLimiter, ensureAuthenticated);
app.use('/:lang/dataset', view, rateLimiter, ensureAuthenticated);
app.use('/:lang/healthcheck', healthcheck);

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
