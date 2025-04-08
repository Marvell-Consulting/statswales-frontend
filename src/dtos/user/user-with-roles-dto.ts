import { GroupRole } from '../../enums/group-role';
import { UserDTO } from './user';

export interface UserWithRolesDTO {
  user: UserDTO;
  roles: GroupRole[];
}
