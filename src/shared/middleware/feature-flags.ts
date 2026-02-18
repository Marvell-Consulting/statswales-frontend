import { NextFunction, Request, Response } from 'express';

import { config } from '../config';
import {
  featureFlaggingDisabled,
  FEATURE_FLAG_COOKIE,
  parseFlagCookie,
  mergeFlags,
  extractFlagsFromParams,
  validFlags
} from '../utils/feature-flags';

// Middleware that reads ?feature=... from the query string, merges with the existing
// featureFlags cookie, persists the result back to the cookie, and exposes the full
// list of active flags on res.locals so views and controllers can read them without
// needing to pass the query param on every subsequent request.
export const featureFlags = (req: Request, res: Response, next: NextFunction) => {
  if (featureFlaggingDisabled()) {
    next();
    return;
  }

  const fromQuery = validFlags(extractFlagsFromParams(req.query));
  const fromCookie = validFlags(parseFlagCookie(req.cookies[FEATURE_FLAG_COOKIE]));

  const merged = mergeFlags(fromCookie, fromQuery);

  if (merged.length > 0) {
    // Refresh the cookie on every request so its max-age is renewed
    res.cookie(FEATURE_FLAG_COOKIE, merged.join(','), {
      maxAge: 86400000, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: config.session.secure
    });
  }

  res.locals.featureFlags = merged.join(',');
  next();
};
