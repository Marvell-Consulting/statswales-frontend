import { TaskStatus } from '../enums/task-status';

export interface DimensionState {
    name: string;
    status: TaskStatus;
}
