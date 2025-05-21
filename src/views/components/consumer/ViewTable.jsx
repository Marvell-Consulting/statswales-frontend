import React from 'react';
import Table from '../Table';

export default function ViewTable(props) {
  const columns = props.headers.map((col, index) => ({
    key: index,
    label: col.name,
    format: (value) =>
      col.source_type === 'line_number' ? (
        <span className="linespan">{value}</span>
      ) : col.name === props.t('consumer_view.start_data') || col.name === props.t('consumer_view.end_data') ? (
        props.dateFormat(props.parseISO(value.split('T')[0]), 'do MMMM yyyy')
      ) : (
        value
      ),
    className: col.source_type === 'line_number' ? 'line-number' : '',
    cellClassName: col.source_type === 'line_number' ? 'line-number' : ''
  }));
  return <Table isSticky columns={columns} rows={props.data} />;
}
