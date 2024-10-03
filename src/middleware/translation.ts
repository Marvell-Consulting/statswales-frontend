import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

const ENGLISH = 'en';
const WELSH = 'cy';
const AVAILABLE_LANGUAGES = [ENGLISH, WELSH];

i18next
    .use(i18nextMiddleware.LanguageDetector)
    .use(Backend)
    .init({
        detection: {
            order: ['path', 'header'],
            lookupHeader: 'accept-language',
            caches: false,
            ignoreRoutes: ['/healthcheck', '/public', '/css', '/assets']
        },
        backend: {
            loadPath: `${__dirname}/translations/{{lng}}.json`
        },
        fallbackLng: 'en',
        preload: AVAILABLE_LANGUAGES,
        debug: false
    });

export { i18next, i18nextMiddleware, ENGLISH, WELSH };
