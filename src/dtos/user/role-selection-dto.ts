import { GlobalRole } from '../../enums/global-role';
import { GroupRole } from '../../enums/group-role';

export interface RoleSelectionDTO {
  type: 'global' | 'group';
  roles: GlobalRole[] | GroupRole[];
  groupId?: string;
}
