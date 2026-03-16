import { DimensionDTO } from './dimension';
import { RevisionDTO } from './revision';
import { PublisherDTO } from './publisher-dto';

export interface ConsumerDatasetDTO {
  id: string;
  first_published_at?: string;
  archived_at?: string;
  replaced_by?: { dataset_id: string; dataset_title?: string; auto_redirect: boolean };
  dimensions?: DimensionDTO[];
  revisions: RevisionDTO[];
  published_revision?: RevisionDTO;
  start_date?: string;
  end_date?: string;
  publisher?: PublisherDTO;
}
