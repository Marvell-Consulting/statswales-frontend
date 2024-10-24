import { sortBy, last } from 'lodash';

import { DatasetDTO } from '../dtos/dataset-dto';
import { FileImportDTO } from '../dtos/file-import';
import { RevisionDTO } from '../dtos/revision';

export const getLatestRevision = (dataset: DatasetDTO): RevisionDTO | undefined => {
    if (!dataset) return undefined;
    return last(sortBy(dataset?.revisions, 'revision_index'));
};

export const getLatestImport = (revision: RevisionDTO): FileImportDTO | undefined => {
    if (!revision) return undefined;
    return last(sortBy(revision?.imports, 'uploaded_at'));
};
