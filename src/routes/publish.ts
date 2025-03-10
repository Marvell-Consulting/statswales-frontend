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
    updateDatatable,
    measureName
} from '../controllers/publish';
import { DatasetInclude as Include } from '../enums/dataset-include';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.get('/', start);

/* Dataset creation */
publish.get('/title', provideTitle);
publish.post('/title', upload.none(), provideTitle);

publish.get('/:datasetId', redirectToTasklist);

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

/* Cube Preview */
publish.get('/:datasetId/cube-preview', fetchDataset(Include.All), cubePreview);
publish.get('/:datasetId/cube-preview/download', fetchDataset(Include.All), downloadDataset);

/* Measure creation */
publish.get('/:datasetId/measure', fetchDataset(Include.Data), measurePreview);
publish.post('/:datasetId/measure', fetchDataset(Include.Data), upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/review', fetchDataset(Include.Data), measureReview);
publish.post('/:datasetId/measure/review', fetchDataset(Include.Data), measureReview);
publish.get('/:datasetId/measure/name', fetchDataset(Include.Data), measureName);
publish.get('/:datasetId/measure/change-lookup', fetchDataset(Include.Data), measurePreview);
publish.post('/:datasetId/measure/change-lookup', fetchDataset(Include.Data), upload.single('csv'), measurePreview);
publish.get('/:datasetId/measure/change-name', fetchDataset(Include.Data), measureName);
publish.post('/:datasetId/measure/name', upload.none(), fetchDataset(Include.Data), measureName);
publish.post('/:datasetId/measure/change-name', upload.none(), fetchDataset(Include.Data), measureName);

/* Dimension creation */
publish.get('/:datasetId/dimension-data-chooser/:dimensionId', fetchDataset(Include.Data), fetchDimensionPreview);
publish.post('/:datasetId/dimension-data-chooser/:dimensionId', fetchDataset(Include.Data), fetchDimensionPreview);
publish.get(
    '/:datasetId/dimension-data-chooser/:dimensionId/change-type',
    fetchDataset(Include.Data),
    fetchDimensionPreview
);
publish.post(
    '/:datasetId/dimension-data-chooser/:dimensionId/change-type',
    fetchDataset(Include.Data),
    fetchDimensionPreview
);

/* lookup table handlers */
publish.get('/:datasetId/lookup/:dimensionId', fetchDataset(Include.Data), uploadLookupTable);
publish.post('/:datasetId/lookup/:dimensionId', fetchDataset(Include.Data), upload.single('csv'), uploadLookupTable);
publish.get('/:datasetId/lookup/:dimensionId/review', fetchDataset(Include.Data), lookupReview);
publish.post('/:datasetId/lookup/:dimensionId/review', fetchDataset(Include.Data), lookupReview);

publish.get('/:datasetId/dates/:dimensionId', fetchDataset(Include.Data), fetchTimeDimensionPreview);
publish.post('/:datasetId/dates/:dimensionId', fetchDataset(Include.Data), fetchTimeDimensionPreview);
publish.get('/:datasetId/dates/:dimensionId/change-format', fetchDataset(Include.Data), fetchTimeDimensionPreview);
publish.post('/:datasetId/dates/:dimensionId/change-format', fetchDataset(Include.Data), fetchTimeDimensionPreview);
publish.get('/:datasetId/dates/:dimensionId/point-in-time', fetchDataset(Include.Data), pointInTimeChooser);
publish.post('/:datasetId/dates/:dimensionId/point-in-time', fetchDataset(Include.Data), pointInTimeChooser);

/* date period flow */
publish.get('/:datasetId/dates/:dimensionId/period', fetchDataset(Include.Data), yearTypeChooser);
publish.post('/:datasetId/dates/:dimensionId/period', fetchDataset(Include.Data), yearTypeChooser);
publish.get('/:datasetId/dates/:dimensionId/period/year-format', fetchDataset(Include.Data), yearFormat);
publish.post('/:datasetId/dates/:dimensionId/period/year-format', fetchDataset(Include.Data), yearFormat);
publish.get('/:datasetId/dates/:dimensionId/period/type', fetchDataset(Include.Data), periodType);
publish.post('/:datasetId/dates/:dimensionId/period/type', fetchDataset(Include.Data), periodType);
publish.get('/:datasetId/dates/:dimensionId/period/quarters', fetchDataset(Include.Data), quarterChooser);
publish.post('/:datasetId/dates/:dimensionId/period/quarters', fetchDataset(Include.Data), quarterChooser);
publish.get('/:datasetId/dates/:dimensionId/period/months', fetchDataset(Include.Data), monthChooser);
publish.post('/:datasetId/dates/:dimensionId/period/months', fetchDataset(Include.Data), monthChooser);
publish.get('/:datasetId/dates/:dimensionId/review', fetchDataset(Include.Data), periodReview);
publish.post('/:datasetId/dates/:dimensionId/review', fetchDataset(Include.Data), periodReview);

/* Applies to all dimensions */
publish.get('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset(Include.Data), dimensionName);
publish.post('/:datasetId/dimension/:dimensionId/name', upload.none(), fetchDataset(Include.Data), dimensionName);
publish.get('/:datasetId/dimension/:dimensionId/change-name', upload.none(), fetchDataset(Include.Data), dimensionName);
publish.post(
    '/:datasetId/dimension/:dimensionId/change-name',
    upload.none(),
    fetchDataset(Include.Data),
    dimensionName
);

/* Metadata */
publish.get('/:datasetId/change', fetchDataset(), changeData);
publish.post('/:datasetId/change', fetchDataset(), upload.none(), changeData);

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
