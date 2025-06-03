import type { unstable_MiddlewareFunction } from 'react-router';

export const noCache: unstable_MiddlewareFunction = async (_, next) => {
  // TODO: investigate why next returns type unknown
  const res = (await next()) as Response;
  res.headers.set('Cache-Control', 'no-cache, must-revalidate, proxy-revalidate');
  return res;
};
