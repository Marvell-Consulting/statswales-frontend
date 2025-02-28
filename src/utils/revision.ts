import { first } from 'lodash';
import { isBefore } from 'date-fns';

import { DatasetDTO } from '../dtos/dataset';
import { RevisionDTO } from '../dtos/revision';
import { DataTableDto } from '../dtos/data-table';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

export const isPublished = (revision: RevisionDTO | SingleLanguageRevision): boolean => {
    return Boolean(revision.approved_at && revision.publish_at && isBefore(revision.publish_at, new Date()));
};

export const createdAtDesc = (revA: RevisionDTO, revB: RevisionDTO) => (revB.created_at < revA.created_at ? -1 : 1);

export const getLatestRevision = (dataset: DatasetDTO): RevisionDTO | undefined => {
    return first(dataset.revisions?.sort(createdAtDesc));
};

export const getDataTable = (revision?: RevisionDTO): DataTableDto | undefined => {
    if (!revision) return undefined;
    return revision.data_table;
};
