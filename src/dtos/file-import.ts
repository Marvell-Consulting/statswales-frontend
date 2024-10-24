import { SourceDTO } from './source';

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
