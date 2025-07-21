import { SourceType } from '../enums/source-type';

export interface SourceAssignmentDTO {
  column_index: number;
  column_name: string;
  column_type: SourceType;
}
