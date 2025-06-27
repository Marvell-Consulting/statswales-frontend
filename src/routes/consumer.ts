import { Router } from 'express';

import { listTopics, downloadPublishedDataset, viewPublishedDataset } from '../controllers/consumer';
import { fetchPublishedDataset } from '../middleware/fetch-dataset';
import { clearParams } from '../middleware/clearParams';

export const consumer = Router();

consumer.get('/', listTopics);

consumer.get('/topic/:topicId{/:topicSlug}', listTopics);

consumer.get('/:datasetId', clearParams, fetchPublishedDataset, viewPublishedDataset);

consumer.get('/:datasetId/download', fetchPublishedDataset, downloadPublishedDataset);
