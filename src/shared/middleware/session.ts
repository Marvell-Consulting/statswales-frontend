import RedisStore from 'connect-redis';
import session, { MemoryStore, Store } from 'express-session';
import { createClient } from 'redis';

import { logger } from '../utils/logger';
import { config } from '../config';
import { SessionStore } from '../config/session-store.enum';

let store: Store;

if (config.session.store === SessionStore.Redis) {
  logger.debug('Initializing Redis session store...');

  const redisClient = createClient({
    url: config.session.redisUrl,
    password: config.session.redisPassword,
    disableOfflineQueue: true,
    pingInterval: 1000,
    socket: {
      reconnectStrategy: 1000,
      connectTimeout: 7500,
      family: 4
    }
  });

  logger.debug(`Connecting to redis server: ${config.session.redisUrl}`);

  redisClient.on('connect', () => logger.info('Redis session store initialized'));
  redisClient.on('error', (err) => logger.error(`An error occurred with Redis with the following error: ${err}`));
  redisClient.connect();

  store = new RedisStore({ client: redisClient, prefix: 'sw3f:' });
} else {
  logger.info('In-memory session store initialized');
  store = new MemoryStore({});
}

export default session({
  secret: config.session.secret,
  name: 'statswales.frontend',
  store,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    path: '/',
    secure: config.session.secure,
    maxAge: config.session.maxAge
  }
});
