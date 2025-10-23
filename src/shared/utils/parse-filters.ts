import { isObjectLike } from 'lodash';
import { ParsedQs } from 'qs';

import { FilterInterface } from '../interfaces/filterInterface';

export const parseFilters = (filters: ParsedQs): FilterInterface[] | undefined => {
  if (!filters) return undefined;

  return Object.keys(filters).map((columnName: string) => {
    const values = filters[columnName];
    let parsedValues: string[] = [];

    if (!values) return { columnName, values: [] };

    if (Array.isArray(values)) {
      parsedValues = values.map((value) => decodeURIComponent(value as string));
    } else if (isObjectLike(values)) {
      parsedValues = Object.values(values).map((value) => (value ? decodeURIComponent(value.toString()) : ''));
    } else {
      parsedValues = [decodeURIComponent(values as string)];
    }

    return { columnName, values: parsedValues };
  });
};
