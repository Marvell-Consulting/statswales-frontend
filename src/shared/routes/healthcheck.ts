import { Router, Request, Response } from 'express';

export const healthcheck = Router();

healthcheck.get('/', async (req: Request, res: Response) => {
  let backend = false;

  try {
    backend = await req.conapi.ping();
  } catch (_err) {
    // do nothing
  }

  res.json({ status: 200, lang: req.language, services: { backend } });
});

const stillAlive = async (req: Request, res: Response) => {
  let backend = false;

  try {
    backend = await req.conapi.ping();
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
