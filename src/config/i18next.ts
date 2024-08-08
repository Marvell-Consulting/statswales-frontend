import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        detection: {
            order: ['path', 'cookie', 'header'],
            lookupHeader: 'accept-language',
            caches: false,
            ignoreRoutes: [
                '/healthcheck',
                '/public',
                '/css',
                '/assets',
                '/auth',
                '/favicon.ico',
                '/robots.txt',
                '/sitemap.xml'
            ]
        },
        backend: {
            loadPath: `${__dirname}/resources/locales/{{lng}}.json`
        },
        fallbackLng: 'en-GB',
        preload: ['en-GB', 'cy-GB'],
        debug: false
    });

export const ENGLISH = 'en-GB';
export const WELSH = 'cy-GB';
export const t = i18next.t;
