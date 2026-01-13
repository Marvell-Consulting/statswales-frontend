import { SingleLanguageDimension } from './dimension';
import { SingleLanguageRevision } from './revision';
import { SingleLanguageMeasure } from './measure';
import { PublisherDTO } from '../publisher-dto';
import { TaskDTO } from '../task';

export interface SingleLanguageDataset {
  id: string;
  created_at: string;
  created_by: string;
  first_published_at?: string;
  unpublished_at?: string;
  archived_at?: string;
  measure?: SingleLanguageMeasure;
  dimensions?: SingleLanguageDimension[];
  revisions?: SingleLanguageRevision[];
  start_revision_id?: string;
  start_revision?: SingleLanguageRevision;
  end_revision_id?: string;
  end_revision?: SingleLanguageRevision;
  draft_revision_id?: string;
  draft_revision?: SingleLanguageRevision;
  published_revision?: SingleLanguageRevision;
  start_date?: string;
  end_date?: string;
  publisher?: PublisherDTO;
  tasks?: TaskDTO[];
}
