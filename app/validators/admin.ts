import { z } from 'zod/v4';

// param
export const userGroupIdValidator = z.object({
  userGroupId: z.uuidv4().trim().nonempty()
});

// param
export const userIdValidator = z.object({
  userId: z.uuidv4().trim().nonempty()
});

export const nameEnValidator = z.object({
  name_en: z.string().trim().nonempty('missing').min(3, 'too_short').max(300, 'too_long')
});

export const nameCyValidator = z.object({
  name_cy: z.string().trim().nonempty('missing').min(3, 'too_short').max(300, 'too_long')
});

export const organisationIdValidator = z.object({
  organisation_id: z.uuidv4().trim().nonempty()
});

export const emailEnValidator = z.object({
  email_en: z.email('invalid').trim().nonempty('missing')
});

export const emailCyValidator = z.object({
  email_cy: z.email('invalid').trim().nonempty('missing')
});

export const emailValidator = z.object({
  email: z.email('invalid').trim().nonempty('missing')
});
