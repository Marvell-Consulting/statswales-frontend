import { isBefore } from 'date-fns';

import { RevisionDTO } from '../dtos/revision';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

export const isPublished = (revision: RevisionDTO | SingleLanguageRevision): boolean => {
  return Boolean(revision.approved_at && revision.publish_at && isBefore(revision.publish_at, new Date()));
};
