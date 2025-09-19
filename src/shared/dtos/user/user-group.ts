import { DatasetDTO } from '../dataset';
import { OrganisationDTO } from '../organisation';

import { UserGroupMetadataDTO } from './user-group-metadata-dto';
import { UserWithRolesDTO } from './user-with-roles-dto';

export interface UserGroupDTO {
  id: string;
  prefix?: string;
  organisation_id?: string;
  organisation?: OrganisationDTO;
  users?: UserWithRolesDTO[];
  user_count?: number;
  datasets?: DatasetDTO[];
  dataset_count?: number;
  metadata?: UserGroupMetadataDTO[];
  created_at?: string;
  updated_at?: string;
  status?: string;
}
