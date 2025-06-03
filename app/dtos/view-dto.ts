import { SourceType } from '../enums/source-type';

import type { ViewError } from './view-error';
import type { DatasetDTO } from './dataset';
import type { DataTableDto } from './data-table';

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
