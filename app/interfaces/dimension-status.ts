import type { TaskListStatus } from '~/enums/task-list-status';

export interface DimensionStatus {
  id: string;
  name: string;
  status: TaskListStatus;
  type: string;
}
