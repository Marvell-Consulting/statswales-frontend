import { DataTableDto } from './data-table';

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
    data_table?: DataTableDto;
    dataset_id?: string;
}
