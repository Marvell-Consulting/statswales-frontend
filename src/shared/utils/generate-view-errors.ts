import { FieldValidationError } from 'express-validator';

import { ViewErrDTO } from '../dtos/view-dto';
import { ViewError } from '../dtos/view-error';

export function generateViewErrors(dataset_id: string | undefined, status: number, errors: ViewError[]): ViewErrDTO {
  return { dataset_id, status, errors };
}

export function generatePageErrors(errors: FieldValidationError[], i18nPrefix: string): ViewError[] {
  return errors.map((error: FieldValidationError) => {
    return {
      field: error.path,
      message: {
        key: `${i18nPrefix}.form.${error.path}.error`
      }
    };
  });
}
