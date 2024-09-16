import { Error } from './error';
import { DatasetDTO } from './dataset-dto';

export interface UploadDTO {
    success: boolean;
    dataset: DatasetDTO;
}

export interface UploadErrDTO {
    success: boolean;
    dataset: DatasetDTO | undefined;
    errors: Error[];
}
