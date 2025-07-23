import { Router } from 'express';

import { NotFoundException } from '../../shared/exceptions/not-found.exception';

export const notFound = Router();

notFound.all('/{*splat}', (req, res, next) => {
  next(new NotFoundException(`Not found: ${req.originalUrl}`));
});
