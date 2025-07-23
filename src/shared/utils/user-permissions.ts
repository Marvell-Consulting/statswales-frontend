import { DatasetDTO } from '../dtos/dataset';
import { UserDTO } from '../dtos/user/user';
import { UserGroupWithRolesDTO } from '../dtos/user/user-group-with-roles-dto';
import { GroupRole } from '../enums/group-role';

export const getEditorUserGroups = (user?: UserDTO): UserGroupWithRolesDTO[] => {
  return user?.groups?.filter((g) => g.roles.includes(GroupRole.Editor)) || [];
};

export const getApproverUserGroups = (user?: UserDTO): UserGroupWithRolesDTO[] => {
  return user?.groups?.filter((g) => g.roles.includes(GroupRole.Approver)) || [];
};

export const isEditor = (user: UserDTO): boolean => {
  return user.groups?.some((g) => g.roles.includes(GroupRole.Editor)) || false;
};

export const isEditorForDataset = (user: UserDTO, dataset: DatasetDTO): boolean => {
  if (!user.groups || !dataset.user_group_id) return false;
  return getEditorUserGroups(user).some((g) => g.group.id === dataset.user_group_id);
};

export const isApprover = (user: UserDTO): boolean => {
  return user.groups?.some((g: UserGroupWithRolesDTO) => g.roles.includes(GroupRole.Approver)) || false;
};

export const isApproverForDataset = (user: UserDTO, dataset: DatasetDTO): boolean => {
  if (!user.groups || !dataset.user_group_id) return false;
  return getApproverUserGroups(user).some((g: UserGroupWithRolesDTO) => g.group.id === dataset.user_group_id);
};
