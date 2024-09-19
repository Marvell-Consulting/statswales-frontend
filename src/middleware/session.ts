import RedisStore from 'connect-redis';
import session, { MemoryStore } from 'express-session';
import { createClient } from 'redis';

import { logger } from '../utils/logger';

let store: RedisStore | MemoryStore;

const cacheHostName = process.env.REDIS_URL || 'redis://localhost';
const cachePassword = process.env.REDIS_ACCESS_KEY || '';

const cacheConnection = createClient({
    url: cacheHostName,
    password: cachePassword
});

async function createRedisConnection() {
    await cacheConnection.connect();
    cacheConnection.on('error', console.error);
    cacheConnection.on('connect', () => {
        console.info('Connected to Redis');
    });
    return 'Connected to Redis';
}

createRedisConnection()
    .then((result) => logger.info(result))
    .catch((ex) => logger.error(ex));

if (process.env.REDIS_URL) {
    store = new RedisStore({
        client: cacheConnection,
        prefix: 'statswales3:'
    });
} else {
    store = new MemoryStore({});
}

export default session({
    name: 'STATSWALES.SESSION.STORE',
    store,
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // please change it based on your needs
        secure: 'auto'
    }
});
