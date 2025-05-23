import { Router } from 'express';

import { homepage, downloadPublishedDataset, viewPublishedDataset } from '../controllers/consumer';
import { fetchPublishedDataset } from '../middleware/fetch-dataset';

export const consumer = Router();

consumer.get('/', homepage);

consumer.get('/:datasetId', fetchPublishedDataset, viewPublishedDataset);

consumer.get('/:datasetId/download', fetchPublishedDataset, downloadPublishedDataset);
