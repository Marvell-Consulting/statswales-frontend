import { unstable_createContext } from 'react-router';
import type { Route } from '../+types/root';
import type { DatasetInclude } from '~/enums/dataset-include';
import { datasetIdValidator } from '~/validators';
import { publisherApi } from './publisher-api.server';
import type { DatasetDTO } from '~/dtos/dataset';
import { logger } from '~/utils/logger.server';
import { NotFoundException } from '~/exceptions/not-found.exception';

type DatasetInfo = {
  datasetId: string;
  dataset: DatasetDTO;
};

export const datasetContext = unstable_createContext<DatasetInfo>();

export const fetchDatasetMiddleware =
  (include?: DatasetInclude): Route.unstable_MiddlewareFunction =>
  async ({ context, params }) => {
    const api = context.get(publisherApi);
    const result = datasetIdValidator.safeParse(params);

    if (!result.success) {
      logger.error('Invalid or missing datasetId');
      throw new NotFoundException('errors.dataset_missing');
    }

    try {
      const dataset = await api.getDataset(result.data.datasetId, include);
      context.set(datasetContext, {
        datasetId: dataset.id,
        dataset
      });
    } catch (err: any) {
      if ([401, 403].includes(err.status)) {
        throw err;
      }
      throw new NotFoundException('errors.dataset_missing');
    }
  };
