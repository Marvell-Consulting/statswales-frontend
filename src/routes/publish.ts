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
import { DatasetInclude as Include } from '../enums/dataset-include';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.get('/', start);

/* Dataset creation */
publish.get('/title', provideTitle);
publish.post('/title', upload.none(), provideTitle);

publish.get('/:datasetId', redirectToTasklist);

publish.get('/:datasetId/title', fetchDataset(Include.Metadata), provideTitle);
publish.post('/:datasetId/title', fetchDataset(Include.Metadata), upload.none(), provideTitle);

publish.get('/:datasetId/upload', fetchDataset(Include.DataTable), uploadDataTable);
publish.post('/:datasetId/upload', fetchDataset(Include.DataTable), upload.single('csv'), uploadDataTable);

publish.get('/:datasetId/preview', fetchDataset(Include.DataTable), factTablePreview);
publish.post('/:datasetId/preview', fetchDataset(Include.DataTable), upload.none(), factTablePreview);

publish.get('/:datasetId/sources', fetchDataset(Include.DataTable), sources);
publish.post('/:datasetId/sources', fetchDataset(Include.DataTable), upload.none(), sources);

/* Tasklist */
publish.get('/:datasetId/tasklist', fetchDataset(Include.Metadata), taskList);
publish.post('/:datasetId/tasklist', fetchDataset(Include.Metadata), upload.none(), taskList);

/* Cube Preview */
publish.get('/:datasetId/cube-preview', fetchDataset(), cubePreview);
publish.get('/:datasetId/cube-preview/download', fetchDataset(), downloadDataset);

/* Measure creation */
publish.get('/:datasetId/measure', fetchDataset(Include.DataTable), measurePreview);
publish.post('/:datasetId/measure', fetchDataset(Include.DataTable), upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/review', fetchDataset(Include.DataTable), measureReview);
publish.post('/:datasetId/measure/review', fetchDataset(Include.DataTable), measureReview);

/* Dimension creation */
publish.get('/:datasetId/dimension-data-chooser/:dimensionId', fetchDataset(), fetchDimensionPreview);
publish.post('/:datasetId/dimension-data-chooser/:dimensionId', fetchDataset(), fetchDimensionPreview);
publish.get('/:datasetId/dimension-data-chooser/:dimensionId/change-type', fetchDataset(), fetchDimensionPreview);
publish.post('/:datasetId/dimension-data-chooser/:dimensionId/change-type', fetchDataset(), fetchDimensionPreview);

/* lookup table handlers */
publish.get('/:datasetId/lookup/:dimensionId', fetchDataset(), uploadLookupTable);
publish.post('/:datasetId/lookup/:dimensionId', fetchDataset(), upload.single('csv'), uploadLookupTable);
publish.get('/:datasetId/lookup/:dimensionId/review', fetchDataset(), lookupReview);
publish.post('/:datasetId/lookup/:dimensionId/review', fetchDataset(), lookupReview);

publish.get('/:datasetId/time-period/:dimensionId', fetchDataset(), fetchTimeDimensionPreview);
publish.post('/:datasetId/time-period/:dimensionId', fetchDataset(), fetchTimeDimensionPreview);
publish.get('/:datasetId/time-period/:dimensionId/change-format', fetchDataset(), fetchTimeDimensionPreview);
publish.post('/:datasetId/time-period/:dimensionId/change-format', fetchDataset(), fetchTimeDimensionPreview);
publish.get('/:datasetId/time-period/:dimensionId/point-in-time', fetchDataset(), pointInTimeChooser);
publish.post('/:datasetId/time-period/:dimensionId/point-in-time', fetchDataset(), pointInTimeChooser);

/* Period of time flow */
publish.get('/:datasetId/time-period/:dimensionId/period-of-time', fetchDataset(), yearTypeChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time', fetchDataset(), yearTypeChooser);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/year-format', fetchDataset(), yearFormat);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/year-format', fetchDataset(), yearFormat);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/period-type', fetchDataset(), periodType);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/period-type', fetchDataset(), periodType);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/quarters', fetchDataset(), quarterChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/quarters', fetchDataset(), quarterChooser);
publish.get('/:datasetId/time-period/:dimensionId/period-of-time/months', fetchDataset(), monthChooser);
publish.post('/:datasetId/time-period/:dimensionId/period-of-time/months', fetchDataset(), monthChooser);
publish.get('/:datasetId/time-period/:dimensionId/review', fetchDataset(), periodReview);
publish.post('/:datasetId/time-period/:dimensionId/review', fetchDataset(), periodReview);

/* Applies to all dimensions */
publish.get('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset(), dimensionName);
publish.post('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset(), dimensionName);
publish.get('/:datasetId/dimension/:dimensionId/change-name', upload.none(), fetchDataset(), dimensionName);
publish.post('/:datasetId/dimension/:dimensionId/change-name', upload.none(), fetchDataset(), dimensionName);

/* Metadata */
publish.get('/:datasetId/change', fetchDataset(), changeData);
publish.post('/:datasetId/change', fetchDataset(), upload.none(), changeData);

publish.get('/:datasetId/summary', fetchDataset(Include.Metadata), provideSummary);
publish.post('/:datasetId/summary', fetchDataset(Include.Metadata), upload.none(), provideSummary);

publish.get('/:datasetId/collection', fetchDataset(Include.Metadata), provideCollection);
publish.post('/:datasetId/collection', fetchDataset(Include.Metadata), upload.none(), provideCollection);

publish.get('/:datasetId/quality', fetchDataset(Include.Metadata), provideQuality);
publish.post('/:datasetId/quality', fetchDataset(Include.Metadata), upload.none(), provideQuality);

publish.get('/:datasetId/providers', fetchDataset(Include.Metadata), provideDataProviders);
publish.post('/:datasetId/providers', fetchDataset(Include.Metadata), upload.none(), provideDataProviders);

publish.get('/:datasetId/related', fetchDataset(Include.Metadata), provideRelatedLinks);
publish.post('/:datasetId/related', fetchDataset(Include.Metadata), upload.none(), provideRelatedLinks);

publish.get('/:datasetId/update-frequency', fetchDataset(Include.Metadata), provideUpdateFrequency);
publish.post('/:datasetId/update-frequency', fetchDataset(Include.Metadata), upload.none(), provideUpdateFrequency);

publish.get('/:datasetId/designation', fetchDataset(Include.Metadata), provideDesignation);
publish.post('/:datasetId/designation', fetchDataset(Include.Metadata), upload.none(), provideDesignation);

publish.get('/:datasetId/topics', fetchDataset(Include.Metadata), provideTopics);
publish.post('/:datasetId/topics', fetchDataset(Include.Metadata), upload.none(), provideTopics);

/* Publishing */
publish.get('/:datasetId/schedule', fetchDataset(), providePublishDate);
publish.post('/:datasetId/schedule', fetchDataset(), upload.none(), providePublishDate);

publish.get('/:datasetId/organisation', fetchDataset(), provideOrganisation);
publish.post('/:datasetId/organisation', fetchDataset(), upload.none(), provideOrganisation);

/* Translations */
publish.get('/:datasetId/translation/export', fetchDataset(), exportTranslations);
publish.get('/:datasetId/translation/import', fetchDataset(), importTranslations);
publish.post('/:datasetId/translation/import', fetchDataset(), upload.single('csv'), importTranslations);

/* Dataset Overview */
publish.get('/:datasetId/overview', fetchDataset(), overview);
publish.post('/:datasetId/overview', fetchDataset(), upload.none(), overview);

/* Update Dataset */
publish.get('/:datasetId/update', fetchDataset(), createNewUpdate);
publish.get('/:datasetId/update-type', fetchDataset(), updateDatatable);
publish.post('/:datasetId/update-type', fetchDataset(), updateDatatable);
