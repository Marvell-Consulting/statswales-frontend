import { redirect } from 'react-router';
import { appConfig } from '~/config';
import type { Route } from './+types/entraid';
import { getLocale } from '~/middleware/i18next.server';
import { logger } from '~/utils/logger.server';

export const loader = ({ context }: Route.LoaderArgs) => {
  const config = appConfig();
  const locale = getLocale(context);
  logger.debug('Sending user to backend for entraid authentication');
  throw redirect(`${config.backend.url}/auth/entraid?lang=${locale}`);
};
