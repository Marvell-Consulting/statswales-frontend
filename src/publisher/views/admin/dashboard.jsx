import React from 'react';
import clsx from 'clsx';
import { formatDistanceToNow, subSeconds } from 'date-fns';
import { enGB, cy } from 'date-fns/locale';

import Layout from '../components/Layout';
import Table from '../../../shared/views/components/Table';

const DatasetStats = (props) => {
  const { summary } = props.stats.datasets;

  const summaryCols = [
    {
      key: 'status',
      format: (value) => {
        if (value === 'total') {
          return <strong>{props.t('admin.dashboard.stats.datasets.summary.total.label')}</strong>;
        }
        return (
          <strong className={clsx('govuk-tag', 'publishing-status', `govuk-tag--${props.statusToColour(value)}`)}>
            {props.t(`admin.dashboard.stats.datasets.summary.${value}.label`)}
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

  const summaryRows = Object.keys(summary).map((key) => {
    return {
      status: key,
      description: props.t(`admin.dashboard.stats.datasets.summary.${key}.description`),
      count: summary[key]
    };
  });

  const largestCols = [
    {
      key: 'title',
      format: (value, row) => {
        return (
          <a className="govuk-link" href={props.buildUrl(`publish/${row.dataset_id}/overview`, props.i18n.language)}>
            {value}
          </a>
        );
      }
    },
    {
      key: 'row_count',
      format: (value) => {
        return value ? Intl.NumberFormat(props.i18n.language).format(value) : '-';
      }
    },
    {
      key: 'size_bytes',
      format: (value) => {
        return value ? `${(value / 1024 / 1024).toFixed(2)} MB` : '-';
      }
    }
  ];
  const largestRows = props.stats.datasets.largest;

  const longestCols = [
    {
      key: 'title',
      format: (value, row) => {
        return (
          <a className="govuk-link" href={props.buildUrl(`publish/${row.dataset_id}/overview`, props.i18n.language)}>
            {value}
          </a>
        );
      }
    },
    {
      key: 'interval',
      format: (seconds) => {
        const locale = props.i18n.language.includes('cy') ? cy : enGB;
        const start = subSeconds(new Date(), seconds || 0);
        return seconds ? formatDistanceToNow(start, { locale }) : '-';
      }
    },
    {
      key: 'status',
      format: (value) => {
        return (
          <span className={clsx('govuk-tag', 'publishing-status', `govuk-tag--${props.statusToColour(value)}`)}>
            {props.t(`admin.dashboard.stats.datasets.summary.${value}.label`)}
          </span>
        );
      }
    }
  ];
  const longestRows = props.stats.datasets.longest;

  return (
    <>
      <div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{props.t('admin.dashboard.stats.datasets.summary.heading')}</h2>
          <Table i18nBase="admin.dashboard.stats.datasets.summary.table" columns={summaryCols} rows={summaryRows} />
          <p className="govuk-body-s">{props.t('admin.dashboard.stats.datasets.summary.note')}</p>
        </div>
      </div>

      <div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{props.t('admin.dashboard.stats.datasets.largest.heading')}</h2>
          <Table i18nBase="admin.dashboard.stats.datasets.largest.table" columns={largestCols} rows={largestRows} />
        </div>
      </div>

      <div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{props.t('admin.dashboard.stats.datasets.longest.heading')}</h2>
          <Table i18nBase="admin.dashboard.stats.datasets.longest.table" columns={longestCols} rows={longestRows} />
        </div>
      </div>
    </>
  );
};

const UsertStats = (props) => {
  const { summary } = props.stats.users;

  const summaryCols = [
    {
      key: 'status',
      format: (value) => {
        return value === 'total' ? (
          <strong>{props.t('admin.dashboard.stats.users.summary.total.label')}</strong>
        ) : (
          props.t(`admin.dashboard.stats.users.summary.${value}.label`)
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

  const summaryRows = Object.keys(summary).map((key) => {
    return {
      status: key,
      description: props.t(`admin.dashboard.stats.users.${key}.description`),
      count: summary[key]
    };
  });

  const mostPublishedCols = [
    {
      key: 'name',
      format: (name, row) => {
        return (
          <a className="govuk-link" href={props.buildUrl(`admin/users/${row.id}`, props.i18n.language)}>
            {name}
          </a>
        );
      }
    },
    {
      key: 'count',
      format: (value) => {
        return value ? Intl.NumberFormat(props.i18n.language).format(value) : '-';
      }
    }
  ];
  const mostPublishedRows = props.stats.users.most_published;

  return (
    <>
      <div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{props.t('admin.dashboard.stats.users.summary.heading')}</h2>
          <Table i18nBase="admin.dashboard.stats.users.summary.table" columns={summaryCols} rows={summaryRows} />
        </div>
      </div>

      <div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{props.t('admin.dashboard.stats.users.most_published.heading')}</h2>
          <Table
            i18nBase="admin.dashboard.stats.users.most_published.table"
            columns={mostPublishedCols}
            rows={mostPublishedRows}
          />
        </div>
      </div>
    </>
  );
};

const GroupStats = (props) => {
  const groupStats = props.stats.groups;

  const columns = ['name', 'count'];

  return (
    <div className="govuk-grid-row govuk-!-margin-bottom-5">
      <div className="govuk-grid-column-full">
        <h2 className="govuk-heading-m">{props.t('admin.dashboard.stats.groups.heading')}</h2>
        <Table i18nBase="admin.dashboard.stats.groups.table" columns={columns} rows={groupStats.most_published} />
      </div>
    </div>
  );
};

const Dashboard = (props) => {
  const { title } = props;

  return (
    <Layout {...props} formPage title={title}>
      <div className="admin-dashboard">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{title}</h1>
          </div>
        </div>

        <DatasetStats {...props} />
        <UsertStats {...props} />
        <GroupStats {...props} />
      </div>
    </Layout>
  );
};

export default Dashboard;
