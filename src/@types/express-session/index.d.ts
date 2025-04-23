import 'express-session';
import { DimensionPatchDTO } from '../../dtos/dimension-patch-dto';
import { ViewError } from '../../dtos/view-error';
import { FlashMessage } from '../../interfaces/flash-message';

interface DatasetProps {
  dimensionPatch: DimensionPatchDTO | undefined;
  updateType: string | undefined;
}

declare module 'express-session' {
  interface SessionData {
    flash: FlashMessage[] | string[] | undefined;
    errors: ViewError[] | undefined;
    dataset: {
      [id: string]: DatasetProps;
    };
  }
}
