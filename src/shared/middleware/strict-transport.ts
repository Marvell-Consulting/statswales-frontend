import { randomBytes } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';

import { Request, Response, NextFunction, Router } from 'express';
import helmet from 'helmet';

import { config } from '../config';
import { AppEnv } from '../config/env.enum';

const GOOGLE_TAG_MANAGER_ORIGIN = 'https://www.googletagmanager.com';
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
// directives that genuinely need widening (for GTM, the Fira Code CDN, and the per-request
// nonce) are overridden here. Directive values are read out of getDefaultDirectives() by their
// (kebab-case) key rather than spread wholesale, so every directive here can use a lint-friendly
// camelCase property name - helmet accepts either casing and dashifies it before sending the header.
export const buildCspDirectives = () => {
  const defaults = helmet.contentSecurityPolicy.getDefaultDirectives();

  return {
    defaultSrc: defaults['default-src'],
    baseUri: defaults['base-uri'],
    fontSrc: defaults['font-src'],
    formAction: defaults['form-action'],
    frameAncestors: defaults['frame-ancestors'],
    imgSrc: defaults['img-src'],
    objectSrc: defaults['object-src'],
    scriptSrcAttr: defaults['script-src-attr'],
    upgradeInsecureRequests: defaults['upgrade-insecure-requests'],
    styleSrc: ["'self'", 'https:', "'unsafe-inline'", FIRA_CODE_STYLESHEET],
    scriptSrc: ["'self'", GOOGLE_TAG_MANAGER_ORIGIN, nonceDirectiveValue]
  };
};

export const strictTransport = [AppEnv.Ci, AppEnv.Local].includes(config.env)
  ? Router().use(generateNonce)
  : Router()
      .use(generateNonce)
      .use(
        helmet({
          hsts: {
            maxAge: 63072000, // 2 years in seconds
            includeSubDomains: true,
            preload: true
          }
        })
      )
      .use(
        helmet.contentSecurityPolicy({
          useDefaults: false,
          directives: buildCspDirectives()
        })
      );
