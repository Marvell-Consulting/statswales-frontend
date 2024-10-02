export interface DatasetInfoDTO {
    language?: string;
    title?: string;
    description?: string;
}

export interface DimensionInfoDTO {
    language?: string;
    name: string;
    description?: string;
    notes?: string;
}

export interface SourceDTO {
    id: string;
    import_id: string;
    revision_id: string;
    // Commented out as we don't have lookup tables yet
    // lookup_table_revision_id?: string;
    column_index: number;
    csv_field: string;
    action: string;
    type: string;
}

export interface DimensionDTO {
    id: string;
    type: string;
    start_revision_id: string;
    finish_revision_id?: string;
    validator?: string;
    sources?: SourceDTO[];
    dimensionInfo?: DimensionInfoDTO[];
    dataset_id?: string;
}

export interface FileImportDTO {
    id: string;
    revision_id: string;
    mime_type: string;
    filename: string;
    hash: string;
    uploaded_at: string;
    type: string;
    location: string;
    sources: SourceDTO[];
}

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
    imports: FileImportDTO[];
    dataset_id?: string;
}

export interface DatasetDTO {
    id: string;
    created_at: string;
    created_by: string;
    live?: string;
    archive?: string;
    dimensions?: DimensionDTO[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO[];
}
