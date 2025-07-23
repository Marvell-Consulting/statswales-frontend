interface TaskMetadata {
  [key: string]: any;
}

export class TaskDTO {
  id: string;
  action: string;
  status: string;
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
}
