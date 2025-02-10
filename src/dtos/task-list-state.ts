import { TaskStatus } from '../enums/task-status';
import { DimensionStatus } from '../interfaces/dimension-status';

export interface TaskListState {
    datatable: TaskStatus;
    measure?: DimensionStatus;
    dimensions?: DimensionStatus[];

    metadata: {
        title: TaskStatus;
        summary: TaskStatus;
        statistical_quality: TaskStatus;
        data_sources: TaskStatus;
        related_reports: TaskStatus;
        update_frequency: TaskStatus;
        designation: TaskStatus;
        data_collection: TaskStatus;
        relevant_topics: TaskStatus;
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
