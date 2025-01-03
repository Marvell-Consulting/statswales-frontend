import { LookupTableDTO } from './lookup-table';
import { MeasureInfoDTO } from './measure-info';

export class MeasureDTO {
    id: string;
    dataset_id: string;
    fact_table_column: string;
    join_column: string | null;
    lookup_table?: LookupTableDTO;
    measure_info: MeasureInfoDTO[] | undefined;
}
