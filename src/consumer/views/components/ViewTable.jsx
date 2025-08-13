import React from 'react';
import { parse } from 'date-fns';

import Table from '../../../shared/views/components/Table';

export default function ViewTable(props) {
  const columns = props.headers.map((col, index) => ({
    key: index,
    label: col.name,
    format: (value) => {
      switch (true) {
        case col.source_type === 'line_number':
          return <span className="linespan">{value}</span>;

        case col.source_type === 'time' && typeof col.extractor?.dateFormat === 'string':
          return props.dateFormat(parse(value, col.extractor.dateFormat, new Date()), 'do MMMM yyyy', {
            locale: props.i18n.language
          });

        case col.name === props.t('consumer_view.start_data') || col.name === props.t('consumer_view.end_data'):
          return props.dateFormat(props.parseISO(value.split('T')[0]), 'do MMMM yyyy', { locale: props.i18n.language });

        default:
          return value;
      }
    },
    className: col.source_type === 'line_number' ? 'line-number' : '',
    cellClassName: col.source_type === 'line_number' ? 'line-number' : ''
  }));
  return <Table isSticky columns={columns} rows={props.data} isSortable />;
}
