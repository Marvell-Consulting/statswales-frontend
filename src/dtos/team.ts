import { OrganisationDTO } from './organisation';

export class TeamDTO {
    id: string;
    prefix?: string;
    name?: string;
    email?: string;
    organisation_id?: string;
    organisation?: OrganisationDTO;
}
