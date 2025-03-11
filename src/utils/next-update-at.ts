import { add } from 'date-fns';

import { RevisionDTO } from '../dtos/revision';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

export const nextUpdateAt = (
  revision: RevisionDTO | SingleLanguageRevision | undefined
): Date | boolean | undefined => {
  const update = revision?.update_frequency;

  if (!update) return undefined;

  if (update.is_updated === false) return false;

  if (!revision?.publish_at || !update.frequency_unit || !update.frequency_value) return undefined;

  return add(revision.publish_at, { [`${update.frequency_unit}s`]: update.frequency_value });
};
