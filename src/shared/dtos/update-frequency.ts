import { NextUpdateType } from '../enums/next-update-type';

export interface UpdateDateDTO {
  day?: string;
  month: string;
  year: string;
}

export interface UpdateFrequencyDTO {
  update_type: NextUpdateType;
  date?: UpdateDateDTO;
}
