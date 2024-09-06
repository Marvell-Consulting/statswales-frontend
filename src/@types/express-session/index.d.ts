import 'express-session';
import { DatasetDTO } from '../../dtos2/dataset-dto';

declare module 'express-session' {
    interface SessionData {
        currentDataset: DatasetDTO;
    }
}
