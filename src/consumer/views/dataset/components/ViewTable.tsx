import React from 'react';
import { isValid, parse, parseISO } from 'date-fns';

import { useLocals } from '../../../../shared/views/context/Locals';
import Table from '../../../../shared/views/components/Table';
import { ColumnHeader } from '../../../../shared/dtos/view-dto';
import { FactTableColumnType } from '../../../../shared/dtos/fact-table-column-type';
import T from '../../../../shared/views/components/T';
import { dateFormat } from '../../../../shared/utils/date-format';

export type ViewTableProps = {
  headers: ColumnHeader[];
  data: string[][];
};

export default function ViewTable(props: ViewTableProps) {
  const { i18n } = useLocals();

  const columns = props.headers.map((col, index) => ({
    key: index,
    label: col.name,
    format: (value: string) => {
      switch (true) {
        case col.source_type === FactTableColumnType.LineNumber:
          return <span className="linespan">{value}</span>;

        case col.source_type === FactTableColumnType.Time && typeof col.extractor?.dateFormat === 'string': {
          const parsedDate = parse(value, col.extractor.dateFormat, new Date());
          return isValid(parsedDate) ? dateFormat(parsedDate, 'do MMMM yyyy', { locale: i18n.language }) : value;
        }

        case col.name === i18n.t('consumer_view.start_data') || col.name === i18n.t('consumer_view.end_data'): {
          const parsedDate = parseISO(value.split('T')[0]);
          return dateFormat(parsedDate, 'do MMMM yyyy', { locale: i18n.language });
        }

        default:
          return value;
      }
    },
    className: col.source_type === FactTableColumnType.LineNumber ? 'line-number' : '',
    cellClassName: col.source_type === FactTableColumnType.LineNumber ? 'line-number' : ''
  }));

  if (props.data.length === 0) {
    return (
      <p className="govuk-body">
        <T>consumer_view.no_data</T>
      </p>
    );
  }

  return <Table isSticky columns={columns} rows={props.data} isSortable />;
}
