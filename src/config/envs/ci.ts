import { AppConfig } from '../app-config.interface';
import { defineConfig } from '../define-config';
import { AppEnv } from '../env.enum';
import { SessionStore } from '../session-store.enum';

// anything that is not a secret can go in here, get the rest from env

export function getCIConfig(): AppConfig {
    return defineConfig({
        env: AppEnv.Ci,
        frontend: {
            port: parseInt(process.env.FRONTEND_PORT || '3000', 10),
            url: process.env.FRONTEND_URL || 'http://localhost:3000'
        },
        backend: {
            port: parseInt(process.env.BACKEND_PORT || '3001', 10),
            url: process.env.BACKEND_URL || 'http://localhost:3001'
        },
        session: {
            store: SessionStore.Memory,
            secret: process.env.SESSION_SECRET || 'mysecret',
            secure: false
        },
        auth: {
            jwt: {
                secret: process.env.JWT_SECRET || 'jwtsecret'
            }
        }
    });
}
