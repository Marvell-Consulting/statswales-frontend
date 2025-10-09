import { logger } from '../utils/logger';
import { walkObject, UnknownObject } from '../utils/walk-object';

import { optionalProperties } from './app-config.interface';

import { config } from '.';

export const checkConfig = () => {
  logger.debug(`Checking app config for '${config.env}' env...`);

  walkObject(config as unknown as UnknownObject, ({ key, value, location, isLeaf }) => {
    if (isLeaf && !optionalProperties.includes(key) && value === undefined) {
      const configPath = location.join('.');
      throw new Error(`${configPath} is invalid or missing, stopping server`);
    }
  });

  logger.info(`App config loaded for '${config.env}' env`);
};
