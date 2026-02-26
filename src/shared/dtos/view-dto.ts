import { ViewError } from './view-error';
import { DatasetDTO } from './dataset';
import { DataTableDto } from './data-table';
import { FactTableColumnType } from './fact-table-column-type';
import { Filter, FilterV2 } from '../interfaces/filter';

export interface ColumnHeader {
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

export interface PageInfoV2 extends PageInfo {
  current_page: number;
  page_size: number;
  total_pages: number;
}

export interface ViewErrDTO {
  status: number;
  errors: ViewError[];
  dataset_id: string | undefined;
  headers?: ColumnHeader[];
  data?: string[][];
  extension?: object;
}

/**
 * Configuration for a pivoted view of the dataset.
 *
 * When a pivoted result is requested, {@link ViewV2DTO.pivot} is populated
 * to describe which dataset columns have been used for the pivot axes.
 */
interface Pivot {
  /**
   * The column name or identifier used for the horizontal axis
   * (i.e. the column dimension of the pivot table).
   */
  x: string;
  /**
   * The column name or identifier used for the vertical axis
   * (i.e. the row dimension of the pivot table).
   */
  y: string;
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
  headers: ColumnHeader[];
  data: string[][];
  note_codes?: string[];
  extension?: object;
  filters?: Filter[];
}

export interface ViewV2DTO {
  dataset: DatasetDTO;
  filters?: FilterV2[];
  headers: ColumnHeader[];
  data: string[][];
  page_info: PageInfoV2;
  /**
   * Details of the pivot configuration applied to this view, when the
   * dataset has been requested in a pivoted form. Absent for non-pivot views.
   */
  pivot?: Pivot;
}
