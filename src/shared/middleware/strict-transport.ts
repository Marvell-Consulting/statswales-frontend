import { randomBytes } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';

import { Request, Response, NextFunction, Router } from 'express';
import helmet from 'helmet';

import { config } from '../config';
import { AppEnv } from '../config/env.enum';

const GOOGLE_TAG_MANAGER_ORIGIN = 'https://www.googletagmanager.com';
// gtag.js reports hits to a region-specific subdomain (e.g. region1.google-analytics.com) rather
// than always www.google-analytics.com, so these must be wildcarded - a literal www-only origin
// silently drops every beacon sent from a region-pinned subdomain (SW-1333).
const GOOGLE_ANALYTICS_ORIGINS = ['https://*.google-analytics.com', 'https://*.analytics.google.com'];
const GOOGLE_DOUBLECLICK_ORIGIN = 'https://stats.g.doubleclick.net';
const FIRA_CODE_STYLESHEET = 'https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/fira_code.min.css';

// A fresh nonce per request lets SSR views (see Layout.tsx and friends) allow-list their own
// inline <script> tags without resorting to 'unsafe-inline', which would defeat CSP entirely
// (see SW-1319). Generated unconditionally so views don't need to special-case environments
// where the CSP header itself is skipped (see `strictTransport` below).
export const generateNonce = (req: Request, res: Response, next: NextFunction) => {
  res.locals.cspNonce = randomBytes(16).toString('base64');
  next();
};

const nonceDirectiveValue = (_req: IncomingMessage, res: ServerResponse): string =>
  `'nonce-${(res as unknown as Response).locals.cspNonce}'`;

// Build on Helmet's own strong defaults (object-src 'none', base-uri 'self', form-action 'self',
// frame-ancestors 'self', script-src-attr 'none', default-src 'self', ...) instead of replacing
// them wholesale - the previous policy overwrote those defaults with `defaultSrc: ['*']` and
// `'unsafe-inline'` in script-src, defeating CSP's XSS protection entirely (SW-1319). Only the
// directives that genuinely need widening (for GTM/GA, the Fira Code CDN, and the per-request
// nonce) are overridden here; every other directive is left for Helmet to fill in from its own
// defaults (useDefaults defaults to true), so this policy tracks Helmet's defaults automatically
// rather than drifting from a hand-copied snapshot.
export const buildCspDirectives = () => ({
  styleSrc: ["'self'", "'unsafe-inline'", FIRA_CODE_STYLESHEET],
  scriptSrc: ["'self'", GOOGLE_TAG_MANAGER_ORIGIN, nonceDirectiveValue],
  // gtag.js (loaded from GOOGLE_TAG_MANAGER_ORIGIN above) reports hits to google-analytics.com
  // and doubleclick.net - without these, default-src 'self' silently blocks every GA beacon.
  connectSrc: ["'self'", ...GOOGLE_ANALYTICS_ORIGINS, GOOGLE_DOUBLECLICK_ORIGIN],
  imgSrc: ["'self'", 'data:', ...GOOGLE_ANALYTICS_ORIGINS, GOOGLE_DOUBLECLICK_ORIGIN]
});

export const strictTransport = [AppEnv.Ci, AppEnv.Local].includes(config.env)
  ? Router().use(generateNonce)
  : Router()
      .use(generateNonce)
      .use(
        helmet({
          contentSecurityPolicy: {
            directives: buildCspDirectives()
          },
          hsts: {
            maxAge: 63072000, // 2 years in seconds
            includeSubDomains: true,
            preload: true
          }
        })
      );
