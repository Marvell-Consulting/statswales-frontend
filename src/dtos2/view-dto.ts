import { Readable } from 'stream';

import { ViewError } from './view-error';
import { DatasetDTO, FileImportDTO } from './dataset-dto';

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
    pages: Array<string | number>;
    page_size: number;
    total_pages: number;
    headers: Array<CSVHeader>;
    data: Array<Array<string>>;
}

export interface ViewStream {
    success: boolean;
    stream: Readable;
}
