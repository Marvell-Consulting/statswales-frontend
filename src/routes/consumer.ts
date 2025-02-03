import { Router } from 'express';

import { downloadPublishedDataset, listPublishedDatasets, viewPublishedDataset } from '../controllers/consumer';
import { fetchPublishedDataset } from '../middleware/fetch-dataset';

export const consumer = Router();

consumer.get('/', listPublishedDatasets);

consumer.get('/:datasetId', fetchPublishedDataset, viewPublishedDataset);

consumer.get('/:datasetId/download', fetchPublishedDataset, downloadPublishedDataset);
