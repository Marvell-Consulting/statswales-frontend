import { pick } from 'lodash-es';

import type { UserGroupDTO } from '../dtos/user/user-group';
import type { SingleLanguageUserGroup } from '../dtos/single-language/user-group';

export const singleLangUserGroup = (group: UserGroupDTO, lang: string): SingleLanguageUserGroup => {
  const meta = group.metadata?.find((meta) => meta.language === lang);

  return {
    ...pick(group, ['id', 'users', 'datasets', 'created_at', 'updated_at']),
    name: meta?.name,
    email: meta?.email,
    organisation: group.organisation?.name
  };
};
