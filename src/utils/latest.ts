import { sortBy, last } from 'lodash';
import { isBefore } from 'date-fns';

import { DatasetDTO } from '../dtos/dataset';
import { RevisionDTO } from '../dtos/revision';
import { DataTableDto } from '../dtos/data-table';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';

export const getLatestRevision = (dataset: DatasetDTO | SingleLanguageDataset): RevisionDTO | undefined => {
    if (!dataset) return undefined;
    return last(sortBy(dataset?.revisions, 'created_at'));
};

export const getLatestPublishedRevision = (dataset: DatasetDTO | SingleLanguageDataset): RevisionDTO | undefined => {
    if (!dataset) return undefined;

    const now = new Date();

    const publishedRevisions = dataset.revisions.filter(
        (rev: RevisionDTO) => rev.publish_at && rev.approved_at && isBefore(rev.publish_at, now)
    );

    return last(sortBy(publishedRevisions, 'revision_index'));
};

export const getDataTable = (revision: RevisionDTO): DataTableDto | undefined => {
    if (!revision) return undefined;
    return revision.data_table;
};
