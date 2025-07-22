import { GlobalRole } from '../enums/global-role';
import { GroupRole } from '../enums/group-role';

export interface UserRoleFormValues {
  global: GlobalRole[];
  groups: string[];
  [key: string]: GroupRole[] | GlobalRole[] | string[];
}
