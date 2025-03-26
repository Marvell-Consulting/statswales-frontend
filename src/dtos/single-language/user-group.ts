import { DatasetDTO } from '../dataset';
import { UserDTO } from '../user/user';

export interface SingleLanguageUserGroup {
  id?: string;
  name?: string;
  email?: string;
  organisation?: string;
  users?: UserDTO[];
  datasets?: DatasetDTO[];
  created_at?: string;
  updated_at?: string;
}
