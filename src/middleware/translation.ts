import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

import { appConfig } from '../config';

const ENGLISH = 'en';
const ENGLISH_GB = 'en-GB';
const WELSH = 'cy';
const WELSH_GB = 'cy-GB';
const SUPPORTED_LANGS = [ENGLISH, ENGLISH_GB, WELSH, WELSH_GB];

const ignoreRoutes = ['/public', '/css', '/assets', '/healthcheck'];

const config = appConfig();
const cookieDomain = new URL(config.auth.jwt.cookieDomain).hostname;

i18next
    .use(i18nextMiddleware.LanguageDetector)
    .use(Backend)
    .init({
        detection: {
            ignoreRoutes,
            order: ['querystring', 'path', 'cookie', 'header'],
            lookupQuerystring: 'lang',
            lookupPath: 'lang',
            lookupCookie: 'lang',
            lookupHeader: 'accept-language',
            caches: ['cookie'],
            cookieDomain,
            cookieSecure: config.session.secure
        },
        backend: {
            loadPath: `${__dirname}/translations/{{lng}}.json`
        },
        fallbackLng: 'en',
        preload: ['en', 'cy'],
        supportedLngs: SUPPORTED_LANGS,
        debug: false
    });

export { i18next, i18nextMiddleware, ignoreRoutes, ENGLISH, ENGLISH_GB, WELSH, WELSH_GB };
