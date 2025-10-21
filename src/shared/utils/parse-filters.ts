import { isObjectLike } from 'lodash';
import { FilterInterface } from '../interfaces/filterInterface';

export const parseFilters = (filters?: Record<string, string[]>): FilterInterface[] | undefined => {
  if (!filters) return undefined;

  return Object.keys(filters).map((columnName: string) => {
    let values = filters[columnName];

    if (Array.isArray(values)) {
      values = values.map((value: string) => decodeURIComponent(value));
    } else if (isObjectLike(values)) {
      values = Object.values(values).map((value) => decodeURIComponent(value as string));
    } else {
      values = [decodeURIComponent(values as string)];
    }

    return { columnName, values };
  });
};
