import { Request, Response, NextFunction } from 'express';
import { RequestHistory } from '../interfaces/request-history';

const isRelativeUrl = (url: string): boolean => {
  return url.startsWith('/') && !url.includes('://');
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
