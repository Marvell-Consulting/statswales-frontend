export interface EventLogDTO {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  data?: Record<string, any>;
  user_id?: string;
  client?: string;
  created_at: Date;
  created_by?: string;
}
