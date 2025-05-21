import React from 'react';
import Table from './Table';

export default function DimensionPreviewTable(props) {
  const columns = props.headers.map((heading, index) => ({
    key: index,
    label:
      heading.source_type === 'line_number' ? (
        <span className="govuk-visually-hidden">{props.t('publish.preview.row_number')}</span>
      ) : (
        (() => {
          if (props.i18n.exists(`publish.time_dimension_review.column_headers.${heading.name.toLowerCase()}`)) {
            return props.t(`publish.time_dimension_review.column_headers.${heading.name.toLowerCase()}`);
          } else if (heading.name === props.dimension.factTableColumn) {
            return props.dimension.metadata.name ? props.dimension.metadata.name : heading.name;
          } else {
            return heading.name;
          }
        })()
      ),
    format: (value) => {
      if (heading.source_type === 'line_number') {
        return <span className="linespan">{value}</span>;
      }
      switch (heading.name) {
        case 'start_date':
        case 'end_date': {
          return props.dateFormat(props.parseISO(value.split('T')[0]), 'do MMMM yyyy');
        }
        case 'date_type': {
          return props.t(`publish.time_dimension_review.year_type.${value}`);
        }
      }
      return value;
    },
    className: heading.source_type === 'line_number' ? 'line-number' : '',
    cellClassName: heading.source_type === 'line_number' ? 'line-number' : ''
  }));

  return <Table columns={columns} rows={props.data} isSticky />;
}
