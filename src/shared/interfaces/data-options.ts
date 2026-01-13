import { DataValueType } from '../enums/data-value-type';
import { FilterV2 } from './filter';

class PivotDTO {
  backend: 'postgres' | 'duckdb'; // Default: 'duckdb'
  include_performance: boolean; // Default: false
  x: string | string[];
  y: string | string[];
}

class ColumnOptionsDTO {
  use_raw_column_names?: boolean;
  use_reference_values?: boolean;
  data_value_type?: DataValueType;
}

export class DataOptionsDTO {
  pivot?: PivotDTO;
  filters?: FilterV2[];
  options?: ColumnOptionsDTO;
}

export const FRONTEND_DATA_OPTIONS: DataOptionsDTO = {
  filters: [],
  options: {
    use_raw_column_names: true,
    use_reference_values: true,
    data_value_type: DataValueType.WithNoteCodes
  }
};
