import { NextFunction, Request, Response, Router } from 'express';

import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { statusToColour } from '../utils/status-to-colour';

export const homepage = Router();

homepage.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const datasets: DatasetListItemDTO[] = await req.swapi.getActiveDatasetList();
        res.render('homepage', { datasets, statusToColour });
    } catch (err) {
        next(err);
    }
});
