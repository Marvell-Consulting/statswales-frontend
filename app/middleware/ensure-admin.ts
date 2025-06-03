import type { unstable_MiddlewareFunction } from 'react-router';
import { authContext } from './auth-middleware';
import { logger } from '~/utils/logger.server';
import { ForbiddenException } from '~/exceptions/forbidden.exception';

export const ensureAdmin: unstable_MiddlewareFunction = ({ context }) => {
  logger.debug(`checking if user is a service admin...`);
  const { isAdmin } = context.get(authContext);
  if (!isAdmin) {
    throw new ForbiddenException('user is not a service admin');
  }
  logger.info(`user is a service admin`);
};
