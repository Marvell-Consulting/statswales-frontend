import { sortBy, last } from 'lodash';

import { DatasetDTO, FileImportDTO, RevisionDTO } from '../dtos2/dataset-dto';

export const getLatestRevision = (dataset: DatasetDTO): RevisionDTO | undefined => {
    return last(sortBy(dataset.revisions, 'revision_index'));
};

export const getLatestImport = (revision: RevisionDTO): FileImportDTO | undefined => {
    return last(sortBy(revision.imports, 'uploaded_at'));
};
