import { DimensionDTO } from './dimension';
import { RevisionDTO } from './revision';
import { MeasureDTO } from './measure';
import { TeamDTO } from './team';
import { FactTableColumnDto } from './fact-table-column-dto';

export interface DatasetDTO {
  id: string;
  created_at: string;
  created_by: string;
  live?: string;
  archive?: string;
  fact_table: FactTableColumnDto[];
  measure?: MeasureDTO;
  dimensions?: DimensionDTO[];
  revisions: RevisionDTO[];
  start_revision?: RevisionDTO;
  end_revision?: RevisionDTO;
  draft_revision?: RevisionDTO;
  published_revision?: RevisionDTO;
  team_id?: string;
  team?: TeamDTO[];
  start_date?: string;
  end_date?: string;
}
