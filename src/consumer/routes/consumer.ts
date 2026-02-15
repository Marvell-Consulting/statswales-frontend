import express, { Router } from 'express';
import basicAuth from 'express-basic-auth';

import {
  listTopics,
  downloadPublishedDataset,
  search,
  viewPublishedDataset,
  listPublishedDatasets,
  downloadPublishedMetadata,
  viewFilteredDataset,
  viewPublishedLanding
} from '../controllers/consumer';
import { fetchPublishedDataset } from '../middleware/fetch-dataset';
import { config } from '../../shared/config';
import { logger } from '../../shared/utils/logger';

export const consumer = Router();

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

consumer.get('/search', search);

consumer.get('/all', listPublishedDatasets);

consumer.get('/topic/:topicId{/:topicSlug}', listTopics);

consumer.get('/:datasetId', fetchPublishedDataset, viewPublishedLanding);
consumer.post(
  '/:datasetId',
  express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 50000 }),
  fetchPublishedDataset,
  viewPublishedLanding
);
consumer.get('/:datasetId/data', fetchPublishedDataset, viewPublishedDataset);
consumer.get('/:datasetId/pivot', fetchPublishedDataset, viewPublishedDataset);

consumer.post(
  '/:datasetId/filtered',
  express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 50000 }),
  fetchPublishedDataset,
  viewFilteredDataset
);
consumer.get('/:datasetId/filtered{/:filterId}', fetchPublishedDataset, viewFilteredDataset);

consumer.get('/:datasetId/download/metadata', fetchPublishedDataset, downloadPublishedMetadata);

consumer.post(
  '/:datasetId/download',
  express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 50000 }),
  fetchPublishedDataset,
  downloadPublishedDataset
);
consumer.get('/:datasetId/download{/:filterId}', fetchPublishedDataset, downloadPublishedDataset);
