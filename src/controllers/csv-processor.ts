import { parse } from 'csv';
import pino from 'pino';

import { ProcessedCSV } from '../models/processedcsv';
import { Error } from '../models/error';

const MAX_PAGE_SIZE = 500;
const MIN_PAGE_SIZE = 5;

export const logger = pino({
    name: 'StatsWales-Alpha-App',
    level: 'debug'
});

function paginate<T>(array: Array<T>, page_number: number, page_size: number): Array<T> {
    const page = array.slice((page_number - 1) * page_size, page_number * page_size);
    return page;
}

function validatePageSize(page_size: number): boolean {
    if (page_size > MAX_PAGE_SIZE || page_size < MIN_PAGE_SIZE) {
        return false;
    }
    return true;
}

function validatePageNumber(page_number: number): boolean {
    if (page_number < 1) {
        return false;
    }
    return true;
}

function validatMaxPageNumber(page_number: number, max_page_number: number): boolean {
    if (page_number > max_page_number) {
        return false;
    }
    return true;
}

function validateParams(page_number: number, max_page_number: number, page_size: number): Array<Error> {
    const errors: Array<Error> = [];
    if (!validatePageSize(page_size)) {
        errors.push({ field: 'page_size', message: `Page size must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}` });
    }
    if (!validatMaxPageNumber(page_number, max_page_number)) {
        errors.push({ field: 'page_number', message: `Page number must be less than or equal to ${max_page_number}` });
    }
    if (!validatePageNumber(page_number)) {
        errors.push({ field: 'page_number', message: 'Page number must be greater than 0' });
    }
    return errors;
}

export const processCSV = async (buff: Buffer | undefined, page: number, size: number): Promise<ProcessedCSV> => {
    logger.debug('Processing upload');
    if (buff) {
        const dataArray: Array<Array<string>> = (await parse(buff, {
            delimiter: ','
        }).toArray()) as string[][];
        const csvheaders = dataArray.shift();
        const total_pages = Math.ceil(dataArray.length / size);
        const errors = validateParams(page, total_pages, size);
        if (errors.length > 0) {
            return {
                success: false,
                page_size: undefined,
                current_page: undefined,
                total_pages: undefined,
                headers: undefined,
                data: undefined,
                errors
            };
        }

        const csvdata = paginate(dataArray, page, size);
        return {
            success: true,
            current_page: page,
            page_size: size,
            total_pages,
            headers: csvheaders,
            data: csvdata,
            errors: undefined
        };
    } else {
        return {
            success: false,
            page_size: undefined,
            current_page: undefined,
            total_pages: undefined,
            headers: undefined,
            data: undefined,
            errors: [{ field: 'csv', message: 'No file uploaded' }]
        };
    }
};
