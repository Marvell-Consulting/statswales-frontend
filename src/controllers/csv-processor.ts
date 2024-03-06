import { parse } from 'csv';
import pino from 'pino';

import { ProcessedCSV } from '../models/processedcsv';

export const logger = pino({
    name: 'StatsWales-Alpha-App',
    level: 'debug'
});

export const processCSV = async (buff: Buffer | undefined): Promise<ProcessedCSV> => {
    logger.debug('Processing upload');
    if (buff) {
        const csvdata: Array<Array<string>> = (await parse(buff, {
            delimiter: ','
        }).toArray()) as string[][];
        return {
            success: true,
            message: 'File uploaded successfully',
            data: csvdata,
            errors: null
        };
    } else {
        return {
            success: false,
            message: 'Failed to process CSV',
            data: null,
            errors: [{ field: 'csv', message: 'No file uploaded' }]
        };
    }
};
