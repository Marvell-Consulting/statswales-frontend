import { GlobalRole } from '../shared/enums/global-role';
import { GroupRole } from '../shared/enums/group-role';

export interface UserRoleFormValues {
  global: GlobalRole[];
  groups: string[];
  [key: string]: GroupRole[] | GlobalRole[] | string[];
}
