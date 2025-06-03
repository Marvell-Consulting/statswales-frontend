import { LookupTableDTO } from '../lookup-table';
import type { DimensionMetadataDTO } from '../dimension-metadata';
import { MeasureRowDTO } from '../measure-row';

export interface SingleLanguageMeasure {
  id: string;
  dataset_id: string;
  fact_table_column: string;
  join_column: string | null;
  lookup_table?: LookupTableDTO;
  measure_table?: MeasureRowDTO[];
  metadata?: DimensionMetadataDTO;
}
