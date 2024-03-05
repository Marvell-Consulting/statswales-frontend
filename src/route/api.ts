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
    const processedCSV = await processCSV(req.file?.buffer);
    console.log(processedCSV);
    if (!processedCSV.success) {
        res.status(400);
    }
    res.json(processedCSV);
});
