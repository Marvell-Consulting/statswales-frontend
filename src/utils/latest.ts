import { sortBy, last } from 'lodash';

import { DatasetDTO } from '../dtos/dataset';
import { RevisionDTO } from '../dtos/revision';
import { FactTableDTO } from '../dtos/fact-table';

export const getLatestRevision = (dataset: DatasetDTO): RevisionDTO | undefined => {
    if (!dataset) return undefined;
    return last(sortBy(dataset?.revisions, 'revision_index'));
};

export const getLatestFactTable = (revision: RevisionDTO): FactTableDTO | undefined => {
    if (!revision) return undefined;
    return last(sortBy(revision?.fact_tables, 'uploaded_at'));
};
