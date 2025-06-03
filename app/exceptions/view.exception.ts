import type { ViewError } from '../dtos/view-error';

import { ApiException } from './api.exception';

export class ViewException extends ApiException {
  constructor(public message: string, public status: number, public errors: ViewError[]) {
    super(message, status);
    this.name = 'ViewException';
    this.errors = errors;
  }
}
