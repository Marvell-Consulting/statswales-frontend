import { RequestHandler } from 'express';

// express.static() calls next() instead of 404ing if a file does not exist, so we need to handle this case
export const handleAsset404: RequestHandler = (req, res, next) => {
  if (/^\/(public|css|assets)/.test(req.originalUrl)) {
    res.status(404).send('Not found');
    return;
  }
  if (/com.chrome.devtools.json$/.test(req.originalUrl)) {
    res.status(404).send('Not found');
    return;
  }
  next();
};
