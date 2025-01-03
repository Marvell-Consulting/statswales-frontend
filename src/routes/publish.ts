import { Router } from 'express';
import multer from 'multer';

import { fetchDataset } from '../middleware/fetch-dataset';
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
    downloadAsCSV,
    downloadAsParquet,
    downloadAsExcel,
    downloadAsDuckDb
} from '../controllers/publish';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.get('/', start);

/* Dataset creation */
publish.get('/title', provideTitle);
publish.post('/title', upload.none(), provideTitle);

publish.get('/:datasetId', redirectToTasklist);

publish.get('/:datasetId/title', fetchDataset, provideTitle);
publish.post('/:datasetId/title', fetchDataset, upload.none(), provideTitle);

publish.get('/:datasetId/upload', fetchDataset, uploadFile);
publish.post('/:datasetId/upload', fetchDataset, upload.single('csv'), uploadFile);

publish.get('/:datasetId/preview', fetchDataset, factTablePreview);
publish.post('/:datasetId/preview', fetchDataset, upload.none(), factTablePreview);

publish.get('/:datasetId/sources', fetchDataset, sources);
publish.post('/:datasetId/sources', fetchDataset, upload.none(), sources);

/* Tasklist */
publish.get('/:datasetId/tasklist', fetchDataset, taskList);

/* Cube Preview */
publish.get('/:datasetId/cube-preview', fetchDataset, cubePreview);
publish.get('/:datasetId/cube-preview/csv', fetchDataset, downloadAsCSV);
publish.get('/:datasetId/cube-preview/parquet', fetchDataset, downloadAsParquet);
publish.get('/:datasetId/cube-preview/excel', fetchDataset, downloadAsExcel);
publish.get('/:datasetId/cube-preview/cube', fetchDataset, downloadAsDuckDb);

/* Measure creation */
publish.get('/:datasetId/measure', fetchDataset, measurePreview);
publish.post('/:datasetId/measure', fetchDataset, upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/review', fetchDataset, measureReview);
publish.post('/:datasetId/measure/review', fetchDataset, measureReview);

/* Dimension creation */
publish.get('/:datasetId/dimension-data-chooser/:dimensionId', fetchDataset, fetchDimensionPreview);
publish.post('/:datasetId/dimension-data-chooser/:dimensionId', fetchDataset, fetchDimensionPreview);

/* lookup table handlers */
publish.get('/:datasetId/lookup/:dimensionId', fetchDataset, uploadLookupTable);
publish.post('/:datasetId/lookup/:dimensionId', fetchDataset, upload.single('csv'), uploadLookupTable);
publish.get('/:datasetId/lookup/:dimensionId/review', fetchDataset, lookupReview);
publish.post('/:datasetId/lookup/:dimensionId/review', fetchDataset, lookupReview);

publish.get('/:datasetId/time-period/:dimensionId', fetchDataset, fetchTimeDimensionPreview);
publish.post('/:datasetId/time-period/:dimensionId', fetchDataset, fetchTimeDimensionPreview);
publish.get('/:datasetId/time-period/:dimensionId/point-in-time', fetchDataset, pointInTimeChooser);
publish.post('/:datasetId/time-period/:dimensionId/point-in-time', fetchDataset, pointInTimeChooser);

/* Period of time flow */
publish.get('/:datasetId/time-period/:dimensionId/period-of-time', fetchDataset, yearTypeChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time', fetchDataset, yearTypeChooser);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/year-format', fetchDataset, yearFormat);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/year-format', fetchDataset, yearFormat);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/period-type', fetchDataset, periodType);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/period-type', fetchDataset, periodType);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/quarters', fetchDataset, quarterChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/quarters', fetchDataset, quarterChooser);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/months', fetchDataset, monthChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/months', fetchDataset, monthChooser);
publish.get('/:datasetId/time-period/:dimensionId/review', fetchDataset, periodReview);
publish.post('/:datasetId/time-period/:dimensionId/review', fetchDataset, periodReview);

/* Applies to all dimensions */
publish.get('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset, dimensionName);
publish.post('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset, dimensionName);

/* Metadata */
publish.get('/:datasetId/change', fetchDataset, changeData);
publish.post('/:datasetId/change', fetchDataset, upload.none(), changeData);

publish.get('/:datasetId/summary', fetchDataset, provideSummary);
publish.post('/:datasetId/summary', fetchDataset, upload.none(), provideSummary);

publish.get('/:datasetId/collection', fetchDataset, provideCollection);
publish.post('/:datasetId/collection', fetchDataset, upload.none(), provideCollection);

publish.get('/:datasetId/quality', fetchDataset, provideQuality);
publish.post('/:datasetId/quality', fetchDataset, upload.none(), provideQuality);

publish.get('/:datasetId/providers', fetchDataset, provideDataProviders);
publish.post('/:datasetId/providers', fetchDataset, upload.none(), provideDataProviders);

publish.get('/:datasetId/related', fetchDataset, provideRelatedLinks);
publish.post('/:datasetId/related', fetchDataset, upload.none(), provideRelatedLinks);

publish.get('/:datasetId/update-frequency', fetchDataset, provideUpdateFrequency);
publish.post('/:datasetId/update-frequency', fetchDataset, upload.none(), provideUpdateFrequency);

publish.get('/:datasetId/designation', fetchDataset, provideDesignation);
publish.post('/:datasetId/designation', fetchDataset, upload.none(), provideDesignation);

publish.get('/:datasetId/topics', fetchDataset, provideTopics);
publish.post('/:datasetId/topics', fetchDataset, upload.none(), provideTopics);

/* Publishing */
publish.get('/:datasetId/schedule', fetchDataset, providePublishDate);
publish.post('/:datasetId/schedule', fetchDataset, upload.none(), providePublishDate);

publish.get('/:datasetId/organisation', fetchDataset, provideOrganisation);
publish.post('/:datasetId/organisation', fetchDataset, upload.none(), provideOrganisation);

/* Translations */
publish.get('/:datasetId/translation/export', fetchDataset, exportTranslations);
publish.get('/:datasetId/translation/import', fetchDataset, importTranslations);
publish.post('/:datasetId/translation/import', fetchDataset, upload.single('csv'), importTranslations);
