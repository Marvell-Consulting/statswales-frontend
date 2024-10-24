import 'express-session';
import { DatasetDTO, FileImportDTO, RevisionDTO } from '../../dtos/dataset-dto';
import { ViewErrDTO } from '../../dtos/view-dto';
import { SourceAssignmentDTO } from '../../dtos/source-assignment-dto';

declare module 'express-session' {
    interface SessionData {
        currentDataset: DatasetDTO | undefined;
        currentRevision: RevisionDTO | undefined;
        currentImport: FileImportDTO | undefined;
        errors: ViewErrDTO | undefined;
        dimensionCreationRequest: SourceAssignmentDTO[];
        currentTitle: string | undefined;
    }
}
