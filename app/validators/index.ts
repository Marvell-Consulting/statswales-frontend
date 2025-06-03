import { Designation } from '../enums/designation';
import { DurationUnit } from '../enums/duration-unit';
import { z } from 'zod/v4';

// TODO: reimplement this with zod

// export const hasError = async (validator: ValidationChain, req: Request) => {
//   return !(await validator.run(req)).isEmpty();
// };

// export async function getErrors(
//   validators: ValidationChain | ValidationChain[],
//   req: Request
// ): Promise<FieldValidationError[]> {
//   if (!Array.isArray(validators)) {
//     validators = [validators];
//   }

//   let errors: FieldValidationError[] = [];

//   for (const validator of validators) {
//     const result: ResultWithContext = await validator.run(req);
//     if (!result.isEmpty()) {
//       const fieldErrors = result.array().filter((err) => err.type === 'field');
//       errors = errors.concat(fieldErrors);
//     }
//   }

//   return errors;
// }

// export async function getErrorFields(
//   validators: ValidationChain | ValidationChain[],
//   req: Request
// ): Promise<string[]> {
//   const errors = await getErrors(validators, req);
//   return errors.map((error) => error.path);
// }

export const datasetIdValidator = z.object({
  datasetId: z.uuidv4().trim().nonempty()
});

export const getUuidValidator = (paramName: string) =>
  z.object({
    [paramName]: z.uuidv4().trim().nonempty()
  });

export const titleValidator = z.object({
  title: z.string().trim().nonempty('missing').min(3, 'too_short').max(1_000, 'too_long')
});

export const summaryValidator = z.object({
  summary: z.string().trim().nonempty()
});

export const collectionValidator = z.object({
  collection: z.string().trim().nonempty()
});

export const qualityValidator = z
  .object({
    quality: z.string().trim().nonempty(),
    rounding_applied: z.boolean().nonoptional(),
    rounding_description: z.string().trim().optional()
  })
  .refine((input) => {
    if (input.rounding_applied === true && !input.rounding_description) {
      return false;
    }
    return true;
  });

export const isUpdatedValidator = z
  .object({
    is_updated: z.coerce.boolean().nonoptional(),
    frequency_value: z.coerce.number().int().optional(),
    frequency_unit: z.enum(Object.values(DurationUnit)).optional()
  })
  .refine((input) => {
    if (input.is_updated) {
      return input.frequency_value && input.frequency_unit;
    }
  });

export const linkValidator = z.object({
  link_id: z.string().trim().nonempty(),
  link_url: z.url({ protocol: /^https?$/, hostname: z.regexes.domain }).trim(),
  link_label: z.string().trim().nonempty()
});

export const designationValidator = z.object({
  designation: z.enum(Object.values(Designation))
});

export const providerIdValidator = z.object({
  provider_id: z.uuidv4().trim().nonempty()
});

export const topicIdValidator = z.object({
  topics: z.array(z.string()).min(1)
});

export const dateValidator = z.object({
  day: z.coerce.number().int().min(1).max(31),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(new Date().getFullYear()),
  hour: z.coerce.number().int().min(0).max(23),
  minute: z.coerce.number().int().min(0).max(59)
});

export const organisationIdValidator = z.object({
  organisation: z.uuidv4().trim().nonempty()
});

export const getGroupIdValidator = (groupIds: string[]) =>
  z.object({
    group_id: z.enum(groupIds).nonoptional()
  });

export const taskDecisionValidator = z
  .object({
    decision: z.enum(['approve', 'reject']),
    reason: z.string().trim().optional()
  })
  .refine((input) => {
    if (input.decision === 'reject' && !input.decision) {
      return false;
    }
    return true;
  });
