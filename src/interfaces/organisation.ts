import { SingleLanguageUserGroup } from '../dtos/single-language/user-group';

export interface Organisation {
  name: string;
  groups: SingleLanguageUserGroup[];
}
