import { DatasetInclude as Include } from '../enums/dataset-include';
import { Router, Request, Response, NextFunction } from 'express';

import { fetchDataset } from '../middleware/fetch-dataset';
import { ensureDeveloper } from '../middleware/ensure-developer';
import { flashMessages } from '../middleware/flash';
import {
  displayDatasetPreview,
  downloadAllDatasetFiles,
  downloadDataTableFromRevision,
  downloadLookupFileFromDimension,
  downloadLookupFileFromMeasure,
  listAllDatasets
} from '../controllers/developer';

export const developer = Router();

developer.use(ensureDeveloper, flashMessages);

developer.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'developer';
  next();
});

developer.get('/', listAllDatasets);

developer.get('/:datasetId', fetchDataset(Include.All), displayDatasetPreview);
developer.get('/:datasetId/download', fetchDataset(Include.All), downloadAllDatasetFiles);
developer.get('/:datasetId/revision/:revisionId/datatable', fetchDataset(Include.All), downloadDataTableFromRevision);
developer.get('/:datasetId/dimension/:dimensionId/lookup', fetchDataset(Include.All), downloadLookupFileFromDimension);
developer.get('/:datasetId/measure/lookup', fetchDataset(Include.All), downloadLookupFileFromMeasure);
