import type { DimensionType } from '~/enums/dimension-type';
import type { NumberType } from '~/enums/number-type';
import type { YearType } from '~/enums/year-type';

export interface DimensionPatchDTO {
  dimension_id: string;
  dimension_type: DimensionType;
  dimension_title?: string;
  lookup_join_column?: string;
  reference_type?: string;
  date_type?: YearType;
  year_format?: string;
  quarter_format?: string | null;
  month_format?: string;
  date_format?: string;
  fifth_quarter?: boolean;
  number_format?: NumberType;
  decimal_places?: number;
}
