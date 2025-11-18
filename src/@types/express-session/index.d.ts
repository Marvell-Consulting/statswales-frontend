import 'express-session';
import { DimensionPatchDTO } from '../../shared/dtos/dimension-patch-dto';
import { ViewError } from '../../shared/dtos/view-error';
import { FlashMessage } from '../../shared/interfaces/flash-message';
import { RequestHistory } from '../../shared/interfaces/request-history';

interface DatasetProps {
  dimensionPatch: DimensionPatchDTO | undefined;
  updateType: string | undefined;
  buildNextAction: string | undefined;
  buildPreviousAction: string | undefined;
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
