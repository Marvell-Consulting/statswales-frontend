import type { FieldValidationError } from 'express-validator';

import type { ViewErrDTO } from '../dtos/view-dto';
import type { ViewError } from '../dtos/view-error';

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
