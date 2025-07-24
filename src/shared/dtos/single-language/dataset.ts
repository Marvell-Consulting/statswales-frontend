import { SingleLanguageDimension } from './dimension';
import { SingleLanguageRevision } from './revision';
import { SingleLanguageMeasure } from './measure';
import { PublisherDTO } from '../publisher-dto';

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
  start_date?: string;
  end_date?: string;
  publisher?: PublisherDTO;
}
