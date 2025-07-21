import React from 'react';
import Table from './Table';
import { ViewDTO } from '../../dtos/view-dto';
import { useLocals } from '../context/Locals';
import T from './T';

export type MeasurePreviewTableProps = {
  headers: ViewDTO['headers'];
  data: ViewDTO['data'];
  langCol: number;
};

export default function MeasurePreviewTable(props: MeasurePreviewTableProps) {
  const { dateFormat, parseISO, i18n } = useLocals();
  const columns = props.headers.map((col, index) => ({
    key: index,
    label: <T fallback={col.name}>publish.measure_review.column_headers.{col.name.toLowerCase()}</T>,
    format: (value: string) => {
      switch (col.name.toLowerCase()) {
        case 'start_date':
        case 'end_date': {
          return dateFormat(parseISO(value.split('T')[0]), 'do MMMM yyyy');
        }
        case 'date_type': {
          return <T>publish.measure_review.year_type.{value}</T>;
        }
      }
      if (value) {
        return <T fallback={value}>publish.measure_review.column_values.{value.toString().toLowerCase()}</T>;
      }
    }
  }));
  return (
    <Table<ViewDTO['data'][0]>
      columns={columns}
      rows={props.data.filter((row) =>
        props.langCol > -1 && row[props.langCol] !== i18n.language.toLowerCase() ? false : true
      )}
    />
  );
}
