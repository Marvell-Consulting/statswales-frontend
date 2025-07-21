export interface ViewError {
  field: string;
  message: {
    key: string;
    params?: object;
  };
}
