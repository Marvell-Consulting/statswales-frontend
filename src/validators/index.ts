import { Request } from 'express';
import { body, param, ValidationChain } from 'express-validator';

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
export const roundingAppliedValidator = () => body('rounding_applied').notEmpty().isBoolean({ loose: true });
export const roundingDescriptionValidator = () =>
    body('rounding_description').if(body('rounding_applied').equals('true')).trim().notEmpty();
