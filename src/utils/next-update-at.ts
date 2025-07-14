import { RevisionDTO } from '../dtos/revision';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

export const nextUpdateAt = (revision: RevisionDTO | SingleLanguageRevision | undefined): string => {
  return '';
};
