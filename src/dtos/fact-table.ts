import { FactTableInfoDTO } from './fact-table-info';

export interface FactTableDTO {
    id: string;
    revision_id: string;
    mime_type: string;
    filename: string;
    original_filename: string;
    file_type: string;
    hash: string;
    uploaded_at: string;
    delimiter?: string;
    quote?: string;
    linebreak?: string;
    fact_table_info: FactTableInfoDTO[];
}
