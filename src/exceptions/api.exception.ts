export class ApiException extends Error {
  constructor(
    public message: string,
    public status?: number,
    public body?: string | FormData
  ) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.body = body;
  }
}
