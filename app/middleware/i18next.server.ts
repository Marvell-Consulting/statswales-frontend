import { unstable_createI18nextMiddleware } from 'remix-i18next/middleware';
import en from '~/locales/en';
import cy from '~/locales/cy';
import { appConfig } from '~/config';
import { createCookie } from 'react-router';
import { initReactI18next } from 'react-i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof en;
    };
  }
}

const config = appConfig();

export const SUPPORTED_LOCALES = config.language.supportedLocales;

export const ignoreRoutes = ['/public', '/css', '/assets', '/healthcheck', '/api', '/server'];

export const localeCookie = createCookie('lang', {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true
});

export const [i18nextMiddleware, getLocale, getInstance] = unstable_createI18nextMiddleware({
  detection: {
    supportedLanguages: config.language.supportedLocales,
    fallbackLanguage: config.language.fallback,
    order: ['searchParams', 'custom', 'cookie', 'header'],
    searchParamKey: 'lang',
    cookie: localeCookie,
    async findLocale(request: Request) {
      const ignoreUrls = new RegExp(`^(${ignoreRoutes.join('|')})`);

      if (ignoreUrls.test(request.url)) {
        return null;
      }

      let locale = new URL(request.url).pathname.split('/').at(1);
      return locale ?? null;
    }
  },
  i18next: {
    preload: config.language.availableTranslations,
    resources: { en: { translation: en }, cy: { translation: cy } }
    // Other i18next options are available here
  },
  plugins: [initReactI18next]
});
