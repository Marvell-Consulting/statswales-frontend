import { FactTableDto } from './fact-table';

export interface RevisionDTO {
    id: string;
    revision_index: number;
    created_at: string;
    previous_revision_id?: string;
    online_cube_filename?: string;
    publish_at?: string;
    approved_at?: string;
    approved_by?: string;
    created_by: string;
    fact_tables: FactTableDto[];
    dataset_id?: string;
}
