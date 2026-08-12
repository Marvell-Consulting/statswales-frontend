import { logger } from '../utils/logger';
import { walkObject, UnknownObject } from '../utils/walk-object';

import { AppConfig, optionalProperties } from './app-config.interface';
import { AppEnv } from './env.enum';

import { config as appConfig } from '.';

// envs where boot-time config is expected to use hardcoded/placeholder secrets
const NON_HARDENED_ENVS: AppEnv[] = [AppEnv.Local, AppEnv.Ci];

const SECRET_LEAF_PATHS = ['auth.jwt.secret', 'session.secret'];
const MIN_SECRET_LENGTH = 32;
const KNOWN_WEAK_SECRETS = ['jwtsecret', 'mysecret'];

const isBlank = (value: unknown) => value === undefined || (typeof value === 'string' && value.trim() === '');

export const checkConfig = (config: AppConfig = appConfig) => {
  logger.debug(`Checking app config for '${config.env}' env...`);

  const enforceSecretStrength = !NON_HARDENED_ENVS.includes(config.env);

  walkObject(config as unknown as UnknownObject, ({ key, value, location, isLeaf }) => {
    if (!isLeaf || optionalProperties.includes(key)) {
      return;
    }

    const configPath = location.join('.');

    if (isBlank(value)) {
      throw new Error(`${configPath} is invalid or missing, stopping server`);
    }

    if (enforceSecretStrength && SECRET_LEAF_PATHS.includes(configPath)) {
      const secret = value as string;

      if (KNOWN_WEAK_SECRETS.includes(secret.toLowerCase())) {
        throw new Error(`${configPath} is a known weak/default value, stopping server`);
      }

      if (secret.length < MIN_SECRET_LENGTH) {
        throw new Error(`${configPath} is too short (minimum ${MIN_SECRET_LENGTH} characters), stopping server`);
      }
    }
  });

  logger.info(`App config loaded for '${config.env}' env`);
};
