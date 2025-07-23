import { Router, Request, Response } from 'express';

export const healthcheck = Router();

const getApi = (req: Request): { ping: () => Promise<boolean> } => {
  // healthcheck is included in both publisher and consumer entrypoints
  return req.conapi || req.pubapi;
};

healthcheck.get('/', async (req: Request, res: Response) => {
  let backend = false;

  try {
    backend = await getApi(req).ping();
  } catch (_err) {
    // do nothing
  }

  res.json({ status: 200, lang: req.language, services: { backend } });
});

const stillAlive = async (req: Request, res: Response) => {
  let backend = false;

  try {
    backend = await getApi(req).ping();
    if (backend === false) {
      throw new Error('Backend unreachable');
    }
  } catch (_err) {
    res.status(500);
    res.json({ status: 500, error: 'Backend unreachable' });
    return;
  }

  res.json({ status: 200, lang: req.language, services: { backend } });
};

healthcheck.get('/ready', stillAlive);
healthcheck.get('/live', stillAlive);
