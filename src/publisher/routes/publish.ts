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
  createNewUpdate,
  updateDatatable,
  setupNumberDimension,
  deleteDraft,
  provideDatasetGroup,
  moveDatasetGroup,
  taskDecision,
  datasetAction,
  downloadMetadata,
  longBuildHandling,
  ajaxRefreshBuildStatus,
  provideUpdateReason,
  downloadPreview
} from '../controllers/publish';
import { DatasetInclude as Include } from '../../shared/enums/dataset-include';
import { flashMessages, flashErrors } from '../../shared/middleware/flash';
import { noCache } from '../../shared/middleware/no-cache';
import { redirectIfOpenPublishRequest } from '../middleware/redirect-if-open-publish-request';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.use(noCache, flashMessages, flashErrors);

publish.get('/', start);

/* Dataset creation */
publish.get('/group', provideDatasetGroup);
publish.post('/group', upload.none(), provideDatasetGroup);

publish.get('/title', provideTitle);
publish.post('/title', upload.none(), provideTitle);

publish.get('/:datasetId', redirectToOverview);

publish.get('/:datasetId/title', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideTitle);
publish.post('/:datasetId/title', fetchDataset(Include.Meta), upload.none(), provideTitle);

publish.get('/:datasetId/upload', fetchDataset(Include.DraftDataTable), redirectIfOpenPublishRequest, uploadDataTable);
publish.post('/:datasetId/upload', fetchDataset(Include.DraftDataTable), upload.single('csv'), uploadDataTable);

publish.get(
  '/:datasetId/preview',
  fetchDataset(Include.DraftDataTable),
  redirectIfOpenPublishRequest,
  factTablePreview
);
publish.post('/:datasetId/preview', fetchDataset(Include.DraftDataTable), upload.none(), factTablePreview);

publish.get('/:datasetId/sources', fetchDataset(Include.DraftDataTable), redirectIfOpenPublishRequest, sources);
publish.post('/:datasetId/sources', fetchDataset(Include.DraftDataTable), upload.none(), sources);

/* Tasklist */
publish.get('/:datasetId/tasklist', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, taskList);
publish.post('/:datasetId/tasklist', fetchDataset(Include.Meta), upload.none(), taskList);

publish.get('/:datasetId/delete', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, deleteDraft);
publish.post('/:datasetId/delete', fetchDataset(Include.Meta), upload.none(), deleteDraft);

/* Cube Preview */
publish.post('/:datasetId/cube-preview', fetchDataset(), upload.none(), cubePreview);
publish.get('/:datasetId/cube-preview{/:filterId}', fetchDataset(), cubePreview);
publish.get('/:datasetId/download/metadata', fetchDataset(), downloadMetadata);
publish.post('/:datasetId/download', fetchDataset(), downloadPreview);
publish.get('/:datasetId/download{/:filterId}', fetchDataset(), downloadPreview);

publish.get('/:datasetId/build/:buildId', fetchDataset(), longBuildHandling);
publish.get('/:datasetId/build/:buildId/refresh', fetchDataset(), ajaxRefreshBuildStatus);

/* Measure creation */
publish.get('/:datasetId/measure', fetchDataset(), redirectIfOpenPublishRequest, measurePreview);
publish.post('/:datasetId/measure', fetchDataset(), upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/review', fetchDataset(Include.Measure), redirectIfOpenPublishRequest, measureReview);
publish.post('/:datasetId/measure/review', fetchDataset(Include.Measure), upload.none(), measureReview);
publish.get(
  '/:datasetId/measure/change-lookup',
  fetchDataset(Include.Measure),
  redirectIfOpenPublishRequest,
  measurePreview
);
publish.post('/:datasetId/measure/change-lookup', fetchDataset(Include.Measure), upload.single('csv'), measurePreview);

/* Dimension creation */
publish.get(
  '/:datasetId/dimension/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  fetchDimensionPreview
);
publish.post(
  '/:datasetId/dimension/:dimensionId',
  fetchDataset(Include.Dimensions),
  upload.none(),
  fetchDimensionPreview
);
publish.get(
  '/:datasetId/dimension/:dimensionId/change-type',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  fetchDimensionPreview
);
publish.post(
  '/:datasetId/dimension/:dimensionId/change-type',
  fetchDataset(Include.Dimensions),
  upload.none(),
  fetchDimensionPreview
);

publish.get(
  '/:datasetId/numbers/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  setupNumberDimension
);
publish.post('/:datasetId/numbers/:dimensionId', fetchDataset(Include.Dimensions), upload.none(), setupNumberDimension);

/* lookup table handlers */
publish.get(
  '/:datasetId/lookup/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadLookupTable
);
publish.post(
  '/:datasetId/lookup/:dimensionId',
  fetchDataset(Include.Dimensions),
  upload.single('csv'),
  uploadLookupTable
);
publish.get(
  '/:datasetId/lookup/:dimensionId/review',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  lookupReview
);
publish.post('/:datasetId/lookup/:dimensionId/review', fetchDataset(Include.Dimensions), upload.none(), lookupReview);

publish.get(
  '/:datasetId/dates/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  fetchTimeDimensionPreview
);
publish.post(
  '/:datasetId/dates/:dimensionId',
  fetchDataset(Include.Dimensions),
  upload.none(),
  fetchTimeDimensionPreview
);
publish.get(
  '/:datasetId/dates/:dimensionId/change-format',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  fetchTimeDimensionPreview
);
publish.post(
  '/:datasetId/dates/:dimensionId/change-format',
  fetchDataset(Include.Dimensions),
  upload.none(),
  fetchTimeDimensionPreview
);
publish.get(
  '/:datasetId/dates/:dimensionId/point-in-time',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  pointInTimeChooser
);
publish.post(
  '/:datasetId/dates/:dimensionId/point-in-time',
  fetchDataset(Include.Dimensions),
  upload.none(),
  pointInTimeChooser
);

/* date period flow */
publish.get(
  '/:datasetId/dates/:dimensionId/period',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  yearTypeChooser
);
publish.post('/:datasetId/dates/:dimensionId/period', fetchDataset(Include.Dimensions), upload.none(), yearTypeChooser);
publish.get(
  '/:datasetId/dates/:dimensionId/period/year-format',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  yearFormat
);
publish.post(
  '/:datasetId/dates/:dimensionId/period/year-format',
  fetchDataset(Include.Dimensions),
  upload.none(),
  yearFormat
);
publish.get(
  '/:datasetId/dates/:dimensionId/period/type',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  periodType
);
publish.post('/:datasetId/dates/:dimensionId/period/type', fetchDataset(Include.Dimensions), upload.none(), periodType);
publish.get(
  '/:datasetId/dates/:dimensionId/period/quarters',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  quarterChooser
);
publish.post(
  '/:datasetId/dates/:dimensionId/period/quarters',
  fetchDataset(Include.Dimensions),
  upload.none(),
  quarterChooser
);
publish.get(
  '/:datasetId/dates/:dimensionId/period/months',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  monthChooser
);
publish.post(
  '/:datasetId/dates/:dimensionId/period/months',
  fetchDataset(Include.Dimensions),
  upload.none(),
  monthChooser
);
publish.get(
  '/:datasetId/dates/:dimensionId/review',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  periodReview
);
publish.post('/:datasetId/dates/:dimensionId/review', fetchDataset(Include.Dimensions), upload.none(), periodReview);

/* Applies to all dimensions */
publish.get(
  '/:datasetId/dimension/:dimensionId/name',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  upload.none(),
  dimensionName
);
publish.post('/:datasetId/dimension/:dimensionId/name', fetchDataset(Include.Dimensions), upload.none(), dimensionName);
publish.get(
  '/:datasetId/dimension/:dimensionId/change-name',
  fetchDataset(Include.Dimensions),
  upload.none(),
  redirectIfOpenPublishRequest,
  dimensionName
);
publish.post(
  '/:datasetId/dimension/:dimensionId/change-name',
  fetchDataset(Include.Dimensions),
  upload.none(),
  dimensionName
);

/* Metadata */
publish.get('/:datasetId/summary', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideSummary);
publish.post('/:datasetId/summary', fetchDataset(Include.Meta), upload.none(), provideSummary);

publish.get('/:datasetId/collection', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideCollection);
publish.post('/:datasetId/collection', fetchDataset(Include.Meta), upload.none(), provideCollection);

publish.get('/:datasetId/quality', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideQuality);
publish.post('/:datasetId/quality', fetchDataset(Include.Meta), upload.none(), provideQuality);

publish.get('/:datasetId/providers', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideDataProviders);
publish.post('/:datasetId/providers', fetchDataset(Include.Meta), upload.none(), provideDataProviders);

publish.get('/:datasetId/related', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideRelatedLinks);
publish.post('/:datasetId/related', fetchDataset(Include.Meta), upload.none(), provideRelatedLinks);

publish.get(
  '/:datasetId/update-frequency',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  provideUpdateFrequency
);
publish.post('/:datasetId/update-frequency', fetchDataset(Include.Meta), upload.none(), provideUpdateFrequency);

publish.get('/:datasetId/designation', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideDesignation);
publish.post('/:datasetId/designation', fetchDataset(Include.Meta), upload.none(), provideDesignation);

publish.get('/:datasetId/topics', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideTopics);
publish.post('/:datasetId/topics', fetchDataset(Include.Meta), upload.none(), provideTopics);

publish.get('/:datasetId/reason', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideUpdateReason);
publish.post('/:datasetId/reason', fetchDataset(Include.Meta), upload.none(), provideUpdateReason);

/* Publishing */
publish.get('/:datasetId/schedule', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, providePublishDate);
publish.post('/:datasetId/schedule', fetchDataset(Include.Meta), upload.none(), providePublishDate);

/* Translations */
publish.get('/:datasetId/translation/export', fetchDataset(), redirectIfOpenPublishRequest, exportTranslations);
publish.get('/:datasetId/translation/import', fetchDataset(), redirectIfOpenPublishRequest, importTranslations);
publish.post('/:datasetId/translation/import', fetchDataset(), upload.single('csv'), importTranslations);

/* Dataset Overview */
publish.get('/:datasetId/overview', fetchDataset(), overview);
publish.post('/:datasetId/overview', fetchDataset(), upload.none(), overview);

/* Start new dataset revision */
publish.get('/:datasetId/update', fetchDataset(), redirectIfOpenPublishRequest, createNewUpdate);
publish.get('/:datasetId/update-type', fetchDataset(), updateDatatable);
publish.post('/:datasetId/update-type', fetchDataset(), upload.none(), updateDatatable);

/* Move a dataset between groups */
publish.get('/:datasetId/move', fetchDataset(), moveDatasetGroup);
publish.post('/:datasetId/move', fetchDataset(), upload.none(), moveDatasetGroup);

publish.get('/:datasetId/task-decision/:taskId', fetchDataset(), taskDecision);
publish.post('/:datasetId/task-decision/:taskId', fetchDataset(), upload.none(), taskDecision);

publish.get('/:datasetId/:action', fetchDataset(), datasetAction);
publish.post('/:datasetId/:action', fetchDataset(), upload.none(), datasetAction);
