import { UpdateType } from '../enums/update-type';

export interface UpdateDateDTO {
  day?: string;
  month: string;
  year: string;
}

export interface UpdateFrequencyDTO {
  update_type: UpdateType;
  date?: UpdateDateDTO;
}
