export class TaskDTO {
  id: string;
  action: string;
  status: string;
  open: boolean;
  entity?: string;
  entity_id?: string;
  comment?: string;
  created_at: string;
  updated_at: string;
  submitted_by_id?: string;
  submitted_by_name?: string;
  response_by_id?: string;
  response_by_name?: string;
}
