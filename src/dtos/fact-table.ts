import { FactTableInfoDto } from './fact-table-info';

export interface FactTableDto {
    id: string;
    revision_id?: string;
    mime_type: string;
    filename: string;
    filetype: string;
    hash: string;
    uploaded_at: string;
    info: FactTableInfoDto[];
}
