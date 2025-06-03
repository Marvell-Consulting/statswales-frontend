import { sortBy } from 'lodash-es';

import type { SingleLanguageUserGroup } from '../dtos/single-language/user-group';
import type { Organisation } from '../interfaces/organisation';

export const groupByOrg = (groups: SingleLanguageUserGroup[]) => {
  const organisations = groups.reduce((orgs: Organisation[], group: SingleLanguageUserGroup) => {
    const org = orgs.find((o: Organisation) => o.name === group.organisation);
    if (org) {
      org.groups.push(group);
    } else {
      orgs.push({ name: group.organisation!, groups: [group] });
    }
    return orgs;
  }, []);

  organisations.forEach((org: Organisation) => {
    org.groups = sortBy(org.groups, 'name');
  });

  return sortBy(organisations, 'name');
};
