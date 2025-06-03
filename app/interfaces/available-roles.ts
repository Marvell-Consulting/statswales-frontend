import type { GlobalRole } from '~/enums/global-role';
import type { GroupRole } from '~/enums/group-role';

export interface AvailableRoles {
  global: GlobalRole[];
  group: GroupRole[];
}
