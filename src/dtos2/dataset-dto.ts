export class DatasetInfoDTO {
    language?: string;
    title?: string;
    description?: string;
}

export class DimensionInfoDTO {
    language?: string;
    name: string;
    description?: string;
    notes?: string;
}

export class SourceDTO {
    id: string;
    import_id: string;
    revision_id: string;
    // Commented out as we don't have lookup tables yet
    // lookup_table_revision_id?: string;
    csv_field: string;
    action: string;
}

export class DimensionDTO {
    id: string;
    type: string;
    start_revision_id: string;
    finish_revision_id?: string;
    validator?: string;
    sources?: SourceDTO[];
    dimensionInfo?: DimensionInfoDTO[];
    dataset_id?: string;
}

export class ImportDTO {
    id: string;
    revision_id: string;
    mime_type: string;
    filename: string;
    hash: string;
    uploaded_at: string;
    type: string;
    location: string;
    sources?: SourceDTO[];
}

export class RevisionDTO {
    id: string;
    revision_index: number;
    creation_date: string;
    previous_revision_id?: string;
    online_cube_filename?: string;
    publish_date?: string;
    approval_date?: string;
    approved_by?: string;
    created_by: string;
    imports: ImportDTO[];
    dataset_id?: string;
}

export class DatasetDTO {
    id: string;
    creation_date: string;
    created_by: string;
    live?: string;
    archive?: string;
    dimensions?: DimensionDTO[];
    revisions: RevisionDTO[];
    datasetInfo?: DatasetInfoDTO[];
}
