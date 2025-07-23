import { DataTableAction } from '../enums/data-table-action';
import { DataTableDescriptionDto } from './data-table-description-dto';

export interface DataTableDto {
  id: string;
  revision_id: string;
  mime_type: string;
  filename: string;
  original_filename: string;
  file_type: string;
  hash: string;
  uploaded_at?: string;
  descriptors: DataTableDescriptionDto[];
  action?: DataTableAction;
}
