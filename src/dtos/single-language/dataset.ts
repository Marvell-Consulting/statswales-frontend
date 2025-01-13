import { RevisionDTO } from '../revision';
import { DatasetInfoDTO } from '../dataset-info';
import { DatasetProviderDTO } from '../dataset-provider';
import { TopicDTO } from '../topic';
import { MeasureDTO } from '../measure';
import { TeamDTO } from '../team';

import { SingleLanguageDimension } from './dimension';

export interface SingleLanguageDataset {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    measure?: MeasureDTO;
    dimensions?: SingleLanguageDimension[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO;
    providers?: DatasetProviderDTO[];
    topics?: TopicDTO[];
    team?: TeamDTO;
    start_date?: string;
    end_date?: string;
}
