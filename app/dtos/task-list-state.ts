import { TaskListStatus } from '../enums/task-list-status';
import type { DimensionStatus } from '../interfaces/dimension-status';

export interface TaskListState {
  datatable: TaskListStatus;
  measure?: DimensionStatus;
  dimensions?: DimensionStatus[];

  metadata: {
    title: TaskListStatus;
    summary: TaskListStatus;
    quality: TaskListStatus;
    collection: TaskListStatus;
    frequency: TaskListStatus;
    designation: TaskListStatus;
    related: TaskListStatus;
    sources: TaskListStatus;
    topics: TaskListStatus;
  };

  translation: {
    export: TaskListStatus;
    import: TaskListStatus;
  };

  publishing: {
    organisation: TaskListStatus;
    when: TaskListStatus;
  };

  canPublish: boolean;
  isUpdate: boolean;
}
