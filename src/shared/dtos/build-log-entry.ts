import { CubeBuildStatus } from '../enums/cube-build-status';

export class BuildLogEntry {
  id: string;
  status: CubeBuildStatus;
  type: string;
  revision_id?: string;
  userId?: string;
  startedAt: Date;
  completedAt?: Date;
  performanceStart: number;
  performanceFinish?: number;
  duration_ms?: number;
  buildScript?: string;
  errors?: string;
}
