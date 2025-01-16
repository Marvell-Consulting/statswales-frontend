import { Router, Request, Response, NextFunction } from 'express';

import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { getPaginationProps } from '../utils/pagination';

export const consumer = Router();

consumer.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page_number as string, 10) || 1;
        const limit = parseInt(req.query.page_size as string, 10) || 10;
        const results: ResultsetWithCount<DatasetListItemDTO> = await req.swapi.getPublishedDatasetList(page, limit);
        const { data, count } = results;
        const pagination = getPaginationProps(page, limit, count);

        res.render('consumer/list', { data, count, ...pagination, hide_pagination_hint: true });
    } catch (err) {
        next(err);
    }
});
