import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';

import { JWTPayloadWithUser } from '../interfaces/jwt-payload-with-user';
import { logger } from '../utils/logger';
import { appConfig } from '../config';
import { GlobalRole } from '../enums/global-role';

const config = appConfig();

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`Checking if user is authenticated for route ${req.originalUrl}...`);

  try {
    if (!req.cookies.jwt) {
      throw new Error('JWT cookie not found');
    }

    // JWT_SECRET must be the same as the backend or the token will fail verification
    const secret = config.auth.jwt.secret;
    const token = req.cookies.jwt;

    // verify the JWT token was signed by us
    const decoded = JWT.verify(token, secret) as JWTPayloadWithUser;

    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      logger.error('JWT token has expired');
      res.status(401);
      return res.redirect(req.buildUrl(`/auth/login`, req.language, { error: 'expired' }));
    }

    // store the token string in the request as we need it for Authorization header in API requests
    req.jwt = token;

    if (decoded.user) {
      req.user = decoded.user;
      res.locals.isAdmin = req.user.global_roles.includes(GlobalRole.ServiceAdmin);
      res.locals.isDeveloper = req.user.global_roles.includes(GlobalRole.Developer);
    }

    res.locals.isAuthenticated = true;
    logger.info('user is authenticated');
  } catch (err) {
    logger.error(`authentication failed: ${err}`);
    res.status(401);
    return res.redirect(req.buildUrl(`/auth/login`, req.language));
  }

  return next();
};
