import { TaskState } from './task-state';
import { DimensionState } from './dimension-state';

export interface TaskListState {
    datasetTitle: string;
    dimensions: DimensionState[];
    metadata: {
        title: TaskState;
        summary: TaskState;
        data_collection: TaskState;
        statistical_quality: TaskState;
        data_sources: TaskState;
        related_reports: TaskState;
        update_frequency: TaskState;
        designation: TaskState;
        relevant_topics: TaskState;
    };
    publishing: {
        when: TaskState;
        export: TaskState;
        import: TaskState;
        submit: TaskState;
    };
}
