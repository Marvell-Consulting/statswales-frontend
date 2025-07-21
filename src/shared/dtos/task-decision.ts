export interface TaskDecisionDTO {
  decision?: 'approve' | 'reject' | undefined;
  reason?: string;
}
