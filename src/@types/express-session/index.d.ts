import 'express-session';
import { DimensionPatchDTO } from '../../dtos/dimension-patch-dto';
import { ViewError } from '../../dtos/view-error';
import { FlashMessage } from '../../interfaces/flash-message';
import { RequestHistory } from '../../interfaces/request-history';

interface DatasetProps {
  dimensionPatch: DimensionPatchDTO | undefined;
  updateType: string | undefined;
}

declare module 'express-session' {
  interface SessionData {
    flash: FlashMessage[] | string[] | undefined;
    errors: ViewError[] | undefined;
    history?: RequestHistory[];
    dataset: {
      [id: string]: DatasetProps;
    };
  }
}
