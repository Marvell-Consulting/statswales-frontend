import { DatasetDTO } from '../dataset';
import { OrganisationDTO } from '../organisation';
import { UserDto } from './user';

export class UserGroupDTO {
  id?: string;
  prefix?: string;
  name?: string;
  name_en?: string;
  name_cy?: string;
  email?: string;
  organisation_id?: string;
  organisation?: OrganisationDTO;
  users?: UserDto[];
  user_count?: number;
  datasets?: DatasetDTO[];
  dataset_count?: number;
}
