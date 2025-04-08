import { DatasetDTO } from '../dataset';
import { UserWithRolesDTO } from '../user/user-with-roles-dto';

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
