import { Router } from 'express';
import multer from 'multer';

import { fetchDataset } from '../middleware/fetch-dataset';
import { flashErrors } from '../middleware/flash-errors';
import { start, provideTitle, uploadFile, preview, confirm, sources, tasklist, redo } from '../controllers/publish';

export const publish = Router();

const upload = multer({ storage: multer.memoryStorage() });

publish.get('/', start);

publish.get('/title', provideTitle);
publish.post('/title', upload.none(), provideTitle);

publish.get('/:datasetId/title', fetchDataset, provideTitle);
publish.post('/:datasetId/title', fetchDataset, upload.none(), provideTitle);

publish.get('/:datasetId/upload', fetchDataset, uploadFile);
publish.post('/:datasetId/upload', fetchDataset, upload.single('csv'), uploadFile);

publish.get('/:datasetId/preview', fetchDataset, flashErrors, preview);

publish.get('/:datasetId/confirm', fetchDataset, confirm);

publish.get('/:datasetId/sources', fetchDataset, sources);
publish.post('/:datasetId/sources', fetchDataset, upload.none(), sources);

publish.get('/:datasetId/tasklist', fetchDataset, tasklist);

publish.get('/:datasetId/change', fetchDataset, redo);
publish.post('/:datasetId/change', fetchDataset, upload.none(), redo);
