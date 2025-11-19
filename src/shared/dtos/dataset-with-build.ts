import { DatasetDTO } from './dataset';

export interface DatasetWithBuild {
  dataset: DatasetDTO;
  build_id: string;
}
