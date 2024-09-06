import { Router, Request, Response } from 'express';

import { t } from '../config/i18next';
import { API } from '../controllers/api';
import { FileList } from '../dtos2/filelist';
import { ViewErrDTO } from '../dtos2/view-dto';

const APIInstance = new API();
export const view = Router();

view.get('/', async (req: Request, res: Response) => {
    const lang = req.i18n.language;
    const fileList: FileList = await APIInstance.getFileList(lang);
    console.log(`FileList from server = ${JSON.stringify(fileList)}`);
    res.render('list', fileList);
});

view.get('/:datasetId', async (req: Request, res: Response) => {
    const lang = req.i18n.language;
    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 100;

    if (!req.params.datasetId) {
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: undefined,
            errors: [
                {
                    field: 'file',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('errors.dataset_missing')
                        }
                    ],
                    tag: {
                        name: 'errors.dataset_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('data', err);
        return;
    }
    const datasetId = req.params.datasetId;

    const file = await APIInstance.getDatasetView(lang, datasetId, page_number, page_size);
    if (!file.success) {
        const error = file as ViewErrDTO;
        res.status(error.status);
    }
    res.render('data', file);
});
