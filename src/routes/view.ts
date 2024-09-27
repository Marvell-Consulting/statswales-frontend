import { Router, Response } from 'express';
import { validate as validateUUID } from 'uuid';

import { StatsWalesApi } from '../services/stats-wales-api';
import { FileList } from '../dtos2/file-list';
import { ViewErrDTO } from '../dtos2/view-dto';
import { logger } from '../utils/logger';
import { AuthedRequest } from '../interfaces/authed-request';

export const view = Router();

const statsWalesApi = (req: AuthedRequest) => {
    const lang = req.i18n.language;
    const token = req.jwt;
    return new StatsWalesApi(lang, token);
};

view.get('/', async (req: AuthedRequest, res: Response) => {
    const fileList: FileList = await statsWalesApi(req).getFileList();
    logger.debug(`FileList from server = ${JSON.stringify(fileList)}`);
    res.render('view/list', fileList);
});

view.get('/:datasetId', async (req: AuthedRequest, res: Response) => {
    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 100;

    if (!req.params.datasetId || !validateUUID(req.params.datasetId)) {
        const err: ViewErrDTO = {
            success: false,
            status: 404,
            dataset_id: undefined,
            errors: [
                {
                    field: 'file',
                    tag: {
                        name: 'errors.dataset_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('view/data', { errors: err });
        return;
    }

    const datasetId = req.params.datasetId;
    const file = await statsWalesApi(req).getDatasetView(datasetId, page_number, page_size);
    if (!file.success) {
        const error = file as ViewErrDTO;
        res.status(error.status);
        res.render('view/data', { errors: file });
        return;
    }
    res.render('view/data', file);
});
