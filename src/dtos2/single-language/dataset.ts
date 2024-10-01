import { DatasetInfoDTO, RevisionDTO } from '../dataset-dto';

import { SingleLanguageDimension } from './dimension';

export interface SingleLanguageDataset {
    id: string;
    creation_date: string;
    created_by: string;
    live?: string;
    archive?: string;
    dimensions?: SingleLanguageDimension[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO;
}
