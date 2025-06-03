import { Locale } from '~/enums/locale';
import type { Route } from '../+types/root';
import { getLocale, ignoreRoutes } from './i18next.server';
import { redirect } from 'react-router';
import { localeUrl } from '~/utils/locale-url';
import { logger } from '~/utils/logger.server';

export const languageSwitcher: Route.unstable_MiddlewareFunction = ({ request, context }, next) => {
  let locale = getLocale(context);
  const ignoreUrls = new RegExp(`^(${ignoreRoutes.join('|')})`);
  const url = new URL(request.url);
  const query = url.searchParams;

  if (ignoreUrls.test(url.pathname)) {
    return next();
  }

  // lang switching uses lang=xx query param, once triggered we want to remove it while keeping other query params
  query.delete('lang');

  if (
    [Locale.English, Locale.EnglishGb].includes(locale as Locale) &&
    !/^\/en-GB/.test(url.pathname)
  ) {
    const newUrl = localeUrl(url.pathname, Locale.EnglishGb, query);
    logger.debug(
      `Language detected as '${locale}' but not present in path, redirecting to ${newUrl}`
    );
    throw redirect(newUrl);
  }

  if ([Locale.Welsh, Locale.WelshGb].includes(locale as Locale) && !/^\/cy-GB/.test(url.pathname)) {
    const newUrl = localeUrl(url.pathname, Locale.WelshGb, query);
    logger.debug(
      `Language detected as '${locale}' but not present in path, redirecting to ${newUrl}`
    );
    throw redirect(newUrl);
  }
};
