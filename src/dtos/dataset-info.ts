import { Designation } from '../enums/designation';

import { UpdateFrequencyDTO } from './update-frequency';
import { RelatedLinkDTO } from './related-link';

export interface DatasetInfoDTO {
    language?: string;
    title?: string;
    description?: string;
    collection?: string;
    quality?: string;
    rounding_applied?: boolean;
    rounding_description?: string;
    update_frequency?: UpdateFrequencyDTO;
    related_links?: RelatedLinkDTO[];
    designation?: Designation;
}
