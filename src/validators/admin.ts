import { body } from 'express-validator';

export const nameEnValidator = () =>
  body('name_en')
    .trim()
    .notEmpty()
    .withMessage('missing')
    .bail()
    .isLength({ min: 3 })
    .withMessage('too_short')
    .bail()
    .isLength({ max: 300 })
    .withMessage('too_long');

export const nameCyValidator = () =>
  body('name_cy')
    .trim()
    .notEmpty()
    .withMessage('missing')
    .bail()
    .isLength({ min: 3 })
    .withMessage('too_short')
    .bail()
    .isLength({ max: 300 })
    .withMessage('too_long');

export const organisationIdValidator = () => body('organisation_id').trim().notEmpty().isUUID(4);
