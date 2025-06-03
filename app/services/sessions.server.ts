import { createMemorySessionStorage, type SessionStorage } from 'react-router';
import { createClient } from 'redis';
import { createRedisSessionStorage } from 'remix-redis-session';
import { appConfig } from '~/config';
import { SessionStore } from '~/config/session-store.enum';
import { logger } from '~/utils/logger.server';

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string[];
};

const config = appConfig();

let session: SessionStorage;

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
  redisClient.on('error', (err) =>
    logger.error(`An error occurred with Redis with the following error: ${err}`)
  );
  redisClient.connect();

  session = createRedisSessionStorage({
    cookie: {
      path: '/',
      name: 'statswales.frontend',
      secure: config.session.secure,
      maxAge: config.session.maxAge,
      secrets: [config.session.secret]
    },
    options: {
      redisClient
    }
  });
} else {
  logger.info('In-memory session store initialized');
  session = createMemorySessionStorage<SessionData, SessionFlashData>({
    cookie: {
      path: '/',
      name: 'statswales.frontend',
      secure: config.session.secure,
      maxAge: config.session.maxAge,
      secrets: [config.session.secret]
    }
  });
}

const { getSession, commitSession, destroySession } = session;

export { getSession, commitSession, destroySession };
