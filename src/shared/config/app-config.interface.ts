import { Level } from 'pino';

import { Locale } from '../enums/locale';
import { AuthProvider } from '../enums/auth-providers';

import { AppEnv } from './env.enum';
import { SessionStore } from './session-store.enum';

export interface AppConfig {
  env: AppEnv;
  email: {
    support: {
      en: string;
      cy: string;
    };
    notify: {
      apiKey: string;
      templateId: string;
    };
  };
  frontend: {
    publisher: {
      port: number;
      url: string;
    };
    consumer: {
      port: number;
      url: string;
      welshUrl?: string;
    };
  };
  backend: {
    port: number;
    url: string;
  };
  language: {
    availableTranslations: Locale[];
    supportedLocales: Locale[];
    fallback: Locale;
  };
  session: {
    store: SessionStore;
    secret: string;
    secure: boolean;
    maxAge: number;
    redisUrl?: string;
    redisPassword?: string;
  };
  logger: {
    level: Level | 'silent';
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  auth: {
    providers: AuthProvider[];
    jwt: {
      secret: string;
      cookieDomain: string;
    };
    basic?: {
      username?: string;
      password?: string;
    };
  };
}

// list any optional properties here so we can ignore missing values when we check the config on boot
// it would be nice to get them directly from the interface, but interfaces are compile-time only
export const optionalProperties = ['redisUrl', 'redisPassword', 'basic', 'welshUrl'];
