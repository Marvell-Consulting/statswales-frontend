import { DimensionInfoDTO } from './dimension-info';
import { SourceDTO } from './source';

export interface DimensionDTO {
    id: string;
    type: string;
    start_revision_id: string;
    finish_revision_id?: string;
    validator?: string;
    sources?: SourceDTO[];
    dimensionInfo?: DimensionInfoDTO[];
    dataset_id?: string;
}
