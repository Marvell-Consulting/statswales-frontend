import 'express-session';
import { DimensionPatchDto } from '../../dtos/dimension-patch-dto';
import { ViewError } from '../../dtos/view-error';

declare module 'express-session' {
    interface SessionData {
        errors: ViewError[] | undefined;
        dimensionPatch: DimensionPatchDto | undefined;
    }
}
