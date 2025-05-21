import { Router } from 'express';
import multer from 'multer';

import { fetchDataset } from '../middleware/fetch-dataset';
import {
  start,
  provideTitle,
  uploadDataTable,
  factTablePreview,
  sources,
  taskList,
  redirectToOverview,
  provideSummary,
  provideCollection,
  provideQuality,
  provideDataProviders,
  provideRelatedLinks,
  provideUpdateFrequency,
  provideDesignation,
  provideTopics,
  providePublishDate,
  fetchDimensionPreview,
  fetchTimeDimensionPreview,
  pointInTimeChooser,
  yearFormat,
  quarterChooser,
  monthChooser,
  yearTypeChooser,
  periodType,
  periodReview,
  dimensionName,
  uploadLookupTable,
  lookupReview,
  exportTranslations,
  importTranslations,
  cubePreview,
  measurePreview,
  measureReview,
  overview,
  downloadDataset,
  createNewUpdate,
  updateDatatable,
  measureName,
  setupNumberDimension,
  deleteDraft,
  provideDatasetGroup,
  moveDatasetGroup,
  taskDecision
} from '../controllers/publish';
import { DatasetInclude as Include } from '../enums/dataset-include';
import { flashMessages } from '../middleware/flash';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.use(flashMessages);

publish.get('/', start);

/* Dataset creation */
publish.get('/group', provideDatasetGroup);
publish.post('/group', upload.none(), provideDatasetGroup);

publish.get('/title', provideTitle);
publish.post('/title', upload.none(), provideTitle);

publish.get('/:datasetId', redirectToOverview);

publish.get('/:datasetId/title', fetchDataset(Include.Meta), provideTitle);
publish.post('/:datasetId/title', fetchDataset(Include.Meta), upload.none(), provideTitle);

publish.get('/:datasetId/upload', fetchDataset(Include.Data), uploadDataTable);
publish.post('/:datasetId/upload', fetchDataset(Include.Data), upload.single('csv'), uploadDataTable);

publish.get('/:datasetId/preview', fetchDataset(Include.Data), factTablePreview);
publish.post('/:datasetId/preview', fetchDataset(Include.Data), upload.none(), factTablePreview);

publish.get('/:datasetId/sources', fetchDataset(Include.Data), sources);
publish.post('/:datasetId/sources', fetchDataset(Include.Data), upload.none(), sources);

/* Tasklist */
publish.get('/:datasetId/tasklist', fetchDataset(Include.Meta), taskList);
publish.post('/:datasetId/tasklist', fetchDataset(Include.Meta), upload.none(), taskList);

publish.get('/:datasetId/delete', fetchDataset(Include.Meta), deleteDraft);
publish.post('/:datasetId/delete', fetchDataset(Include.Meta), deleteDraft);

/* Cube Preview */
publish.get('/:datasetId/cube-preview', fetchDataset(), cubePreview);
publish.get('/:datasetId/download', fetchDataset(), downloadDataset);

/* Measure creation */
publish.get('/:datasetId/measure', fetchDataset(), measurePreview);
publish.post('/:datasetId/measure', fetchDataset(), upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/review', fetchDataset(Include.Measure), measureReview);
publish.post('/:datasetId/measure/review', fetchDataset(Include.Measure), measureReview);
publish.get('/:datasetId/measure/name', fetchDataset(Include.Measure), measureName);
publish.get('/:datasetId/measure/change-lookup', fetchDataset(Include.Measure), measurePreview);
publish.post('/:datasetId/measure/change-lookup', fetchDataset(Include.Measure), upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/change-name', fetchDataset(Include.Measure), measureName);
publish.post('/:datasetId/measure/name', upload.none(), fetchDataset(Include.Measure), measureName);
publish.post('/:datasetId/measure/change-name', upload.none(), fetchDataset(Include.Measure), measureName);

/* Dimension creation */
publish.get('/:datasetId/dimension/:dimensionId', fetchDataset(Include.Dimensions), fetchDimensionPreview);
publish.post('/:datasetId/dimension/:dimensionId', fetchDataset(Include.Dimensions), fetchDimensionPreview);
publish.get('/:datasetId/dimension/:dimensionId/change-type', fetchDataset(Include.Dimensions), fetchDimensionPreview);
publish.post('/:datasetId/dimension/:dimensionId/change-type', fetchDataset(Include.Dimensions), fetchDimensionPreview);

publish.get('/:datasetId/numbers/:dimensionId', fetchDataset(Include.Dimensions), setupNumberDimension);
publish.post('/:datasetId/numbers/:dimensionId', fetchDataset(Include.Dimensions), upload.none(), setupNumberDimension);

/* lookup table handlers */
publish.get('/:datasetId/lookup/:dimensionId', fetchDataset(Include.Dimensions), uploadLookupTable);
publish.post(
  '/:datasetId/lookup/:dimensionId',
  fetchDataset(Include.Dimensions),
  upload.single('csv'),
  uploadLookupTable
);
publish.get('/:datasetId/lookup/:dimensionId/review', fetchDataset(Include.Dimensions), lookupReview);
publish.post('/:datasetId/lookup/:dimensionId/review', fetchDataset(Include.Dimensions), lookupReview);

publish.get('/:datasetId/dates/:dimensionId', fetchDataset(Include.Dimensions), fetchTimeDimensionPreview);
publish.post('/:datasetId/dates/:dimensionId', fetchDataset(Include.Dimensions), fetchTimeDimensionPreview);
publish.get(
  '/:datasetId/dates/:dimensionId/change-format',
  fetchDataset(Include.Dimensions),
  fetchTimeDimensionPreview
);
publish.post(
  '/:datasetId/dates/:dimensionId/change-format',
  fetchDataset(Include.Dimensions),
  fetchTimeDimensionPreview
);
publish.get('/:datasetId/dates/:dimensionId/point-in-time', fetchDataset(Include.Dimensions), pointInTimeChooser);
publish.post('/:datasetId/dates/:dimensionId/point-in-time', fetchDataset(Include.Dimensions), pointInTimeChooser);

/* date period flow */
publish.get('/:datasetId/dates/:dimensionId/period', fetchDataset(Include.Dimensions), yearTypeChooser);
publish.post('/:datasetId/dates/:dimensionId/period', fetchDataset(Include.Dimensions), yearTypeChooser);
publish.get('/:datasetId/dates/:dimensionId/period/year-format', fetchDataset(Include.Dimensions), yearFormat);
publish.post('/:datasetId/dates/:dimensionId/period/year-format', fetchDataset(Include.Dimensions), yearFormat);
publish.get('/:datasetId/dates/:dimensionId/period/type', fetchDataset(Include.Dimensions), periodType);
publish.post('/:datasetId/dates/:dimensionId/period/type', fetchDataset(Include.Dimensions), periodType);
publish.get('/:datasetId/dates/:dimensionId/period/quarters', fetchDataset(Include.Dimensions), quarterChooser);
publish.post('/:datasetId/dates/:dimensionId/period/quarters', fetchDataset(Include.Dimensions), quarterChooser);
publish.get('/:datasetId/dates/:dimensionId/period/months', fetchDataset(Include.Dimensions), monthChooser);
publish.post('/:datasetId/dates/:dimensionId/period/months', fetchDataset(Include.Dimensions), monthChooser);
publish.get('/:datasetId/dates/:dimensionId/review', fetchDataset(Include.Dimensions), periodReview);
publish.post('/:datasetId/dates/:dimensionId/review', fetchDataset(Include.Dimensions), periodReview);

/* Applies to all dimensions */
publish.get('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset(Include.Dimensions), dimensionName);
publish.post('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset(Include.Dimensions), dimensionName);
publish.get(
  '/:datasetId/dimension/:dimensionId/change-name',
  upload.none(),
  fetchDataset(Include.Dimensions),
  dimensionName
);
publish.post(
  '/:datasetId/dimension/:dimensionId/change-name',
  upload.none(),
  fetchDataset(Include.Dimensions),
  dimensionName
);

/* Metadata */
publish.get('/:datasetId/summary', fetchDataset(Include.Meta), provideSummary);
publish.post('/:datasetId/summary', fetchDataset(Include.Meta), upload.none(), provideSummary);

publish.get('/:datasetId/collection', fetchDataset(Include.Meta), provideCollection);
publish.post('/:datasetId/collection', fetchDataset(Include.Meta), upload.none(), provideCollection);

publish.get('/:datasetId/quality', fetchDataset(Include.Meta), provideQuality);
publish.post('/:datasetId/quality', fetchDataset(Include.Meta), upload.none(), provideQuality);

publish.get('/:datasetId/providers', fetchDataset(Include.Meta), provideDataProviders);
publish.post('/:datasetId/providers', fetchDataset(Include.Meta), upload.none(), provideDataProviders);

publish.get('/:datasetId/related', fetchDataset(Include.Meta), provideRelatedLinks);
publish.post('/:datasetId/related', fetchDataset(Include.Meta), upload.none(), provideRelatedLinks);

publish.get('/:datasetId/update-frequency', fetchDataset(Include.Meta), provideUpdateFrequency);
publish.post('/:datasetId/update-frequency', fetchDataset(Include.Meta), upload.none(), provideUpdateFrequency);

publish.get('/:datasetId/designation', fetchDataset(Include.Meta), provideDesignation);
publish.post('/:datasetId/designation', fetchDataset(Include.Meta), upload.none(), provideDesignation);

publish.get('/:datasetId/topics', fetchDataset(Include.Meta), provideTopics);
publish.post('/:datasetId/topics', fetchDataset(Include.Meta), upload.none(), provideTopics);

/* Publishing */
publish.get('/:datasetId/schedule', fetchDataset(Include.Meta), providePublishDate);
publish.post('/:datasetId/schedule', fetchDataset(Include.Meta), upload.none(), providePublishDate);

/* Translations */
publish.get('/:datasetId/translation/export', fetchDataset(), exportTranslations);
publish.get('/:datasetId/translation/import', fetchDataset(), importTranslations);
publish.post('/:datasetId/translation/import', fetchDataset(), upload.single('csv'), importTranslations);

/* Dataset Overview */
publish.get('/:datasetId/overview', fetchDataset(), overview);
publish.post('/:datasetId/overview', fetchDataset(), upload.none(), overview);

/* Start new dataset revision */
publish.get('/:datasetId/update', fetchDataset(), createNewUpdate);
publish.get('/:datasetId/update-type', fetchDataset(), updateDatatable);
publish.post('/:datasetId/update-type', fetchDataset(), updateDatatable);

/* Move a dataset between groups */
publish.get('/:datasetId/move', fetchDataset(), moveDatasetGroup);
publish.post('/:datasetId/move', fetchDataset(), upload.none(), moveDatasetGroup);

publish.get('/:datasetId/task-decision/:taskId', fetchDataset(), taskDecision);
publish.post('/:datasetId/task-decision/:taskId', fetchDataset(), upload.none(), taskDecision);
