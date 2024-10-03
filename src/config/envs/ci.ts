import { AppConfig } from '../app-config.interface';
import { defineConfig } from '../define-config';
import { AppEnv } from '../env.enum';
import { SessionStore } from '../session-store.enum';

// anything that is not a secret can go in here, get the rest from env

export function getCIConfig(): AppConfig {
    return defineConfig({
        env: AppEnv.Ci,
        logger: {
            level: 'error'
        },
        frontend: {
            port: 3000,
            url: 'http://example.com:3000'
        },
        backend: {
            port: 3001,
            url: 'http://example.com:3001'
        },
        rateLimit: {
            windowMs: 60000,
            maxRequests: 1000000
        },
        session: {
            store: SessionStore.Memory,
            secret: 'mysecret',
            secure: false
        },
        auth: {
            jwt: {
                secret: 'mysecret',
                cookieDomain: 'http://localhost'
            }
        }
    });
}
