import { Router } from 'express';
import multer from 'multer';

import { fetchFullDataset, fetchLimitedDataset } from '../middleware/fetch-dataset';
import {
    start,
    provideTitle,
    uploadFile,
    factTablePreview,
    sources,
    taskList,
    changeData,
    redirectToTasklist,
    provideSummary,
    provideCollection,
    provideQuality,
    provideDataProviders,
    provideRelatedLinks,
    provideUpdateFrequency,
    provideDesignation,
    provideTopics,
    providePublishDate,
    provideOrganisation,
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
    updateDatatable
} from '../controllers/publish';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.get('/', start);

/* Dataset creation */
publish.get('/title', provideTitle);
publish.post('/title', upload.none(), provideTitle);

publish.get('/:datasetId', redirectToTasklist);

publish.get('/:datasetId/title', fetchLimitedDataset, provideTitle);
publish.post('/:datasetId/title', fetchLimitedDataset, upload.none(), provideTitle);

publish.get('/:datasetId/upload', fetchFullDataset, uploadFile);
publish.post('/:datasetId/upload', fetchFullDataset, upload.single('csv'), uploadFile);

publish.get('/:datasetId/preview', fetchFullDataset, factTablePreview);
publish.post('/:datasetId/preview', fetchFullDataset, upload.none(), factTablePreview);

publish.get('/:datasetId/sources', fetchFullDataset, sources);
publish.post('/:datasetId/sources', fetchFullDataset, upload.none(), sources);

/* Tasklist */
publish.get('/:datasetId/tasklist', fetchLimitedDataset, taskList);
publish.post('/:datasetId/tasklist', fetchLimitedDataset, upload.none(), taskList);

/* Cube Preview */
publish.get('/:datasetId/cube-preview', fetchFullDataset, cubePreview);
publish.get('/:datasetId/cube-preview/download', fetchFullDataset, downloadDataset);

/* Measure creation */
publish.get('/:datasetId/measure', fetchFullDataset, measurePreview);
publish.post('/:datasetId/measure', fetchFullDataset, upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/review', fetchFullDataset, measureReview);
publish.post('/:datasetId/measure/review', fetchFullDataset, measureReview);

/* Dimension creation */
publish.get('/:datasetId/dimension-data-chooser/:dimensionId', fetchFullDataset, fetchDimensionPreview);
publish.post('/:datasetId/dimension-data-chooser/:dimensionId', fetchFullDataset, fetchDimensionPreview);
publish.get('/:datasetId/dimension-data-chooser/:dimensionId/change-type', fetchFullDataset, fetchDimensionPreview);
publish.post('/:datasetId/dimension-data-chooser/:dimensionId/change-type', fetchFullDataset, fetchDimensionPreview);

/* lookup table handlers */
publish.get('/:datasetId/lookup/:dimensionId', fetchFullDataset, uploadLookupTable);
publish.post('/:datasetId/lookup/:dimensionId', fetchFullDataset, upload.single('csv'), uploadLookupTable);
publish.get('/:datasetId/lookup/:dimensionId/review', fetchFullDataset, lookupReview);
publish.post('/:datasetId/lookup/:dimensionId/review', fetchFullDataset, lookupReview);

publish.get('/:datasetId/time-period/:dimensionId', fetchLimitedDataset, fetchTimeDimensionPreview);
publish.post('/:datasetId/time-period/:dimensionId', fetchFullDataset, fetchTimeDimensionPreview);
publish.get('/:datasetId/time-period/:dimensionId/change-format', fetchLimitedDataset, fetchTimeDimensionPreview);
publish.post('/:datasetId/time-period/:dimensionId/change-format', fetchFullDataset, fetchTimeDimensionPreview);
publish.get('/:datasetId/time-period/:dimensionId/point-in-time', fetchFullDataset, pointInTimeChooser);
publish.post('/:datasetId/time-period/:dimensionId/point-in-time', fetchFullDataset, pointInTimeChooser);

/* Period of time flow */
publish.get('/:datasetId/time-period/:dimensionId/period-of-time', fetchFullDataset, yearTypeChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time', fetchFullDataset, yearTypeChooser);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/year-format', fetchFullDataset, yearFormat);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/year-format', fetchFullDataset, yearFormat);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/period-type', fetchFullDataset, periodType);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/period-type', fetchFullDataset, periodType);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/quarters', fetchFullDataset, quarterChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/quarters', fetchFullDataset, quarterChooser);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/months', fetchFullDataset, monthChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/months', fetchFullDataset, monthChooser);
publish.get('/:datasetId/time-period/:dimensionId/review', fetchFullDataset, periodReview);
publish.post('/:datasetId/time-period/:dimensionId/review', fetchFullDataset, periodReview);

/* Applies to all dimensions */
publish.get('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchFullDataset, dimensionName);
publish.post('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchFullDataset, dimensionName);
publish.get('/:datasetId/dimension/:dimensionId/change-name', upload.none(), fetchFullDataset, dimensionName);
publish.post('/:datasetId/dimension/:dimensionId/change-name', upload.none(), fetchFullDataset, dimensionName);

/* Metadata */
publish.get('/:datasetId/change', fetchLimitedDataset, changeData);
publish.post('/:datasetId/change', fetchLimitedDataset, upload.none(), changeData);

publish.get('/:datasetId/summary', fetchLimitedDataset, provideSummary);
publish.post('/:datasetId/summary', fetchLimitedDataset, upload.none(), provideSummary);

publish.get('/:datasetId/collection', fetchLimitedDataset, provideCollection);
publish.post('/:datasetId/collection', fetchLimitedDataset, upload.none(), provideCollection);

publish.get('/:datasetId/quality', fetchLimitedDataset, provideQuality);
publish.post('/:datasetId/quality', fetchLimitedDataset, upload.none(), provideQuality);

publish.get('/:datasetId/providers', fetchLimitedDataset, provideDataProviders);
publish.post('/:datasetId/providers', fetchLimitedDataset, upload.none(), provideDataProviders);

publish.get('/:datasetId/related', fetchLimitedDataset, provideRelatedLinks);
publish.post('/:datasetId/related', fetchLimitedDataset, upload.none(), provideRelatedLinks);

publish.get('/:datasetId/update-frequency', fetchLimitedDataset, provideUpdateFrequency);
publish.post('/:datasetId/update-frequency', fetchLimitedDataset, upload.none(), provideUpdateFrequency);

publish.get('/:datasetId/designation', fetchLimitedDataset, provideDesignation);
publish.post('/:datasetId/designation', fetchLimitedDataset, upload.none(), provideDesignation);

publish.get('/:datasetId/topics', fetchLimitedDataset, provideTopics);
publish.post('/:datasetId/topics', fetchLimitedDataset, upload.none(), provideTopics);

/* Publishing */
publish.get('/:datasetId/schedule', fetchLimitedDataset, providePublishDate);
publish.post('/:datasetId/schedule', fetchLimitedDataset, upload.none(), providePublishDate);

publish.get('/:datasetId/organisation', fetchLimitedDataset, provideOrganisation);
publish.post('/:datasetId/organisation', fetchLimitedDataset, upload.none(), provideOrganisation);

/* Translations */
publish.get('/:datasetId/translation/export', fetchLimitedDataset, exportTranslations);
publish.get('/:datasetId/translation/import', fetchLimitedDataset, importTranslations);
publish.post('/:datasetId/translation/import', fetchLimitedDataset, upload.single('csv'), importTranslations);

/* Dataset Overview */
publish.get('/:datasetId/overview', fetchLimitedDataset, overview);
publish.post('/:datasetId/overview', fetchLimitedDataset, upload.none(), overview);

/* Update Dataset */
publish.get('/:datasetId/update', fetchLimitedDataset, createNewUpdate);
publish.get('/:datasetId/update-type', fetchLimitedDataset, updateDatatable);
publish.post('/:datasetId/update-type', fetchLimitedDataset, updateDatatable);
