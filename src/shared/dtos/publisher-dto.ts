import { OrganisationDTO } from './organisation';
import { UserGroupListItemDTO } from './user/user-group-list-item-dto';

export interface PublisherDTO {
  group: UserGroupListItemDTO;
  organisation: OrganisationDTO;
}
