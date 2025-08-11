import { FilterInterface } from '../interfaces/filterInterface';

export const parseFilters = (filters?: Record<string, string[]>): FilterInterface[] | undefined => {
  if (!filters) return undefined;

  return Object.keys(filters).map((key: string) => ({
    columnName: key,
    values: filters[key].map((value: string) => decodeURIComponent(value))
  }));
};
