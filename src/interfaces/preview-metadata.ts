import { Designation } from '../enums/designation';
import { SingleLanguageRevision } from '../dtos/single-language/revision';
import { RelatedLinkDTO } from '../dtos/related-link';
import { OrganisationDTO } from '../dtos/organisation';

export interface PreviewMetadata {
  title?: string;
  keyInfo: {
    updatedAt?: string;
    nextUpdateAt?: string;
    designation?: Designation;
    providers?: {
      provider_name?: string;
      source_name?: string;
    }[];
    timePeriod: {
      start?: string;
      end?: string;
    };
  };
  notes: {
    roundingApplied?: boolean;
    roundingDescription: string;
    publishedRevisions?: SingleLanguageRevision[];
  };
  about: {
    summary: string;
    quality: string;
    collection: string;
    relatedLinks?: RelatedLinkDTO[];
  };
  published: {
    organisation?: OrganisationDTO;
  };
}
