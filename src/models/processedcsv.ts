import { Error } from './error';

export interface ProcessedCSV {
    success: boolean;
    message: string;
    data: Array<Array<string>> | null;
    errors: Array<Error> | null;
}
