export interface DatasetStats {
  summary: {
    incomplete: number;
    pending_approval: number;
    scheduled: number;
    published: number;
    action_requested: number;
    archived: number;
    offline: number;
    total: number;
  };
  largest: [{ dataset_id: string; title: string; row_count: number; size_bytes?: number }];
  longest: [{ dataset_id: string; title: string; interval: string; status: string }];
}

export interface UserStats {
  active: number;
  published: number;
  total: number;
}

export interface UserGroupStats {
  most_published: [{ name: string; count: number }];
}

export interface DashboardStats {
  datasets?: DatasetStats;
  users?: UserStats;
  groups?: UserGroupStats;
}
