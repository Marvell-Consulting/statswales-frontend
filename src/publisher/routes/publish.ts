import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
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
  downloadPreview,
  uploadValidationErrors
} from '../controllers/publish';
import { DatasetInclude as Include } from '../../shared/enums/dataset-include';
import { flashMessages, flashErrors } from '../../shared/middleware/flash';
import { noCache } from '../../shared/middleware/no-cache';
import { verifyCsrfToken } from '../../shared/middleware/csrf';
import { isRelativeUrl } from '../../shared/middleware/history';
import { redirectIfOpenPublishRequest } from '../middleware/redirect-if-open-publish-request';

export const publish = Router();

export const MULTIPART_FIELD_SIZE_LIMIT = 10 * 1024 * 1024;

const upload = multer({ storage: multer.memoryStorage(), limits: { fieldSize: MULTIPART_FIELD_SIZE_LIMIT } });

const uploadNone = [upload.none(), verifyCsrfToken];
const uploadSingle = (field: string) => [upload.single(field), verifyCsrfToken];

const uploadNoneOrFieldError =
  (field: string, errorKey: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    upload.none()(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FIELD_VALUE') {
        req.session.errors = [{ field, message: { key: errorKey } }];
        const redirectTarget = isRelativeUrl(req.originalUrl) ? req.originalUrl : '/';
        req.session.save((saveErr) => {
          if (saveErr) {
            next(saveErr);
            return;
          }
          res.redirect(redirectTarget);
        });
        return;
      }
      next(err);
    });
  };

publish.use(noCache, flashMessages, flashErrors);

publish.get('/', start);

/* Dataset creation */
publish.get('/group', provideDatasetGroup);
publish.post('/group', uploadNone, provideDatasetGroup);

publish.get('/title', provideTitle);
publish.post('/title', uploadNone, provideTitle);

publish.get('/:datasetId', redirectToOverview);

publish.get('/:datasetId/title', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideTitle);
publish.post('/:datasetId/title', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, uploadNone, provideTitle);

publish.get('/:datasetId/upload', fetchDataset(Include.DraftDataTable), redirectIfOpenPublishRequest, uploadDataTable);
publish.post(
  '/:datasetId/upload',
  fetchDataset(Include.DraftDataTable),
  redirectIfOpenPublishRequest,
  uploadSingle('csv'),
  uploadDataTable
);
publish.get(
  '/:datasetId/upload/validation-errors',
  fetchDataset(Include.DraftDataTable),
  redirectIfOpenPublishRequest,
  uploadValidationErrors
);

publish.get(
  '/:datasetId/preview',
  fetchDataset(Include.DraftDataTable),
  redirectIfOpenPublishRequest,
  factTablePreview
);
publish.post(
  '/:datasetId/preview',
  fetchDataset(Include.DraftDataTable),
  redirectIfOpenPublishRequest,
  uploadNone,
  factTablePreview
);

publish.get('/:datasetId/sources', fetchDataset(Include.DraftDataTable), redirectIfOpenPublishRequest, sources);
publish.post(
  '/:datasetId/sources',
  fetchDataset(Include.DraftDataTable),
  redirectIfOpenPublishRequest,
  uploadNone,
  sources
);

/* Tasklist */
publish.get('/:datasetId/tasklist', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, taskList);
publish.post('/:datasetId/tasklist', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, uploadNone, taskList);

publish.get('/:datasetId/delete', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, deleteDraft);
publish.post('/:datasetId/delete', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, uploadNone, deleteDraft);

/* Cube Preview */
publish.post('/:datasetId/cube-preview', fetchDataset(), uploadNone, cubePreview);
publish.get('/:datasetId/cube-preview{/:filterId}', fetchDataset(), cubePreview);
publish.get('/:datasetId/download/metadata', fetchDataset(), downloadMetadata);
publish.post('/:datasetId/download', fetchDataset(), verifyCsrfToken, downloadPreview);
publish.get('/:datasetId/download{/:filterId}', fetchDataset(), downloadPreview);

publish.get('/:datasetId/build/:buildId', fetchDataset(), longBuildHandling);
publish.get('/:datasetId/build/:buildId/refresh', fetchDataset(), ajaxRefreshBuildStatus);

/* Measure creation */
publish.get('/:datasetId/measure', fetchDataset(), redirectIfOpenPublishRequest, measurePreview);
publish.post('/:datasetId/measure', fetchDataset(), redirectIfOpenPublishRequest, uploadSingle('csv'), measurePreview);
publish.get('/:datasetId/measure/review', fetchDataset(Include.Measure), redirectIfOpenPublishRequest, measureReview);
publish.post(
  '/:datasetId/measure/review',
  fetchDataset(Include.Measure),
  redirectIfOpenPublishRequest,
  uploadNone,
  measureReview
);
publish.get(
  '/:datasetId/measure/change-lookup',
  fetchDataset(Include.Measure),
  redirectIfOpenPublishRequest,
  measurePreview
);
publish.post(
  '/:datasetId/measure/change-lookup',
  fetchDataset(Include.Measure),
  redirectIfOpenPublishRequest,
  uploadSingle('csv'),
  measurePreview
);

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
  redirectIfOpenPublishRequest,
  uploadNone,
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
  redirectIfOpenPublishRequest,
  uploadNone,
  fetchDimensionPreview
);

publish.get(
  '/:datasetId/numbers/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  setupNumberDimension
);
publish.post(
  '/:datasetId/numbers/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
  setupNumberDimension
);

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
  redirectIfOpenPublishRequest,
  uploadSingle('csv'),
  uploadLookupTable
);
publish.get(
  '/:datasetId/lookup/:dimensionId/review',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  lookupReview
);
publish.post(
  '/:datasetId/lookup/:dimensionId/review',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
  lookupReview
);

publish.get(
  '/:datasetId/dates/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  fetchTimeDimensionPreview
);
publish.post(
  '/:datasetId/dates/:dimensionId',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
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
  redirectIfOpenPublishRequest,
  uploadNone,
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
  redirectIfOpenPublishRequest,
  uploadNone,
  pointInTimeChooser
);

/* date period flow */
publish.get(
  '/:datasetId/dates/:dimensionId/period',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  yearTypeChooser
);
publish.post(
  '/:datasetId/dates/:dimensionId/period',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
  yearTypeChooser
);
publish.get(
  '/:datasetId/dates/:dimensionId/period/year-format',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  yearFormat
);
publish.post(
  '/:datasetId/dates/:dimensionId/period/year-format',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
  yearFormat
);
publish.get(
  '/:datasetId/dates/:dimensionId/period/type',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  periodType
);
publish.post(
  '/:datasetId/dates/:dimensionId/period/type',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
  periodType
);
publish.get(
  '/:datasetId/dates/:dimensionId/period/quarters',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  quarterChooser
);
publish.post(
  '/:datasetId/dates/:dimensionId/period/quarters',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
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
  redirectIfOpenPublishRequest,
  uploadNone,
  monthChooser
);
publish.get(
  '/:datasetId/dates/:dimensionId/review',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  periodReview
);
publish.post(
  '/:datasetId/dates/:dimensionId/review',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
  periodReview
);

/* Applies to all dimensions */
publish.get(
  '/:datasetId/dimension/:dimensionId/name',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  upload.none(),
  dimensionName
);
publish.post(
  '/:datasetId/dimension/:dimensionId/name',
  fetchDataset(Include.Dimensions),
  redirectIfOpenPublishRequest,
  uploadNone,
  dimensionName
);
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
  redirectIfOpenPublishRequest,
  uploadNone,
  dimensionName
);

/* Metadata */
publish.get('/:datasetId/summary', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideSummary);
publish.post(
  '/:datasetId/summary',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNoneOrFieldError('summary', 'publish.summary.form.description.error.too_long'),
  verifyCsrfToken,
  provideSummary
);

publish.get('/:datasetId/collection', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideCollection);
publish.post(
  '/:datasetId/collection',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNoneOrFieldError('collection', 'publish.collection.form.collection.error.too_long'),
  verifyCsrfToken,
  provideCollection
);

publish.get('/:datasetId/quality', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideQuality);
publish.post(
  '/:datasetId/quality',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNone,
  provideQuality
);

publish.get('/:datasetId/providers', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideDataProviders);
publish.post(
  '/:datasetId/providers',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNone,
  provideDataProviders
);

publish.get('/:datasetId/related', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideRelatedLinks);
publish.post(
  '/:datasetId/related',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNone,
  provideRelatedLinks
);

publish.get(
  '/:datasetId/update-frequency',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  provideUpdateFrequency
);
publish.post(
  '/:datasetId/update-frequency',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNone,
  provideUpdateFrequency
);

publish.get('/:datasetId/designation', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideDesignation);
publish.post(
  '/:datasetId/designation',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNone,
  provideDesignation
);

publish.get('/:datasetId/topics', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideTopics);
publish.post('/:datasetId/topics', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, uploadNone, provideTopics);

publish.get('/:datasetId/reason', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, provideUpdateReason);
publish.post(
  '/:datasetId/reason',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNone,
  provideUpdateReason
);

/* Publishing */
publish.get('/:datasetId/schedule', fetchDataset(Include.Meta), redirectIfOpenPublishRequest, providePublishDate);
publish.post(
  '/:datasetId/schedule',
  fetchDataset(Include.Meta),
  redirectIfOpenPublishRequest,
  uploadNone,
  providePublishDate
);

/* Translations */
publish.get('/:datasetId/translation/export', fetchDataset(), redirectIfOpenPublishRequest, exportTranslations);
publish.get('/:datasetId/translation/import', fetchDataset(), redirectIfOpenPublishRequest, importTranslations);
publish.post(
  '/:datasetId/translation/import',
  fetchDataset(),
  redirectIfOpenPublishRequest,
  uploadSingle('csv'),
  importTranslations
);

/* Dataset Overview */
publish.get('/:datasetId/overview', fetchDataset(), overview);
publish.post('/:datasetId/overview', fetchDataset(), uploadNone, overview);

/* Start new dataset revision */
publish.get('/:datasetId/update', fetchDataset(), redirectIfOpenPublishRequest, createNewUpdate);
publish.get('/:datasetId/update-type', fetchDataset(), redirectIfOpenPublishRequest, updateDatatable);
publish.post('/:datasetId/update-type', fetchDataset(), redirectIfOpenPublishRequest, uploadNone, updateDatatable);

/* Move a dataset between groups */
publish.get('/:datasetId/move', fetchDataset(), moveDatasetGroup);
publish.post('/:datasetId/move', fetchDataset(), uploadNone, moveDatasetGroup);

publish.get('/:datasetId/task-decision/:taskId', fetchDataset(), taskDecision);
publish.post('/:datasetId/task-decision/:taskId', fetchDataset(), uploadNone, taskDecision);

/* Handle dataset actions (e.g. request publish, unpublish, archive etc) */
publish.get('/:datasetId/:action', fetchDataset(), datasetAction);
publish.post('/:datasetId/:action', fetchDataset(), uploadNone, datasetAction);
