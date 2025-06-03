import { parse } from 'cookie';
import { createCookie, type Cookie } from 'react-router';
import { appConfig } from '~/config';

const config = appConfig();
const domain = new URL(config.auth.jwt.cookieDomain).hostname;

export const jwtCookie = createCookie('jwt', {
  secure: false,
  httpOnly: true,
  domain
});

export const getCookie = async (request: Request, cookie: Cookie) => {
  return cookie.parse(request.headers.get('Cookie'));
};

export const deleteCookie = async (cookie: Cookie) => {
  return cookie.serialize(null, { maxAge: 1 });
};

export const getJwtCookie = (request: Request) => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return null;
  }
  return parse(cookieHeader).jwt;
};
