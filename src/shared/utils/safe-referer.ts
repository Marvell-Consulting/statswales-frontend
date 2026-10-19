import { Request } from 'express';

import { config } from '../config';

const toOrigin = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
};

// The Referer header is client-controlled, so redirecting to it as-is is an open redirect. Only go back to it when
// it points at one of our own configured frontend origins, otherwise use the fallback.
export const safeReferer = (req: Request, fallback: string): string => {
  const referer = req.get('Referer');
  if (!referer) return fallback;

  let refererUrl: URL;
  try {
    refererUrl = new URL(referer);
  } catch {
    return fallback;
  }

  const allowedOrigins = [
    config.frontend.publisher.url,
    config.frontend.consumer.url,
    config.frontend.consumer.welshUrl
  ]
    .map(toOrigin)
    .filter(Boolean);

  return allowedOrigins.includes(refererUrl.origin) ? refererUrl.href : fallback;
};
