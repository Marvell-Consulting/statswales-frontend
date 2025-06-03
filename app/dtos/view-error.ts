export interface ViewError {
  field: PropertyKey;
  message: {
    key: string;
    params?: object;
  };
}
