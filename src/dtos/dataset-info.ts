import { Designation } from '../enums/designation';

export interface DatasetInfoDTO {
    language?: string;
    title?: string;
    description?: string;
    collection?: string;
    quality?: string;
    rounding_applied?: boolean;
    rounding_description?: string;
    designation?: Designation;
}
