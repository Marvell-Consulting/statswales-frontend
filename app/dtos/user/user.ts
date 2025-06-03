import type { GlobalRole } from '~/enums/global-role';
import type { UserGroupWithRolesDTO } from './user-group-with-roles-dto';
import type { UserStatus } from '~/enums/user-status';

export interface UserDTO {
  id: string;
  provider: string;
  provider_user_id?: string;
  email: string;
  given_name?: string;
  family_name?: string;
  full_name?: string;
  global_roles: GlobalRole[];
  groups: UserGroupWithRolesDTO[];
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}
