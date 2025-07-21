import { GlobalRole } from '../shared/enums/global-role';
import { GroupRole } from '../shared/enums/group-role';

export interface AvailableRoles {
  global: GlobalRole[];
  group: GroupRole[];
}
