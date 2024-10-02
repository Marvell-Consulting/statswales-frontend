import { DimensionInfoDTO, SourceDTO } from '../dataset-dto';

export interface SingleLanguageDimension {
    id: string;
    type: string;
    start_revision_id: string;
    finish_revision_id?: string;
    validator?: string;
    sources?: SourceDTO[];
    dimensionInfo?: DimensionInfoDTO;
    dataset_id?: string;
}
