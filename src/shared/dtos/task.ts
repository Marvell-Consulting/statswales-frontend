import { TaskAction } from '../enums/task-action';
import { TaskStatus } from '../enums/task-status';

interface TaskMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class TaskDTO {
  id: string;
  action: TaskAction;
  status: TaskStatus;
  open: boolean;
  dataset_id?: string;
  comment?: string;
  metadata?: TaskMetadata;
  created_at: string;
  updated_at: string;
  created_by_id?: string;
  created_by_name?: string;
  updated_by_id?: string;
  updated_by_name?: string;
  isUpdate?: boolean;
}
