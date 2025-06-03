import type { Route } from '../+types/root';
import { getLocale } from './i18next.server';
import type { Locale } from '~/enums/locale';
import { unstable_createContext } from 'react-router';
import { ConsumerApi } from '~/services/consumer-api.server';

export const consumerApi = unstable_createContext<ConsumerApi>(new ConsumerApi());

export const publisherApiMiddleware: Route.unstable_MiddlewareFunction = ({ context }) => {
  const locale = getLocale(context);
  const api = new ConsumerApi(locale as Locale);
  context.set(consumerApi, api);
};
