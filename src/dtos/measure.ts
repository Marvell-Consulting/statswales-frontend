import { LookupTableDTO } from './lookup-table';
import { MeasureRowDTO } from './measure-row';
import { DimensionMetadataDTO } from './dimension-metadata';

export class MeasureDTO {
  id: string;
  dataset_id: string;
  fact_table_column: string;
  join_column: string | null;
  lookup_table?: LookupTableDTO;
  measure_table?: MeasureRowDTO[];
  metadata: DimensionMetadataDTO[];
}
