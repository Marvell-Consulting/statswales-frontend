import { sortBy, last } from 'lodash';

import { DatasetDTO } from '../dtos/dataset';
import { RevisionDTO } from '../dtos/revision';
import { DataTableDto } from '../dtos/data-table-dto';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';

export const getLatestRevision = (dataset: DatasetDTO | SingleLanguageDataset): RevisionDTO | undefined => {
    if (!dataset) return undefined;
    return last(sortBy(dataset?.revisions, 'created_at'));
};

export const getDataTable = (revision: RevisionDTO): DataTableDto | undefined => {
    if (!revision) return undefined;
    return revision.data_table;
};
