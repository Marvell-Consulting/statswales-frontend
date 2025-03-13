import { TeamDTO } from '../team';

import { SingleLanguageDimension } from './dimension';
import { SingleLanguageRevision } from './revision';
import { SingleLanguageMeasure } from './measure';

export interface SingleLanguageDataset {
  id: string;
  created_at: string;
  created_by: string;
  live?: string;
  archive?: string;
  measure?: SingleLanguageMeasure;
  dimensions?: SingleLanguageDimension[];
  revisions?: SingleLanguageRevision[];
  start_revision?: SingleLanguageRevision;
  end_revision?: SingleLanguageRevision;
  draft_revision?: SingleLanguageRevision;
  published_revision?: SingleLanguageRevision;
  team?: TeamDTO;
  start_date?: string;
  end_date?: string;
}
