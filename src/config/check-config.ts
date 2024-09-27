import { logger } from '../utils/logger';
import { walkObject, UnknownObject } from '../utils/walk-object';

import { optionalProperties } from './app-config.interface';

import { appConfig } from '.';

export const checkConfig = () => {
    const config = appConfig() as unknown as UnknownObject;

    logger.info('Checking app config...');

    walkObject(config, ({ key, value, location, isLeaf }) => {
        if (isLeaf && !optionalProperties.includes(key) && value === undefined) {
            logger.error(`config.${location.join('.')} is undefined`);
            throw new Error('invalid or missing config detected, stopping server');
        }
    });
};
