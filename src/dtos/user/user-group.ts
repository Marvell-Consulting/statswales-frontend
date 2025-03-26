import { DatasetDTO } from '../dataset';
import { OrganisationDTO } from '../organisation';

import { UserDTO } from './user';
import { UserGroupMetadataDTO } from './user-group-metadata-dto';

export interface UserGroupDTO {
  id: string;
  prefix?: string;
  organisation_id?: string;
  organisation?: OrganisationDTO;
  users?: UserDTO[];
  user_count?: number;
  datasets?: DatasetDTO[];
  dataset_count?: number;
  metadata?: UserGroupMetadataDTO[];
  created_at?: string;
  updated_at?: string;
}
