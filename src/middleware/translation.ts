import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

const ENGLISH = 'en-GB';
const WELSH = 'cy-GB';

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
            loadPath: `${__dirname}/../resources/locales/{{lng}}.json`
        },
        fallbackLng: ENGLISH,
        preload: [ENGLISH, WELSH],
        debug: false
    });

export { i18next, i18nextMiddleware, ENGLISH, WELSH };
