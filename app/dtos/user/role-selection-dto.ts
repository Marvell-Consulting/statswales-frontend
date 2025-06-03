import type { GlobalRole } from '~/enums/global-role';
import type { GroupRole } from '~/enums/group-role';

export interface RoleSelectionDTO {
  type: 'global' | 'group';
  roles: GlobalRole[] | GroupRole[];
  groupId?: string;
}
