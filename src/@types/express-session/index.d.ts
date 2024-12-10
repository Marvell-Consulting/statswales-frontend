import 'express-session';
import { ViewErrDTO } from '../../dtos/view-dto';
import { DimensionPatchDto } from '../../dtos/dimension-patch-dto';

declare module 'express-session' {
    interface SessionData {
        errors: ViewErrDTO | undefined;
        dimensionPatch: DimensionPatchDto | undefined;
    }
}
