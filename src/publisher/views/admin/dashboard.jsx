import React from 'react';
import clsx from 'clsx';

import Layout from '../components/Layout';
import Table from '../../../shared/views/components/Table';

const Dashboard = (props) => {
  const { stats, title } = props;
  const datasetStats = stats.datasets;
  const columns = [
    {
      key: 'status',
      format: (value) => {
        if (value === 'total') {
          return <strong>{props.t('admin.dashboard.stats.datasets.total.label')}</strong>;
        }
        return (
          <strong className={clsx('govuk-tag', 'publishing-status', `govuk-tag--${props.statusToColour(value)}`)}>
            {props.t(`admin.dashboard.stats.datasets.${value}.label`)}
          </strong>
        );
      }
    },
    {
      key: 'description',
      format: (value, row) => {
        return row.status === 'total' ? <strong>{value}</strong> : value;
      }
    },
    {
      key: 'count',
      format: (value, row) => {
        return row.status === 'total' ? <strong>{value}</strong> : value;
      }
    }
  ];

  const rows = Object.keys(datasetStats).map((key) => {
    return {
      status: key,
      description: props.t(`admin.dashboard.stats.datasets.${key}.description`),
      count: datasetStats[key]
    };
  });

  return (
    <Layout {...props} formPage title={title}>
      <div className="admin-dashboard">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{title}</h1>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-l">{props.t('admin.dashboard.stats.datasets.heading')}</h2>
            <Table i18nBase="admin.dashboard.stats.datasets.table" columns={columns} rows={rows} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
