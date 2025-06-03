import type { GlobalRole } from '~/enums/global-role';
import type { GroupRole } from '~/enums/group-role';

export interface UserRoleFormValues {
  global: GlobalRole[];
  groups: string[];
  [key: string]: GroupRole[] | GlobalRole[] | string[];
}
