import { Level } from 'pino';

import { AppConfig } from '../app-config.interface';
import { AppEnv } from '../env.enum';
import { SessionStore } from '../session-store.enum';

const ONE_DAY = 24 * 60 * 60 * 1000;

export const getDefaultConfig = (): AppConfig => {
    return {
        env: AppEnv.Default, // MUST be overridden by other configs
        frontend: {
            port: parseInt(process.env.FRONTEND_PORT!, 10),
            url: process.env.FRONTEND_URL!
        },
        backend: {
            port: parseInt(process.env.BACKEND_PORT!, 10),
            url: process.env.BACKEND_URL!
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
            level: (process.env.LOGGER_LEVEL as Level) || 'info'
        },
        rateLimit: {
            windowMs: 60000,
            maxRequests: 100
        },
        auth: {
            jwt: {
                secret: process.env.JWT_SECRET!
            }
        }
    };
};
