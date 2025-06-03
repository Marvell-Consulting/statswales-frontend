import { getSession } from '~/services/sessions.server';
import type { Route } from '../+types/root';

import { unstable_createContext, type Session } from 'react-router';

export const sessionContext = unstable_createContext<Session>();

export const sessionMiddleware: Route.unstable_MiddlewareFunction = async ({
  context,
  request
}) => {
  let session = await getSession(request.headers.get('Cookie'));
  context.set(sessionContext, session);
};
