import { DatasetInclude as Include } from '../enums/dataset-include';
import { Router, Request, Response, NextFunction } from 'express';

import { fetchDataset } from '../middleware/fetch-dataset';
import { displayDatasetPreview, downloadDataTableFromRevision, listAllDatasets } from '../controllers/developer';

export const developer = Router();

developer.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'developer';
  next();
});

developer.get('/', listAllDatasets);

developer.get('/:datasetId', fetchDataset(Include.All), displayDatasetPreview);

developer.get('/:datasetId/import/:factTableId', fetchDataset(Include.All), downloadDataTableFromRevision);
