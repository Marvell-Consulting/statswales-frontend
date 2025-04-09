import 'express-session';
import { DimensionPatchDTO } from '../../dtos/dimension-patch-dto';
import { ViewError } from '../../dtos/view-error';
import { FlashMessage } from '../../interfaces/flash-message';

declare module 'express-session' {
  interface SessionData {
    errors: ViewError[] | undefined;
    dimensionPatch: DimensionPatchDTO | undefined;
    updateType: string | undefined;
    flash: FlashMessage[] | string[] | undefined;
  }
}
