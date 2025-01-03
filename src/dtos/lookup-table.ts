export class LookupTableDTO {
    id: string;
    dimension_id?: string;
    measure_id?: string;
    mime_type: string;
    filename: string;
    file_type: string;
    hash: string;
    uploaded_at?: string;
    delimiter: string;
    quote: string;
    linebreak: string;
}
