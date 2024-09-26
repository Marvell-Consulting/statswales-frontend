import { sortBy, last } from 'lodash';

import { DatasetDTO, ImportDTO, RevisionDTO } from '../dtos2/dataset-dto';

export const getLatestRevision = (dataset: DatasetDTO): RevisionDTO | undefined => {
    return last(sortBy(dataset.revisions, 'revision_index'));
};

export const getLatestImport = (revision: RevisionDTO): ImportDTO | undefined => {
    return last(sortBy(revision.imports, 'uploaded_at'));
};
