import { Router } from 'express';
import multer from 'multer';

import { fetchDataset } from '../middleware/fetch-dataset';
import {
    start,
    provideTitle,
    uploadFile,
    importPreview,
    sources,
    taskList,
    changeData,
    redirectToTasklist
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

publish.get('/:datasetId/preview', fetchDataset, importPreview);
publish.post('/:datasetId/preview', fetchDataset, upload.none(), importPreview);

publish.get('/:datasetId/sources', fetchDataset, sources);
publish.post('/:datasetId/sources', fetchDataset, upload.none(), sources);

publish.get('/:datasetId/tasklist', fetchDataset, taskList);

publish.get('/:datasetId/change', fetchDataset, changeData);
publish.post('/:datasetId/change', fetchDataset, upload.none(), changeData);
