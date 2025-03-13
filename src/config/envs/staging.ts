import { AuthProvider } from '../../enums/auth-providers';
import { AppConfig } from '../app-config.interface';
import { defineConfig } from '../define-config';
import { AppEnv } from '../env.enum';
import { SessionStore } from '../session-store.enum';

// anything that is not a secret can go in here, get the rest from env

export function getStagingConfig(): AppConfig {
  return defineConfig({
    env: AppEnv.Staging,
    session: {
      store: SessionStore.Redis
    },
    auth: {
      providers: [AuthProvider.EntraId, AuthProvider.Google, AuthProvider.Local],
      jwt: {
        cookieDomain: process.env.BACKEND_URL
          ? process.env.BACKEND_URL.replace('statswales-develop-backend.', '')
          : undefined
      }
    }
  });
}
