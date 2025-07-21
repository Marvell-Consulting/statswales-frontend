import { Level } from 'pino';
import { AuthProvider } from '../../shared/enums/auth-providers';
import { AppConfig } from '../app-config.interface';
import { defineConfig } from '../define-config';
import { AppEnv } from '../env.enum';
import { SessionStore } from '../session-store.enum';

// anything that is not a secret can go in here, get the rest from env

export function getCIConfig(): AppConfig {
  return defineConfig({
    env: AppEnv.Ci,
    supportEmail: {
      en: 'support@example.com',
      cy: 'support@example.com'
    },
    logger: {
      level: (process.env.LOG_LEVEL as Level) || 'silent'
    },
    frontend: {
      port: 3000,
      url: 'http://localhost:3000'
    },
    backend: {
      port: 3001,
      url: 'http://localhost:3001'
    },
    rateLimit: {
      windowMs: -1 // disable rate limiting in CI
    },
    session: {
      store: SessionStore.Memory,
      secret: 'mysecret',
      secure: false
    },
    auth: {
      providers: [AuthProvider.Local],
      jwt: {
        secret: process.env.JWT_SECRET || 'jwtsecret',
        cookieDomain: 'http://localhost'
      }
    }
  });
}
