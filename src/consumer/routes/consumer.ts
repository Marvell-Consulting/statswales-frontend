import { Router } from 'express';

import {
  listTopics,
  downloadPublishedDataset,
  viewPublishedDataset,
  listPublishedDatasets,
  downloadPublishedMetadata
} from '../controllers/consumer';
import { fetchPublishedDataset } from '../middleware/fetch-dataset';

export const consumer = Router();

consumer.get('/', listTopics);

consumer.get('/all', listPublishedDatasets);

consumer.get('/topic/:topicId{/:topicSlug}', listTopics);

consumer.get('/:datasetId', fetchPublishedDataset, viewPublishedDataset);

consumer.get('/:datasetId/download/metadata', fetchPublishedDataset, downloadPublishedMetadata);
consumer.get('/:datasetId/download', fetchPublishedDataset, downloadPublishedDataset);
