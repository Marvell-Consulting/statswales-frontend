import React from 'react';
import Table from './Table';

export default function MeasurePreviewTable(props) {
  const columns = props.headers.map((col, index) => ({
    key: index,
    label:
      props.t(`publish.measure_review.column_headers.${col.name.toLowerCase()}`) ===
      `publish.measure_review.column_headers.${col.name.toLowerCase()}`
        ? col.name
        : props.t(`publish.measure_review.column_headers.${col.name.toLowerCase()}`),
    format: (value) => {
      switch (col.name.toLowerCase()) {
        case 'start_date':
        case 'end_date': {
          return props.dateFormat(props.parseISO(col.split('T')[0]), 'do MMMM yyyy');
        }
        case 'date_type': {
          return props.t(`publish.measure_review.year_type.${col}`);
        }
      }
      if (value) {
        if (
          props.t(`publish.measure_review.column_values.${value.toString().toLowerCase()}`) ===
          `publish.measure_review.column_values.${value.toString().toLowerCase()}`
        ) {
          return value;
        } else {
          return props.t(`publish.measure_review.column_values.${value.toString().toLowerCase()}`);
        }
      }
    }
  }));
  return (
    <Table
      columns={columns}
      rows={props.data.filter((row) =>
        props.langCol > -1 && row[props.langCol] !== i18n.language.toLowerCase() ? false : true
      )}
    />
  );
}
