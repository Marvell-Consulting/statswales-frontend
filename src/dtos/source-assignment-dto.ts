import { SourceType } from '../enums/source-type';

export interface SourceAssignmentDTO {
    columnIndex: number;
    columnName: string;
    sourceType: SourceType;
}
