import { UserDTO } from '../dtos/user/user';
import { UserGroupWithRolesDTO } from '../dtos/user/user-group-with-roles-dto';
import { GroupRole } from '../enums/group-role';

export const getEditorUserGroups = (user?: UserDTO): UserGroupWithRolesDTO[] => {
  return user?.groups?.filter((g) => g.roles.includes(GroupRole.Editor)) || [];
};

export const isEditor = (user?: UserDTO): boolean => {
  return user?.groups?.some((g) => g.roles.includes(GroupRole.Editor)) || false;
};
