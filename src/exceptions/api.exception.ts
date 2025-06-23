export class ApiException extends Error {
  constructor(
    public message: string,
    public status: number,
    public body?: string,
    public tag?: string
  ) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.body = body;
    this.tag = tag;
  }
}
