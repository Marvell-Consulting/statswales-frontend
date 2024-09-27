import { ViewError } from './view-error';
import { FileImportDTO } from './dataset-dto';

export interface ConfirmedImportDTO {
    success: boolean;
    fileImport: FileImportDTO;
}

export interface UploadErrDTO {
    success: boolean;
    fileImport: FileImportDTO | undefined;
    errors: ViewError[];
}
