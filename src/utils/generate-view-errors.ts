import { ViewErrDTO } from '../dtos/view-dto';
import { ViewError } from '../dtos/view-error';

export function generateViewErrors(datasetID: string | undefined, statusCode: number, errors: ViewError[]): ViewErrDTO {
    return {
        success: false,
        status: statusCode,
        errors,
        dataset_id: datasetID
    } as ViewErrDTO;
}
