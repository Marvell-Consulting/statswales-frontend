import { Error } from './error';

export interface ProcessedCSV {
    success: boolean;
    current_page: number | undefined;
    page_size: number | undefined;
    total_pages: number | undefined;
    headers: Array<string> | undefined;
    data: Array<Array<string>> | undefined;
    errors: Array<Error> | undefined;
}
