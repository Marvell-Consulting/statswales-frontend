import { DimensionType } from '../enums/dimension-type';
import { YearType } from '../enums/year-type';

export interface DimensionPatchDto {
    dimension_type: DimensionType;
    dimension_title?: string;
    lookup_join_column?: string;
    reference_type?: string;
    date_type?: YearType;
    year_format?: string;
    quarter_format?: string;
    month_format?: string;
    date_format?: string;
    fifth_quarter?: boolean;
}