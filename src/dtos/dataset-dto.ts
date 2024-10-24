import { DatasetInfoDTO } from './dataset-info';
import { DimensionDTO } from './dimension';
import { RevisionDTO } from './revision';

export interface DatasetDTO {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    dimensions?: DimensionDTO[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO[];
}
