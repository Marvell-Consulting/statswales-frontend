import { LookupTable } from './lookup-table';
import { MeasureInfo } from './measure-info';

export class Measure {
    id: string;
    dataset_id: string;
    fact_table_column: string;
    join_column: string | null;
    lookup_table?: LookupTable;
    measure_info: MeasureInfo[] | undefined;
}
