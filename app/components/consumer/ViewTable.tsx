import { useTranslation } from 'react-i18next';
import Table from '../Table';
import { parseISO } from 'date-fns';
import { dateFormat } from '~/utils/date-format';

export default function ViewTable(props) {
  const { t } = useTranslation();
  const columns = props.headers.map((col, index) => ({
    key: index,
    label: col.name,
    format: (value) =>
      col.source_type === 'line_number' ? (
        <span className="linespan">{value}</span>
      ) : col.name === t('consumer_view.start_data') || col.name === t('consumer_view.end_data') ? (
        dateFormat(parseISO(value.split('T')[0]), 'do MMMM yyyy')
      ) : (
        value
      ),
    className: col.source_type === 'line_number' ? 'line-number' : '',
    cellClassName: col.source_type === 'line_number' ? 'line-number' : ''
  }));
  return <Table isSticky columns={columns} rows={props.data} />;
}
