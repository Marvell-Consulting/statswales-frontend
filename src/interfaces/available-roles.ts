import { GlobalRole } from '../enums/global-role';
import { GroupRole } from '../enums/group-role';

export interface AvailableRoles {
  global: GlobalRole[];
  group: GroupRole[];
}
