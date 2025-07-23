export interface FileImportDto {
  filename: string;
  mime_type: string;
  file_type: string;
  type: string;
  hash: string;
  uploaded_at?: string;
  parent_id?: string;
  link?: string;
}
