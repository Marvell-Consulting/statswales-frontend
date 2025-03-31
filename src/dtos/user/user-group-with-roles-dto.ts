import { UserRole } from '../../enums/user-role';
import { UserGroupDTO } from './user-group';

export interface UserGroupWithRolesDTO {
  group: UserGroupDTO;
  roles: UserRole[];
}
