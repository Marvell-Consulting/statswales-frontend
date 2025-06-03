import type { GroupRole } from '~/enums/group-role';
import type { UserGroupDTO } from './user-group';

export interface UserGroupWithRolesDTO {
  group: UserGroupDTO;
  roles: GroupRole[];
}
