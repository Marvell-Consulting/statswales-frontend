import { add } from 'date-fns';

import { DatasetInfoDTO } from '../dtos/dataset-info';
import { RevisionDTO } from '../dtos/revision';

export const nextUpdateAt = (revision: RevisionDTO | undefined, metadata: DatasetInfoDTO): Date | undefined => {
    if (!revision?.publish_at) return undefined;

    const update = metadata.update_frequency;
    if (!update || !update.is_updated || !update.frequency_unit || !update.frequency_value) return undefined;

    return add(revision.publish_at, { [`${update.frequency_unit}s`]: update.frequency_value });
};
