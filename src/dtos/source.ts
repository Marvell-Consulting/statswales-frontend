export interface SourceDTO {
    id: string;
    import_id: string;
    revision_id: string;
    dimension_id?: string;
    // Commented out as we don't have lookup tables yet
    // lookup_table_revision_id?: string;
    column_index: number;
    csv_field: string;
    action: string;
    type: string;
}
