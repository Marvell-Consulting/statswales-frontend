import { Level } from 'pino';

import { AppEnv } from './env.enum';
import { SessionStore } from './session-store.enum';

export interface AppConfig {
    env: AppEnv;
    frontend: {
        port: number;
        url: string;
    };
    backend: {
        port: number;
        url: string;
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
        level: Level;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    auth: {
        jwt: {
            secret: string;
        };
    };
}

// list any optional properties here so we can ignore missing values when we check the config on boot
// it would be nice to get them directly from the interface, but interfaces are compile-time only
export const optionalProperties = ['redisUrl', 'redisPassword'];
