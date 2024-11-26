import { Request } from 'express';
import { body, param, ValidationChain } from 'express-validator';

import { Designation } from '../enums/designation';
import { DurationUnit } from '../enums/duration-unit';

export const hasError = async (validator: ValidationChain, req: Request) => {
    return !(await validator.run(req)).isEmpty();
};

export const datasetIdValidator = () => param('datasetId').trim().notEmpty().isUUID(4);
export const revisionIdValidator = () => param('revisionId').trim().notEmpty().isUUID(4);
export const importIdValidator = () => param('importId').trim().notEmpty().isUUID(4);

export const titleValidator = () => body('title').trim().notEmpty();
export const descriptionValidator = () => body('description').trim().notEmpty();
export const collectionValidator = () => body('collection').trim().notEmpty();

export const qualityValidator = () => body('quality').trim().notEmpty();
export const roundingAppliedValidator = () => body('rounding_applied').notEmpty().isBoolean();
export const roundingDescriptionValidator = () =>
    body('rounding_description').if(body('rounding_applied').equals('true')).trim().notEmpty();

export const isUpdatedValidator = () => body('is_updated').notEmpty().isBoolean().toBoolean();
export const frequencyValueValidator = () =>
    body('frequency_value').if(body('is_updated').equals('true')).notEmpty().isInt().toInt(10);
export const frequencyUnitValidator = () =>
    body('frequency_unit').if(body('is_updated').equals('true')).isIn(Object.values(DurationUnit));

export const linkIdValidator = () => body('link_id').trim().notEmpty();
export const linkUrlValidator = () =>
    body('link_url').trim().notEmpty().isURL({ require_tld: true, require_protocol: true });
export const linkLabelValidator = () => body('link_label').trim().notEmpty();

export const designationValidator = () => body('designation').trim().isIn(Object.values(Designation));

export const providerIdValidator = () => body('provider_id').trim().notEmpty().isUUID(4);

export const topicIdValidator = () => body('topics').isArray({ min: 1 });
