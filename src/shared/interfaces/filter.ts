export interface Filter {
  columnName: string;
  values: string[];
}

export interface FilterV2 {
  [columnName: string]: string[];
}
