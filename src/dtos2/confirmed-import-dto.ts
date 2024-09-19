import { ViewError } from './view-error';
import { ImportDTO } from './dataset-dto';

export interface ConfirmedImportDTO {
    success: boolean;
    fileImport: ImportDTO;
}

export interface UploadErrDTO {
    success: boolean;
    fileImport: ImportDTO | undefined;
    errors: ViewError[];
}
