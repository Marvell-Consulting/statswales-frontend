import type { Route } from './+types/callback';
import { appConfigContext } from '~/context/appContext.server';
import { publisherApi } from '~/middleware/publisher-api.server';
import { createSearchParams, redirect } from 'react-router';
import { getLocale } from '~/middleware/i18next.server';
import { logger } from '~/utils/logger.server';
import { localeUrl } from '~/utils/locale-url';

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const config = context.get(appConfigContext);
  const api = context.get(publisherApi);
  const locale = getLocale(context);
  logger.debug('returning from auth backend');
  let providers;
  const query = new URL(request.url).searchParams;

  try {
    providers = await api.getEnabledAuthProviders();
  } catch (err) {
    logger.error(err, 'Could not fetch auth providers from backend');
    providers = config.auth.providers;
  }

  try {
    const error = query.get('error');
    if (error) {
      throw new Error(`auth backend returned an error: ${error}`);
    }

    // await login(request, context);
  } catch (err) {
    logger.error(`problem authenticating user ${err}`);

    // return data({ providers, errors: ['login.error.generic'] }, { status: 400 });
    throw redirect(
      localeUrl('/auth/login', locale, createSearchParams({ error: ['login.error.generic'] }))
    );
  }

  logger.debug('User successfully logged in');
  throw redirect(localeUrl('/', locale));
};
