import { randomBytes, timingSafeEqual } from 'node:crypto';

import { Request, Response, NextFunction } from 'express';

import { ForbiddenException } from '../exceptions/forbidden.exception';

export const CSRF_FIELD_NAME = '_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export const csrfToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  res.setHeader(CSRF_HEADER_NAME, req.session.csrfToken);
  next();
};

const timingSafeTokensMatch = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const hasValidCsrfToken = (req: Request): boolean => {
  const sessionToken = req.session.csrfToken;
  const submittedToken = req.body?.[CSRF_FIELD_NAME] || req.get(CSRF_HEADER_NAME);

  return (
    typeof sessionToken === 'string' &&
    typeof submittedToken === 'string' &&
    timingSafeTokensMatch(sessionToken, submittedToken)
  );
};

export const verifyCsrfToken = (req: Request, _res: Response, next: NextFunction) => {
  if (!hasValidCsrfToken(req)) {
    next(new ForbiddenException('Invalid or missing CSRF token'));
    return;
  }

  next();
};
