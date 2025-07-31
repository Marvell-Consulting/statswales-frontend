import { Router, Request, Response, NextFunction } from 'express';

import { ensureDeveloper } from '../middleware/ensure-developer';
import { flashMessages } from '../../shared/middleware/flash';
import { noCache } from '../../shared/middleware/no-cache';
import {
  displayDatasetPreview,
  downloadAllDatasetFiles,
  downloadDataTableFromRevision,
  downloadLookupFileFromDimension,
  downloadLookupFileFromMeasure,
  listAllDatasets,
  rebuildCube
} from '../controllers/developer';

export const developer = Router();

developer.use(ensureDeveloper, noCache, flashMessages);

developer.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'developer';
  next();
});

developer.get('/', listAllDatasets);

developer.get('/:datasetId', displayDatasetPreview);
developer.get('/:datasetId/download', downloadAllDatasetFiles);
developer.get('/:datasetId/revision/:revisionId/datatable', downloadDataTableFromRevision);
developer.get('/:datasetId/dimension/:dimensionId/lookup', downloadLookupFileFromDimension);
developer.get('/:datasetId/measure/lookup', downloadLookupFileFromMeasure);
developer.get('/:datasetId/rebuild/', rebuildCube);
