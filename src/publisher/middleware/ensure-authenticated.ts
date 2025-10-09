import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';

import { JWTPayloadWithUser } from '../../shared/interfaces/jwt-payload-with-user';
import { logger } from '../../shared/utils/logger';
import { config } from '../../shared/config';
import { GlobalRole } from '../../shared/enums/global-role';

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`Checking if user is authenticated for route ${req.originalUrl}...`);

  try {
    if (!req.cookies.jwt) {
      logger.warn('JWT cookie not found');
      res.status(401);
      res.redirect(req.buildUrl(`/auth/login`, req.language));
      return;
    }

    // JWT_SECRET must be the same as the backend or the token will fail verification
    const secret = config.auth.jwt.secret;
    const token = req.cookies.jwt;

    // verify the JWT token was signed by us
    const decoded = JWT.verify(token, secret) as JWTPayloadWithUser;

    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      logger.warn('JWT token has expired');
      res.status(401);
      res.redirect(req.buildUrl(`/auth/login`, req.language, { error: 'expired' }));
      return;
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
    logger.error(err, `authentication failed`);
    res.status(401);
    res.redirect(req.buildUrl(`/auth/login`, req.language));
    return;
  }

  return next();
};
