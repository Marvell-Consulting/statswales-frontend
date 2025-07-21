export class MeasureRowDTO {
  measure_id: string;
  language: string;
  reference: string;
  sort_order?: number;
  description: string;
  notes?: string;
  format: string;
  decimals?: number;
  measure_type?: string;
  hierarchy?: string;
}
