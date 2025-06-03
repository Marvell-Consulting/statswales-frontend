import { PublisherApi } from '~/services/publisher-api.server';
import type { Route } from '../+types/root';
import { getLocale } from './i18next.server';
import type { Locale } from '~/enums/locale';
import { getJwtCookie } from '~/services/cookies.server';
import { unstable_createContext } from 'react-router';

export const publisherApi = unstable_createContext<PublisherApi>(new PublisherApi());

export const publisherApiMiddleware: Route.unstable_MiddlewareFunction = async ({
  context,
  request
}) => {
  const locale = getLocale(context);
  const cookie = getJwtCookie(request);
  if (cookie) {
    const api = new PublisherApi(locale as Locale, cookie);
    context.set(publisherApi, api);
  }
};
