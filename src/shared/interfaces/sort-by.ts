export interface SortByInterface {
  columnName: string;
  direction?: 'ASC' | 'DESC';
}

export function serializeSortBy(sortBy: SortByInterface): string {
  return `${sortBy.columnName}:${(sortBy.direction || 'asc').toLowerCase()}`;
}

export function parseSortBy(raw: unknown): SortByInterface | undefined {
  if (typeof raw === 'string') {
    const [columnName, direction] = raw.split(':');
    return columnName ? { columnName, direction: (direction?.toUpperCase() || 'ASC') as 'ASC' | 'DESC' } : undefined;
  }
  if (raw && typeof raw === 'object') {
    return raw as SortByInterface;
  }
  return undefined;
}
