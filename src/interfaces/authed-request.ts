import { Request } from 'express';

export interface AuthedRequest extends Request {
    jwt?: string;
}
