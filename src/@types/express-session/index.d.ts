import 'express-session';
import { DatasetDTO, ImportDTO, RevisionDTO } from '../../dtos2/dataset-dto';

declare module 'express-session' {
    interface SessionData {
        title: string;
        currentDataset: DatasetDTO;
        currentRevision: RevisionDTO;
        currentImport: ImportDTO;
    }
}
