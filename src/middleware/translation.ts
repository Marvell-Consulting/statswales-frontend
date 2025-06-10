import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

import { appConfig } from '../config';

const ignoreRoutes = ['/public', '/css', '/assets', '/healthcheck', '/v1'];

const config = appConfig();
const cookieDomain = new URL(config.auth.jwt.cookieDomain).hostname;

const TRANSLATIONS = config.language.availableTranslations;
const SUPPORTED_LOCALES = config.language.supportedLocales;

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
      loadPath: `${__dirname}/../i18n/{{lng}}.json`
    },
    fallbackLng: config.language.fallback,
    preload: TRANSLATIONS,
    supportedLngs: SUPPORTED_LOCALES,
    debug: false
  });

export { i18next, i18nextMiddleware, ignoreRoutes, SUPPORTED_LOCALES };
