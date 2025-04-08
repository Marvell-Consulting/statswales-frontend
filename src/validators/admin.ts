import { body, param } from 'express-validator';

export const userGroupIdValidator = () => param('userGroupId').trim().notEmpty().isUUID(4);
export const userIdValidator = () => param('userId').trim().notEmpty().isUUID(4);

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

export const emailEnValidator = () =>
  body('email_en').trim().notEmpty().withMessage('missing').bail().isEmail().withMessage('invalid');

export const emailCyValidator = () =>
  body('email_cy').trim().notEmpty().withMessage('missing').bail().isEmail().withMessage('invalid');

export const emailValidator = () =>
  body('email').trim().notEmpty().withMessage('missing').bail().isEmail().withMessage('invalid');

export const actionValidator = (actions: string[]) => body('action').trim().isIn(actions);
