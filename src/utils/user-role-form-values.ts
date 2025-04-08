import { UserDTO } from '../dtos/user/user';
import { GroupRole } from '../enums/group-role';
import { UserRoleFormValues } from '../interfaces/user-role-form-values';

export const getUserRoleFormValues = (user: UserDTO): UserRoleFormValues => {
  return {
    global: user.global_roles || [],
    groups: user.groups.map((groupRoles) => groupRoles.group.id),
    ...user.groups.reduce(
      (acc, groupRoles) => {
        acc[`group_roles_${groupRoles.group.id}`] = groupRoles.roles;
        return acc;
      },
      {} as Record<string, GroupRole[]>
    )
  };
};
