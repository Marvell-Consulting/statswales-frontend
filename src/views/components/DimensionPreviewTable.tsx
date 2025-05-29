import React from 'react';
import Table from './Table';
import { CSVHeader, ViewDTO } from '../../dtos/view-dto';
import { useLocals } from '../context/Locals';
import T from './T';
import { SingleLanguageDimension } from '../../dtos/single-language/dimension';
import { SourceType } from '../../enums/source-type';

export type DimensionPreviewTableProps = {
  headers: Array<
    CSVHeader & {
      source_type: SourceType & 'line_number';
    }
  >;
  data: ViewDTO['data'];
  dimension: SingleLanguageDimension;
  langCol: number;
};

export default function DimensionPreviewTable(props: DimensionPreviewTableProps) {
  const { i18n, dateFormat, parseISO } = useLocals();
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
            return <T>publish.time_dimension_review.column_headers.${heading.name.toLowerCase()}</T>;
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
      switch (heading.name) {
        case 'start_date':
        case 'end_date': {
          return dateFormat(parseISO(value.split('T')[0]), 'do MMMM yyyy');
        }
        case 'date_type': {
          return <T>publish.time_dimension_review.year_type.{value}</T>;
        }
      }
      return value;
    },
    className: heading.source_type === 'line_number' ? 'line-number' : '',
    cellClassName: heading.source_type === 'line_number' ? 'line-number' : ''
  }));

  return <Table<ViewDTO['data'][0]> columns={columns} rows={props.data} isSticky />;
}
