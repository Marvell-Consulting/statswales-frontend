import type { DatasetDTO } from '../dataset';
import type { UserWithRolesDTO } from '../user/user-with-roles-dto';

export interface SingleLanguageUserGroup {
  id?: string;
  name?: string;
  email?: string;
  organisation?: string;
  users?: UserWithRolesDTO[];
  datasets?: DatasetDTO[];
  created_at?: string;
  updated_at?: string;
}
