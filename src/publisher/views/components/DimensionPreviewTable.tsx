import React from 'react';

import Table from '../../../shared/views/components/Table';
import { ColumnHeader, ViewDTO } from '../../../shared/dtos/view-dto';
import { useLocals } from '../../../shared/views/context/Locals';
import T from '../../../shared/views/components/T';
import { SingleLanguageDimension } from '../../../shared/dtos/single-language/dimension';
import { DimensionType } from '../../../shared/enums/dimension-type';
import { SourceType } from '../../../shared/enums/source-type';
import { dateFormat } from '../../../shared/utils/date-format';

export type DimensionPreviewTableProps = {
  headers: Array<
    ColumnHeader & {
      source_type: SourceType & 'line_number';
    }
  >;
  data: ViewDTO['data'];
  dimension: SingleLanguageDimension;
  langCol: number;
};

export default function DimensionPreviewTable(props: DimensionPreviewTableProps) {
  const { i18n } = useLocals();
  // Only typed date dimensions are guaranteed by the backend to return ISO-formatted date strings.
  // For other dimension types (e.g. lookup_table), `start_date`/`end_date` columns are user-supplied
  // and may contain ambiguous formats like `DD/MM/YYYY` that JS would misinterpret as US dates.
  const isTypedDateDimension =
    props.dimension.type === DimensionType.Date || props.dimension.type === DimensionType.DatePeriod;
  const columns = props.headers.map((heading, index) => ({
    key: index,
    label:
      heading.source_type === 'line_number' ? (
        <span className="govuk-visually-hidden">
          <T>publish.preview.row_number</T>
        </span>
      ) : (
        (() => {
          if (i18n.exists(`publish.time_dimension_review.column_headers.${heading.name.toLowerCase()}`)) {
            return <T>publish.time_dimension_review.column_headers.{heading.name.toLowerCase()}</T>;
          } else if (heading.name === props.dimension.factTableColumn) {
            return props.dimension.metadata?.name ? props.dimension.metadata.name : heading.name;
          } else {
            return heading.name;
          }
        })()
      ),
    format: (value: string) => {
      if (heading.source_type === 'line_number') {
        return <span className="linespan">{value}</span>;
      }
      if (isTypedDateDimension && (heading.name === 'start_date' || heading.name === 'end_date')) {
        return dateFormat(value, 'do MMMM yyyy', { utc: true, locale: i18n.language });
      }
      return value;
    },
    className: heading.source_type === 'line_number' ? 'line-number' : '',
    cellClassName: heading.source_type === 'line_number' ? 'line-number' : ''
  }));

  return <Table<ViewDTO['data'][0]> columns={columns} rows={props.data} isSticky />;
}
