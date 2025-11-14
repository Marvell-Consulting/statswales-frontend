import { Router, Request, Response, urlencoded } from 'express';
import JWT from 'jsonwebtoken';

import { logger } from '../../shared/utils/logger';
import { JWTPayloadWithUser } from '../../shared/interfaces/jwt-payload-with-user';
import { config } from '../../shared/config';
import { ViewError } from '../../shared/dtos/view-error';

export const auth = Router();

const cookieDomain = new URL(config.auth.jwt.cookieDomain).hostname;
logger.debug(`JWT cookie domain is '${cookieDomain}'`);

auth.get('/login', async (req: Request, res: Response) => {
  let providers;

  try {
    providers = await req.pubapi.getEnabledAuthProviders();
  } catch (err) {
    logger.warn(err, 'Could not fetch auth providers from backend');
    providers = config.auth.providers;
  }

  if (req.query.error && req.query.error === 'expired') {
    logger.warn(`Authentication token has expired`);
    res.status(400);
    res.render('auth/login', { providers, errors: ['login.error.expired'] });
    return;
  }
  res.render('auth/login', { providers });
});

// Should only be used for localstack or testing
auth.all('/local', urlencoded({ extended: false }), (req: Request, res: Response) => {
  let errors: ViewError[] | undefined;

  if (req.method === 'POST') {
    const username = ((req.body?.username as string) || '').trim();

    if (!username) {
      errors = [{ field: 'username', message: { key: 'login.form.username.error' } }];
      res.render('auth/local', { errors });
      return;
    }

    logger.debug('Sending user to backend for form login');
    res.redirect(`${config.backend.url}/auth/local?username=${username}`);
    return;
  }

  res.render('auth/local');
});

auth.get('/entraid', (req: Request, res: Response) => {
  logger.debug('Sending user to backend for entraid authentication');
  res.redirect(`${config.backend.url}/auth/entraid?lang=${req.language}`);
});

auth.get('/callback', async (req: Request, res: Response) => {
  logger.debug('returning from auth backend');
  let providers;

  try {
    providers = await req.pubapi.getEnabledAuthProviders();
  } catch (err) {
    logger.warn(err, 'Could not fetch auth providers from backend');
    providers = config.auth.providers;
  }

  try {
    if (req.query.error) {
      throw new Error(`auth backend returned an error: ${req.query.error}`);
    }

    // the backend stores the JWT token in a cookie before retuning the user to the frontend
    if (!req.cookies.jwt) {
      throw new Error('JWT cookie not found');
    }

    const secret = config.auth.jwt.secret;
    const decoded = JWT.verify(req.cookies.jwt, secret) as JWTPayloadWithUser;
    req.user = decoded.user;
  } catch (err) {
    logger.warn(err, `problem authenticating user`);
    res.status(400);
    res.render('auth/login', { providers, errors: ['login.error.generic'] });
    return;
  }

  logger.debug('User successfully logged in');
  res.redirect(req.buildUrl('/', req.language));
});

auth.get('/logout', (req: Request, res: Response) => {
  logger.debug('logging out user');
  res.clearCookie('jwt', { domain: cookieDomain });
  res.redirect(req.buildUrl(`/auth/login`, req.language));
});
