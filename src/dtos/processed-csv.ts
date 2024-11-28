import { DatasetDTO } from './dataset';
import { ViewError } from './view-error';

export interface PageInfo {
    total_records: number;
    start_record: number;
    end_record: number;
}

export interface ProcessedCSV {
    success: boolean;
    dataset: DatasetDTO;
    current_page: number;
    page_info: PageInfo;
    page_size: number;
    total_pages: number;
    headers: string[];
    data: string[][];
    errors: ViewError[];
}
