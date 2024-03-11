import { Request, Response, Router } from 'express';
import multer from 'multer';

import { processCSV } from '../controllers/csv-processor';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const apiRoute = Router();

apiRoute.get('/', (req, res) => {
    res.json({ message: 'API is available' });
});

apiRoute.post('/csv', upload.single('csv'), async (req: Request, res: Response) => {
    const page_number_str: string = req.query.page_number || req.body?.page_number;
    const page_size_str: string = req.query.page_size || req.body?.page_size;
    const page_number: number = Number.parseInt(page_number_str, 10) || 1;
    const page_size: number = Number.parseInt(page_size_str, 10) || 100;
    const processedCSV = await processCSV(req.file?.buffer, page_number, page_size);
    if (!processedCSV.success) {
        res.status(400);
    }
    res.json(processedCSV);
});
