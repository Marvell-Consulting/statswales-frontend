import { ViewError } from './view-error';
import { DatasetDTO } from './dataset';
import { DataTableDto } from './data-table';
import { FactTableColumnType } from './fact-table-column-type';

export interface CSVHeader {
  index: number;
  name: string;
  source_type?: FactTableColumnType;
  extractor?: Record<string, string>;
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
  headers?: CSVHeader[];
  data?: string[][];
  extension?: object;
}

export interface ViewDTO {
  status: number;
  dataset: DatasetDTO;
  data_table: DataTableDto;
  current_page: number;
  page_info: PageInfo;
  pages: (string | number)[];
  page_size: number;
  total_pages: number;
  headers: CSVHeader[];
  data: string[][];
}
