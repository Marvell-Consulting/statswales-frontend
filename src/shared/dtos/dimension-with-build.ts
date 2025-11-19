import { DimensionDTO } from './dimension';

export interface DimensionWithBuild {
  dimension: DimensionDTO;
  build_id: string;
}
