import { SingleLanguageUserGroup } from '../dtos/single-language/user-group';
import { Organisation } from '../interfaces/organisation';

export const groupByOrg = (groups: SingleLanguageUserGroup[]) => {
  return groups.reduce((orgs: Organisation[], group: SingleLanguageUserGroup) => {
    const org = orgs.find((o: Organisation) => o.name === group.organisation);
    if (org) {
      org.groups.push(group);
    } else {
      orgs.push({ name: group.organisation!, groups: [group] });
    }
    return orgs;
  }, []);
};
