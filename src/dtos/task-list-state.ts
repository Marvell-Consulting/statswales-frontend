import { TaskStatus } from '../enums/task-status';

import { DimensionState } from './dimension-state';

export interface TaskListState {
    datatable: TaskStatus;

    dimensions: DimensionState[];

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

    publishing: {
        when: TaskStatus;
        export: TaskStatus;
        import: TaskStatus;
        submit: TaskStatus;
    };
}
