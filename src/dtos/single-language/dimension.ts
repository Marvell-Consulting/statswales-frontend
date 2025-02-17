import { DimensionMetadataDTO } from '../dimension-metadata';
import { LookupTableDTO } from '../lookup-table';

export interface SingleLanguageDimension {
    id: string;
    dataset_id: string;
    type: string;
    extractor?: object;
    joinColumn?: string; // <-- Tells you have to join the dimension to the fact_table
    factTableColumn: string; // <-- Tells you which column in the fact table you're joining to
    isSliceDimension: boolean;
    lookupTable?: LookupTableDTO;
    metadata?: DimensionMetadataDTO;
}
