import { UserGroupDTO } from './user-group';

export class UserDto {
  id: string;
  provider: string;
  email: string;
  given_name?: string;
  family_name?: string;
  groups: UserGroupDTO[];
  created_at: Date;
  updated_at: Date;
}
