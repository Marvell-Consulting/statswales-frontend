import { DimensionDTO } from './dimension';
import { RevisionDTO } from './revision';
import { DatasetInfoDTO } from './dataset-info';
import { DatasetProviderDTO } from './dataset-provider';
import { TopicDTO } from './topic';
import { MeasureDTO } from './measure';
import { TeamDTO } from './team';
import { FactTableColumnDto } from './fact-table';

export interface DatasetDTO {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    fact_table: FactTableColumnDto[];
    measure?: MeasureDTO;
    dimensions?: DimensionDTO[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO[];
    providers?: DatasetProviderDTO[];
    topics?: TopicDTO[];
    team?: TeamDTO[];
    start_date?: string;
    end_date?: string;
}
