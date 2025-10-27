import { isObjectLike } from 'lodash';
import { ParsedQs } from 'qs';

import { Filter } from '../interfaces/filter';

export const parseFilters = (filters: ParsedQs | undefined): Filter[] => {
  const parsed: Filter[] = [];
  if (!filters) return parsed;

  const tryDecode = (val: string): string => {
    try {
      return decodeURIComponent(val);
    } catch {
      return val;
    }
  };

  const collectValues = (input: unknown): string[] => {
    if (input == null) return [];

    if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
      return [tryDecode(String(input))];
    }

    if (Array.isArray(input)) {
      return input.flatMap((item) => collectValues(item));
    }

    if (isObjectLike(input)) {
      return Object.values(input as Record<string, unknown>).flatMap((v) => collectValues(v));
    }

    return [];
  };

  Object.keys(filters).forEach((columnName) => {
    const values = collectValues((filters as Record<string, unknown>)[columnName]);
    if (values.length > 0) {
      parsed.push({ columnName, values });
    }
  });

  return parsed;
};
