import { DimensionDTO } from './dimension';
import { RevisionDTO } from './revision';
import { DatasetInfoDTO } from './dataset-info';
import { DatasetProviderDTO } from './dataset-provider';
import { DatasetTopicDTO } from './dataset-topic';

export interface DatasetDTO {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    dimensions?: DimensionDTO[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO[];
    providers?: DatasetProviderDTO[];
    topics?: DatasetTopicDTO[];
    team_id?: string;
}
