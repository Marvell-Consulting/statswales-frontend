import 'express-session';
import { ViewError } from '../../dtos/view-error';

declare module 'express-session' {
    interface SessionData {
        errors: ViewError[] | undefined;
    }
}
