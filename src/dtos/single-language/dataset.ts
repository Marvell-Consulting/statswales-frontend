import { RevisionDTO } from '../revision';
import { DatasetInfoDTO } from '../dataset-info';
import { DatasetProviderDTO } from '../dataset-provider';

import { SingleLanguageDimension } from './dimension';

export interface SingleLanguageDataset {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    dimensions?: SingleLanguageDimension[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO;
    providers?: DatasetProviderDTO[];
}
