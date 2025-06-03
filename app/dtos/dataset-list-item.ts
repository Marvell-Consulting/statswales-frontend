import type { DatasetStatus } from '~/enums/dataset-status';
import type { PublishingStatus } from '~/enums/publishing-status';

export interface DatasetListItemDTO {
  id: string;
  title: string;
  group_name?: string;
  code?: string;
  revision_by?: string;
  last_updated?: string;
  status?: DatasetStatus;
  publishing_status?: PublishingStatus;
  published_date?: string;
}
