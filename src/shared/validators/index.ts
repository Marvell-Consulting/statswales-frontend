import { Request } from 'express';
import { body, FieldValidationError, param, ValidationChain } from 'express-validator';
import { ResultWithContext } from 'express-validator/lib/chain/context-runner';

import { Designation } from '../../shared/enums/designation';
import { UpdateType } from '../../shared/enums/update-type';

export const hasError = async (validator: ValidationChain, req: Request) => {
  return !(await validator.run(req)).isEmpty();
};

export async function getErrors(
  validators: ValidationChain | ValidationChain[],
  req: Request
): Promise<FieldValidationError[]> {
  if (!Array.isArray(validators)) {
    validators = [validators];
  }

  let errors: FieldValidationError[] = [];

  for (const validator of validators) {
    const result: ResultWithContext = await validator.run(req);
    if (!result.isEmpty()) {
      const fieldErrors = result.array().filter((err) => err.type === 'field');
      errors = errors.concat(fieldErrors);
    }
  }

  return errors;
}

export async function getErrorFields(validators: ValidationChain | ValidationChain[], req: Request): Promise<string[]> {
  const errors = await getErrors(validators, req);
  return errors.map((error) => error.path);
}

export const datasetIdValidator = () => param('datasetId').trim().notEmpty().isUUID(4);
export const uuidValidator = (paramName: string) => param(paramName).trim().notEmpty().isUUID(4);

export const titleValidator = () =>
  body('title')
    .trim()
    .notEmpty()
    .withMessage('missing')
    .bail()
    .isLength({ min: 3 })
    .withMessage('too_short')
    .bail()
    .isLength({ max: 1000 })
    .withMessage('too_long');

export const summaryValidator = () => body('summary').trim().notEmpty();
export const collectionValidator = () => body('collection').trim().notEmpty();

export const qualityValidator = () => body('quality').trim().notEmpty();
export const roundingAppliedValidator = () => body('rounding_applied').notEmpty().bail().isBoolean();
export const roundingDescriptionValidator = () =>
  body('rounding_description').if(body('rounding_applied').equals('true')).trim().notEmpty();

export const linkIdValidator = () => body('link_id').trim().notEmpty();
export const linkUrlValidator = () =>
  body('link_url').trim().notEmpty().bail().isURL({ require_tld: true, require_protocol: true });
export const linkLabelValidator = () => body('link_label').trim().notEmpty();

export const designationValidator = () => body('designation').trim().isIn(Object.values(Designation));

export const providerIdValidator = () => body('provider_id').trim().notEmpty().isUUID(4);

export const topicIdValidator = () => body('topics').isArray({ min: 1 });

export const dayValidator = () => body('day').isInt({ min: 1, max: 31, allow_leading_zeroes: true });
export const monthValidator = () => body('month').isInt({ min: 1, max: 12, allow_leading_zeroes: true });
export const yearValidator = () => body('year').isInt({ min: new Date().getFullYear(), allow_leading_zeroes: true });
export const hourValidator = () => body('hour').isInt({ min: 0, max: 23, allow_leading_zeroes: true });
export const minuteValidator = () => body('minute').isInt({ min: 0, max: 59, allow_leading_zeroes: true });

export const organisationIdValidator = () => body('organisation').trim().notEmpty().isUUID(4);

export const groupIdValidator = (groupIds: string[]) => body('group_id').trim().isIn(groupIds);

export const taskDecisionValidator = () => body('decision').isIn(['approve', 'reject']);

export const taskDecisionReasonValidator = () => body('reason').if(body('decision').equals('reject')).trim().notEmpty();

export const updateTypeValidator = () => body('update_type').isIn(Object.values(UpdateType));

export const updateDayValidator = () =>
  body('day')
    .trim()
    .optional({ values: 'falsy' })
    .if(body('update_type').equals('update'))
    .isInt({ min: 1, max: 31, allow_leading_zeroes: true });

export const updateMonthValidator = () =>
  body('month').if(body('update_type').equals('update')).isInt({ min: 1, max: 12, allow_leading_zeroes: true });

export const updateYearValidator = () =>
  body('year').if(body('update_type').equals('update')).isInt({ min: 1000, max: 9999, allow_leading_zeroes: false });
