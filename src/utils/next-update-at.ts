import { add } from 'date-fns';

import { DatasetInfoDTO } from '../dtos/dataset-info';
import { RevisionDTO } from '../dtos/revision';

export const nextUpdateAt = (
    revision: RevisionDTO | undefined,
    metadata: DatasetInfoDTO
): Date | boolean | undefined => {
    const update = metadata.update_frequency;

    if (!update) return undefined;

    if (update.is_updated === false) return false;

    if (!revision?.publish_at || !update.frequency_unit || !update.frequency_value) return undefined;

    return add(revision.publish_at, { [`${update.frequency_unit}s`]: update.frequency_value });
};
