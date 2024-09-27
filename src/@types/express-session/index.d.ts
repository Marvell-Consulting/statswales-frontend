import 'express-session';
import { DatasetDTO, FileImportDTO, RevisionDTO } from '../../dtos2/dataset-dto';
import { ViewErrDTO } from '../../dtos2/view-dto';
import { DimensionCreationDTO } from '../../dtos2/dimension-creation-dto';

declare module 'express-session' {
    interface SessionData {
        currentDataset: DatasetDTO | undefined;
        currentRevision: RevisionDTO | undefined;
        currentImport: FileImportDTO | undefined;
        errors: ViewErrDTO | undefined;
        dimensionCreationRequest: DimensionCreationDTO[];
        currentTitle: string | undefined;
    }
}
