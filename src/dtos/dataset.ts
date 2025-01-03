import { DimensionDTO } from './dimension';
import { RevisionDTO } from './revision';
import { DatasetInfoDTO } from './dataset-info';
import { DatasetProviderDTO } from './dataset-provider';
import { DatasetTopicDTO } from './dataset-topic';
import { MeasureDTO } from './measure';
import { TeamDTO } from './team';

export interface DatasetDTO {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    measure?: MeasureDTO;
    dimensions?: DimensionDTO[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO[];
    providers?: DatasetProviderDTO[];
    topics?: DatasetTopicDTO[];
    team?: TeamDTO[];
    start_date?: string;
    end_date?: string;
}
