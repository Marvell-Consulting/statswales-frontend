import type { OrganisationDTO } from '~/dtos/organisation';
import type { RelatedLinkDTO } from '~/dtos/related-link';
import type { SingleLanguageRevision } from '~/dtos/single-language/revision';
import type { Designation } from '~/enums/designation';

export interface PreviewMetadata {
  title?: string;
  keyInfo: {
    updatedAt?: string;
    nextUpdateAt?: Date | boolean;
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
