import { Designation } from '../enums/designation';

import type { UpdateFrequencyDTO } from './update-frequency';
import type { RelatedLinkDTO } from './related-link';

export interface RevisionMetadataDTO {
  language?: string;
  title?: string;
  summary?: string;
  collection?: string;
  quality?: string;
  rounding_applied?: boolean;
  rounding_description?: string;
  update_frequency?: UpdateFrequencyDTO;
  related_links?: RelatedLinkDTO[];
  designation?: Designation;
}
