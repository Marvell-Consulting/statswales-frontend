/* eslint-disable import/no-named-as-default-member */
import { Request } from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware, { LanguageDetector } from 'i18next-http-middleware';

import { appConfig } from '../config';

const config = appConfig();
const ignoreRoutes = ['/public', '/css', '/assets', '/healthcheck'];
const TRANSLATIONS = config.language.availableTranslations;
const SUPPORTED_LOCALES = config.language.supportedLocales;

const domainDetector = {
  name: 'domain',
  lookup: (req: Request): string | undefined => {
    if (req.hostname?.includes('stats.llyw.cymru')) {
      return 'cy-GB';
    }
    if (req.hostname?.includes('stats.gov.wales')) {
      return 'en-GB';
    }
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(domainDetector);

i18next
  .use(languageDetector)
  .use(Backend)
  .init({
    detection: {
      ignoreRoutes,
      order: ['querystring', 'path', 'cookie', 'domain', 'header'],
      lookupQuerystring: 'lang',
      lookupPath: 'lang',
      lookupCookie: 'lang',
      lookupHeader: 'accept-language',
      caches: ['cookie'],
      cookieSecure: config.session.secure,
      cookieHttpOnly: true,
      cookieSameSite: 'lax'
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
