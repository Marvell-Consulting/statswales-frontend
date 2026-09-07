import { randomBytes } from 'node:crypto';

import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';

import { config } from '../config';
import { CSRF_FIELD_NAME } from './csrf';

const CSRF_COOKIE_NAME = '_csrf';
const CSRF_VISITOR_COOKIE_NAME = '_csrf_id';

// Anonymous/public forms (cookie banner, cookie settings, feedback) have no session to bind a
// CSRF token to, and the cookie banner renders on every page for every visitor - including
// anonymous ones - so generating a session-bound token here (as SW-1321 does for authenticated
// publisher routes) would force a session-store write on every anonymous page view. csrf-csrf's
// signed double-submit-cookie pattern avoids that: the token is an HMAC over a random per-browser
// id (kept in its own plain cookie, set once) and a random value, all verifiable without ever
// touching the session store. Reuses the session secret since it's already the app's server-only
// HMAC/signing key.
const getSessionIdentifier = (req: Request): string => req.cookies[CSRF_VISITOR_COOKIE_NAME];

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => config.session.secret,
  getSessionIdentifier,
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.session.secure,
    path: '/'
  },
  getCsrfTokenFromRequest: (req: Request) => req.body?.[CSRF_FIELD_NAME]
});

// ensures every visitor has a stable per-browser id before a token is generated or checked, so
// getSessionIdentifier always has something to bind the HMAC to. Mutating req.cookies directly
// makes the value visible to the rest of this same request, since res.cookie only affects the
// outgoing response.
const ensureVisitorId = (req: Request, res: Response) => {
  let visitorId = req.cookies[CSRF_VISITOR_COOKIE_NAME];

  if (typeof visitorId !== 'string') {
    visitorId = randomBytes(16).toString('hex');
    req.cookies[CSRF_VISITOR_COOKIE_NAME] = visitorId;
    res.cookie(CSRF_VISITOR_COOKIE_NAME, visitorId, {
      maxAge: config.session.maxAge,
      httpOnly: true,
      sameSite: 'lax',
      secure: config.session.secure
    });
  }
};

export const publicCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // skip unauthenticated monitor/load-balancer pings - no form on this route needs the token,
  // and there's no reason to make every healthcheck response set a fresh cookie
  if (req.path.startsWith('/healthcheck')) {
    next();
    return;
  }

  ensureVisitorId(req, res);
  res.locals.publicCsrfToken = generateCsrfToken(req, res);
  next();
};

export const verifyPublicCsrfToken = doubleCsrfProtection;
