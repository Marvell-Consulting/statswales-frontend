import express, { Router } from 'express';
import basicAuth from 'express-basic-auth';

import {
  listTopics,
  downloadPublishedDataset,
  viewPublishedDataset,
  listPublishedDatasets,
  downloadPublishedMetadata,
  viewFilteredDataset
} from '../controllers/consumer';
import { fetchPublishedDataset } from '../middleware/fetch-dataset';
import { config } from '../../shared/config';
import { logger } from '../../shared/utils/logger';

export const consumer = Router();
const jsonParser = express.json();

if (config.auth.basic?.username && config.auth.basic?.password) {
  logger.warn('Consumer view password configured, basic auth enabled for consumer routes');
  consumer.use(
    basicAuth({
      challenge: true,
      realm: 'sw3-consumer',
      users: {
        [config.auth.basic.username]: config.auth.basic.password
      }
    })
  );
}

consumer.get('/', listTopics);

consumer.get('/all', listPublishedDatasets);

consumer.get('/topic/:topicId{/:topicSlug}', listTopics);

consumer.get('/:datasetId', fetchPublishedDataset, viewPublishedDataset);
consumer.post('/:datasetId/filtered', jsonParser, fetchPublishedDataset, viewFilteredDataset);
consumer.get('/:datasetId/filtered{/:filterId}', fetchPublishedDataset, viewFilteredDataset);

consumer.get('/:datasetId/download/metadata', fetchPublishedDataset, downloadPublishedMetadata);
consumer.get('/:datasetId/download', fetchPublishedDataset, downloadPublishedDataset);
