import { Readable } from 'stream';

import { ViewError } from './view-error';
import { DatasetDTO } from './dataset-dto';
import { FileImportDTO } from './file-import';

export interface CSVHeader {
    index: number;
    name: string;
}

export interface PageInfo {
    total_records: number | undefined;
    start_record: number | undefined;
    end_record: number | undefined;
}

export interface ViewErrDTO {
    success: boolean;
    status: number;
    errors: ViewError[];
    dataset_id: string | undefined;
}

export interface ViewDTO {
    success: boolean;
    dataset: DatasetDTO;
    import: FileImportDTO;
    current_page: number;
    page_info: PageInfo;
    pages: (string | number)[];
    page_size: number;
    total_pages: number;
    headers: CSVHeader[];
    data: string[][];
}

export interface ViewStream {
    success: boolean;
    stream: Readable;
}
