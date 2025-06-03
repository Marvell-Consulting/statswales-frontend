import type { GroupRole } from '~/enums/group-role';
import type { UserDTO } from './user';

export interface UserWithRolesDTO {
  user: UserDTO;
  roles: GroupRole[];
}
