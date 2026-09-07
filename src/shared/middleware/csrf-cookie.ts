import { randomBytes } from 'node:crypto';

import { Request, Response, NextFunction } from 'express';

import { config } from '../config';
import { ForbiddenException } from '../exceptions/forbidden.exception';
import { CSRF_FIELD_NAME, timingSafeTokensMatch } from './csrf';

export const PUBLIC_CSRF_COOKIE_NAME = '_csrf';

// Double-submit cookie CSRF check for anonymous/public forms (cookie banner, cookie settings,
// feedback). The cookie banner renders on every page of both apps, including for anonymous
// visitors, so unlike the session-bound token used for authenticated publisher routes, this
// never touches the session store - it's just a cookie, generated once per browser. The server
// echoes the cookie's value into the hidden form field at render time, so no client-side JS is
// needed to keep the two in sync: the browser resends the cookie automatically on any cross-site
// POST, but an attacker page has no way to read its value to forge a matching form field.
export const publicCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies[PUBLIC_CSRF_COOKIE_NAME];

  if (typeof token !== 'string') {
    token = randomBytes(32).toString('hex');
    res.cookie(PUBLIC_CSRF_COOKIE_NAME, token, {
      maxAge: config.session.maxAge,
      httpOnly: true,
      sameSite: 'lax',
      secure: config.session.secure
    });
  }

  res.locals.publicCsrfToken = token;
  next();
};

export const verifyPublicCsrfToken = (req: Request, _res: Response, next: NextFunction) => {
  const cookieToken = req.cookies[PUBLIC_CSRF_COOKIE_NAME];
  const submittedToken = req.body?.[CSRF_FIELD_NAME];

  const valid =
    typeof cookieToken === 'string' &&
    typeof submittedToken === 'string' &&
    timingSafeTokensMatch(cookieToken, submittedToken);

  if (!valid) {
    next(new ForbiddenException('Invalid or missing CSRF token'));
    return;
  }

  next();
};
