import { Request, Response, NextFunction } from 'express';
import { RequestHistory } from '../interfaces/request-history';

const isSafeRelativePath = (url: string): boolean => /^\/(?!\/|\\)/.test(url);

// rejects protocol-relative ("//evil.com") and backslash-obfuscated ("/\evil.com") forms, both of which
// browsers will treat as absolute URLs pointing off-site even though they pass a naive "starts with /" check.
// Also checks the percent-decoded form, since some proxies/user agents normalise "/%2F%2Fevil.com" or
// "/%5Cevil.com" into the same dangerous forms before they'd be resolved as a redirect target.
export const isRelativeUrl = (url: string): boolean => {
  if (!isSafeRelativePath(url)) {
    return false;
  }

  try {
    return isSafeRelativePath(decodeURIComponent(url));
  } catch {
    return false;
  }
};

// records the last 10 URLs visited by the user
export const history = (req: Request, res: Response, next: NextFunction) => {
  const history: RequestHistory[] = req.session?.history || [];
  const currentUrl = req.originalUrl;

  if (currentUrl !== history[0]?.url && isRelativeUrl(currentUrl)) {
    // Add the current URL to the beginning of the history array
    history.unshift({
      url: currentUrl,
      timestamp: new Date().toISOString(),
      method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    });
  }

  // Limit the history to the last 10 URLs
  req.session.history = history.slice(0, 10);
  res.locals.history = req.session.history;
  next();
};
