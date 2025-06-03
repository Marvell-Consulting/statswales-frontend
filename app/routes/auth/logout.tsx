import { getLocale } from '~/middleware/i18next.server';
import type { Route } from './+types/logout';
import { deleteCookie, jwtCookie } from '~/services/cookies.server';
import { redirect } from 'react-router';
import { logger } from '~/utils/logger.server';
import { localeUrl } from '~/utils/locale-url';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  logger.debug('logging out user');
  await deleteCookie(jwtCookie);
  throw redirect(localeUrl(`/auth/login`, locale), {
    headers: {
      'Set-Cookie': await deleteCookie(jwtCookie)
    }
  });
};
