import { DatasetInfoDTO, RevisionDTO } from '../dataset-dto';

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
}
