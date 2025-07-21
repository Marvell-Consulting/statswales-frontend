import { Level } from 'pino';

import { AuthProvider } from '../../shared/enums/auth-providers';
import { AppConfig } from '../app-config.interface';
import { defineConfig } from '../define-config';
import { AppEnv } from '../env.enum';
import { SessionStore } from '../session-store.enum';

// anything that is not a secret can go in here, get the rest from env

export function getLocalConfig(): AppConfig {
  return defineConfig({
    env: AppEnv.Local,
    frontend: {
      port: parseInt(process.env.FRONTEND_PORT || '3000', 10),
      url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    backend: {
      port: parseInt(process.env.BACKEND_PORT || '3001', 10),
      url: process.env.BACKEND_URL || 'http://localhost:3001'
    },
    session: {
      store: (process.env.SESSION_STORE! as SessionStore) || SessionStore.Redis,
      secret: process.env.SESSION_SECRET || 'mysecret',
      secure: false,
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6380'
    },
    logger: {
      level: (process.env.LOG_LEVEL as Level) || 'debug'
    },
    rateLimit: {
      windowMs: -1 // disable rate limiting in local
    },
    auth: {
      providers: [AuthProvider.EntraId, AuthProvider.Google, AuthProvider.Local],
      jwt: {
        secret: process.env.JWT_SECRET || 'jwtsecret',
        cookieDomain: 'http://localhost'
      }
    }
  });
}
