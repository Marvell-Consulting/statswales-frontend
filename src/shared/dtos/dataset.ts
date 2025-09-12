import { DimensionDTO } from './dimension';
import { RevisionDTO } from './revision';
import { MeasureDTO } from './measure';
import { FactTableColumnDto } from './fact-table-column-dto';
import { TaskDTO } from './task';
import { PublisherDTO } from './publisher-dto';

export interface DatasetDTO {
  id: string;
  created_at: string;
  created_by: string;
  first_published_at?: string;
  unpublished_at?: string;
  archived_at?: string;
  fact_table?: FactTableColumnDto[];
  measure?: MeasureDTO;
  dimensions?: DimensionDTO[];
  revisions: RevisionDTO[];
  start_revision?: RevisionDTO;
  start_revision_id?: string;
  end_revision?: RevisionDTO;
  end_revision_id?: string;
  draft_revision?: RevisionDTO;
  draft_revision_id?: string;
  published_revision?: RevisionDTO;
  start_date?: string;
  end_date?: string;
  user_group_id?: string;
  tasks?: TaskDTO[];
  publisher?: PublisherDTO;
}
