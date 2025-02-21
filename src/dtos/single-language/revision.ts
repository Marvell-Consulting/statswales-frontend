import { Designation } from '../../enums/designation';
import { DataTableDto } from '../data-table';
import { RelatedLinkDTO } from '../related-link';
import { RevisionMetadataDTO } from '../revision-metadata';
import { RevisionProviderDTO } from '../revision-provider';
import { TopicDTO } from '../topic';
import { UpdateFrequencyDTO } from '../update-frequency';

export interface SingleLanguageRevision {
    id: string;
    dataset_id?: string;
    revision_index: number;
    created_at: string;
    updated_at: string;
    previous_revision_id?: string;
    online_cube_filename?: string;
    publish_at?: string;
    approved_at?: string;
    approved_by?: string;
    created_by: string;
    data_table?: DataTableDto;
    metadata?: RevisionMetadataDTO;
    rounding_applied?: boolean;
    update_frequency?: UpdateFrequencyDTO;
    designation?: Designation;
    related_links?: RelatedLinkDTO[];
    providers: RevisionProviderDTO[];
    topics: TopicDTO[];
}
