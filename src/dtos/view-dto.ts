import { SourceType } from '../enums/source-type';

import { ViewError } from './view-error';
import { DatasetDTO } from './dataset';
import { FactTableDto } from './fact-table';

export interface CSVHeader {
    index: number;
    name: string;
    source_type?: SourceType;
}

export interface PageInfo {
    total_records: number | undefined;
    start_record: number | undefined;
    end_record: number | undefined;
}

export interface ViewErrDTO {
    status: number;
    errors: ViewError[];
    dataset_id: string | undefined;
}

export interface ViewDTO {
    status: number;
    dataset: DatasetDTO;
    fact_table: FactTableDto;
    current_page: number;
    page_info: PageInfo;
    pages: (string | number)[];
    page_size: number;
    total_pages: number;
    headers: CSVHeader[];
    data: string[][];
}
