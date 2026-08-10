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

const tokensMatch = (sessionToken: string, submittedToken: string): boolean => {
  if (sessionToken.length !== submittedToken.length) {
    return false;
  }
  const sessionBuffer = Buffer.from(sessionToken);
  const submittedBuffer = Buffer.from(submittedToken);
  return sessionBuffer.length === submittedBuffer.length && timingSafeEqual(sessionBuffer, submittedBuffer);
};

export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.session.csrfToken;
  const submittedToken = req.body?.[CSRF_FIELD_NAME] || req.get(CSRF_HEADER_NAME);

  if (
    typeof sessionToken !== 'string' ||
    typeof submittedToken !== 'string' ||
    !tokensMatch(sessionToken, submittedToken)
  ) {
    next(new ForbiddenException('Invalid or missing CSRF token'));
    return;
  }

  next();
};
