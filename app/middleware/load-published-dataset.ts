import { datasetIdValidator } from '~/validators';
import type { Route } from '../+types/root';
import { consumerApi } from './consumer-api';
import { datasetContext } from './load-dataset';
import { logger } from '~/utils/logger.server';
import { NotFoundException } from '~/exceptions/not-found.exception';

export const fetchPublishedDataset: Route.unstable_MiddlewareFunction = async ({
  context,
  params
}) => {
  const api = context.get(consumerApi);
  const result = datasetIdValidator.safeParse(params);

  if (!result.success) {
    logger.error('Invalid or missing datasetId');
    throw new NotFoundException('errors.dataset_missing');
  }

  try {
    const dataset = await api.getPublishedDataset(result.data.datasetId);
    context.set(datasetContext, {
      dataset,
      datasetId: dataset.id
    });
  } catch (_err) {
    throw new NotFoundException('errors.dataset_missing');
  }
};
