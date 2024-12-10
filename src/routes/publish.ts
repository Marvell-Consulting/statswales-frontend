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
    provideOrganisation
} from '../controllers/publish';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.get('/', start);

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

publish.get('/:datasetId/tasklist', fetchDataset, taskList);

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

publish.get('/:datasetId/schedule', fetchDataset, providePublishDate);
publish.post('/:datasetId/schedule', fetchDataset, upload.none(), providePublishDate);

publish.get('/:datasetId/organisation', fetchDataset, provideOrganisation);
publish.post('/:datasetId/organisation', fetchDataset, upload.none(), provideOrganisation);
