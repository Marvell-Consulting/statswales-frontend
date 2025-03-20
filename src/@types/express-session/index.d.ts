import 'express-session';
import { DimensionPatchDTO } from '../../dtos/dimension-patch-dto';
import { ViewError } from '../../dtos/view-error';

declare module 'express-session' {
  interface SessionData {
    errors: ViewError[] | undefined;
    dimensionPatch: DimensionPatchDTO | undefined;
    updateType: string | undefined;
    flash: string[] | undefined;
  }
}
