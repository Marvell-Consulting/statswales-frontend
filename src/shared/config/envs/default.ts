import { Level } from 'pino';

import { AppConfig } from '../app-config.interface';
import { AppEnv } from '../env.enum';
import { SessionStore } from '../session-store.enum';
import { Locale } from '../../enums/locale';

const ONE_DAY = 24 * 60 * 60 * 1000;

export const getDefaultConfig = (): AppConfig => {
  return {
    env: AppEnv.Default, // MUST be overridden by other configs
    email: {
      support: {
        en: 'StatsWales@gov.wales',
        cy: 'StatsCymru@llyw.cymru'
      },
      notify: {
        apiKey: process.env.GOVUK_NOTIFY_APIKEY!,
        templateId: process.env.GOVUK_NOTIFY_TEMPLATE_ID!
      }
    },
    frontend: {
      publisher: {
        port: parseInt(process.env.PUBLISHER_PORT || '3000', 10),
        url: process.env.PUBLISHER_URL!
      },
      consumer: {
        port: parseInt(process.env.CONSUMER_PORT || '3000', 10),
        url: process.env.CONSUMER_URL!,
        welshUrl: process.env.CONSUMER_WELSH_URL
      }
    },
    backend: {
      port: parseInt(process.env.BACKEND_PORT || '3000', 10),
      url: process.env.BACKEND_URL!
    },
    language: {
      availableTranslations: [Locale.English, Locale.Welsh],
      supportedLocales: [Locale.English, Locale.EnglishGb, Locale.Welsh, Locale.WelshGb],
      fallback: Locale.English
    },
    session: {
      store: process.env.SESSION_STORE! as SessionStore,
      secret: process.env.SESSION_SECRET!,
      secure: true,
      maxAge: parseInt(process.env.SESSION_MAX_AGE || ONE_DAY.toString(), 10),
      redisUrl: process.env.REDIS_URL,
      redisPassword: process.env.REDIS_ACCESS_KEY
    },
    logger: {
      level: (process.env.LOG_LEVEL as Level) || 'info'
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100
    },
    auth: {
      providers: [],
      jwt: {
        secret: process.env.JWT_SECRET!,
        cookieDomain: process.env.JWT_COOKIE_DOMAIN!
      },
      ...(process.env.CONSUMER_VIEW_PASSWORD && {
        basic: {
          username: process.env.CONSUMER_VIEW_USERNAME,
          password: process.env.CONSUMER_VIEW_PASSWORD
        }
      })
    }
  };
};
