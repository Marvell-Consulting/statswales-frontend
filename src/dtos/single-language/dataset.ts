import { RevisionDTO } from '../revision';
import { DatasetInfoDTO } from '../dataset-info';
import { DatasetProviderDTO } from '../dataset-provider';
import { DatasetTopicDTO } from '../dataset-topic';
import { Measure } from '../measure';
import { TeamDTO } from '../team';

import { SingleLanguageDimension } from './dimension';

export interface SingleLanguageDataset {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    measure?: Measure;
    dimensions?: SingleLanguageDimension[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO;
    providers?: DatasetProviderDTO[];
    topics?: DatasetTopicDTO[];
    team?: TeamDTO;
    start_date?: string;
    end_date?: string;
}
