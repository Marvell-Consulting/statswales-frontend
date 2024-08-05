import path from 'path';

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import rateLimit from 'express-rate-limit';
import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import './config/i18next';
import passport, { auth } from './config/auth_config';
import { healthcheck } from './route/healthcheck';
import { publish } from './route/publish';
import { view } from './route/view';

declare module 'express-session' {
    interface SessionData {
        returnTo: string;
        titleLanguage: string;
        datasetTitle: string;
        previewFactTableID: string;
        factTableFileID: string;
        currentDatasetID: string;
    }
}
if (process.env.NODE_ENV !== 'test') {
    const variables = [
        'BACKEND_SERVER',
        'BACKEND_PORT',
        'BACKEND_PROTOCOL',
        'SESSION_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET'
    ];

    variables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is missing`);
        }
    });
}

const app: Application = express();

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        detection: {
            order: ['path', 'header'],
            lookupHeader: 'accept-language',
            caches: false,
            ignoreRoutes: ['/healthcheck', '/public', '/css', '/assets']
        },
        backend: {
            loadPath: `${__dirname}/resources/locales/{{lng}}.json`
        },
        fallbackLng: 'en-GB',
        preload: ['en-GB', 'cy-GB'],
        debug: false
    });

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
        res.status(429).json({
            message: 'Too many requests, please try again later.'
        });
    }
});

const sessionConfig = {
    secret: process.env.SESSION_SECRET === undefined ? 'default' : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    }
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

// Middleware Config
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(i18nextMiddleware.handle(i18next));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load Routes
app.use('/auth', auth);
app.use('/:lang/publish', publish, apiLimiter);
app.use('/:lang/dataset', view, apiLimiter);
app.use('/:lang/healthcheck', healthcheck);
app.use('/healthcheck', healthcheck);
app.use('/public', express.static(`${__dirname}/public`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/assets', express.static(`${__dirname}/assets`));

// App Root Routes
app.get('/', (req: Request, res: Response) => {
    const lang = req.headers['accept-language'] || req.headers['Accept-Language'] || req.i18n.language || 'en-GB';
    if (lang.includes('cy')) {
        res.redirect('/cy-GB');
    } else {
        res.redirect('/en-GB');
    }
});

app.get('/:lang/', apiLimiter, (req: Request, res: Response) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.render('index');
});

export default app;
