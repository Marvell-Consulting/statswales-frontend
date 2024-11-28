import 'express-session';
import { DatasetDTO, RevisionDTO } from '../../dtos/dataset';
import { ViewErrDTO } from '../../dtos/view-dto';
import { SourceAssignmentDTO } from '../../dtos/source-assignment-dto';
import { FactTableDto } from '../../dtos/fact-table';

declare module 'express-session' {
    interface SessionData {
        currentDataset: DatasetDTO | undefined;
        currentRevision: RevisionDTO | undefined;
        currentImport: FactTableDto | undefined;
        errors: ViewErrDTO | undefined;
        dimensionCreationRequest: SourceAssignmentDTO[];
        currentTitle: string | undefined;
    }
}
