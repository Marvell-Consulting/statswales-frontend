import { TaskStatus } from '../enums/task-status';
import { DimensionStatus } from '../interfaces/dimension-status';

export interface TaskListState {
    datatable: TaskStatus;
    measure?: DimensionStatus;
    dimensions?: DimensionStatus[];

    metadata: {
        title: TaskStatus;
        summary: TaskStatus;
        quality: TaskStatus;
        collection: TaskStatus;
        frequency: TaskStatus;
        designation: TaskStatus;
        related: TaskStatus;
        sources: TaskStatus;
        topics: TaskStatus;
    };

    translation: {
        export: TaskStatus;
        import: TaskStatus;
    };

    publishing: {
        organisation: TaskStatus;
        when: TaskStatus;
    };

    canPublish: boolean;
}
