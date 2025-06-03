import { redirect } from 'react-router';
import type { Route } from '../+types/root';
import { getLocale } from './i18next.server';
import { authContext } from './auth-middleware';
import { logger } from '~/utils/logger.server';
import { localeUrl } from '~/utils/locale-url';

export const ensureAuthenticated: Route.unstable_MiddlewareFunction = ({ request, context }) => {
  const locale = getLocale(context);
  const auth = context.get(authContext);
  logger.debug(`Checking if user is authenticated for route ${request.url}...`);

  try {
    if (!auth.jwt) {
      throw new Error('JWT cookie not found');
    }
    if (auth.expires && auth.expires <= Date.now() / 1000) {
      throw new Error('JWT token has expired');
    }

    logger.info('user is authenticated');
  } catch (err: any) {
    logger.error(`authentication failed: ${err.message}`);
    throw redirect(localeUrl('/auth/login', locale));
  }
};
