import { first } from 'lodash';
import { isBefore } from 'date-fns';

import { DatasetDTO } from '../dtos/dataset';
import { RevisionDTO } from '../dtos/revision';
import { DataTableDto } from '../dtos/data-table';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';

export const isPublished = (revision: RevisionDTO): boolean => {
    return Boolean(revision.approved_at && revision.publish_at && isBefore(revision.publish_at, new Date()));
};

export const createdAtDesc = (revA: RevisionDTO, revB: RevisionDTO) => (revB.created_at < revA.created_at ? -1 : 1);

export const getLatestRevision = (dataset: DatasetDTO | SingleLanguageDataset): RevisionDTO | undefined => {
    if (!dataset) return undefined;
    return first(dataset?.revisions?.sort(createdAtDesc));
};

export const getLatestPublishedRevision = (dataset: DatasetDTO | SingleLanguageDataset): RevisionDTO | undefined => {
    if (!dataset) return undefined;
    return first(dataset.revisions?.filter(isPublished).sort(createdAtDesc));
};

export const getDataTable = (revision?: RevisionDTO): DataTableDto | undefined => {
    if (!revision) return undefined;
    return revision.data_table;
};
