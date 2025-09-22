import React from 'react';

import Layout from '../components/Layout';

const StatCard = ({ title, value, description, className }) => (
  <div className={`stat-card ${className}`}>
    <h2 className="stat-card__value">{value}</h2>
    <h3 className="stat-card__title">{title}</h3>
    <p className="stat-card__description">{description}</p>
  </div>
);

const Dashboard = (props) => {
  const { stats, title } = props;
  const datasetStats = stats.datasets;

  const datasetCards = [
    {
      title: props.t('admin.dashboard.stats.datasets.total.heading'),
      description: props.t('admin.dashboard.stats.datasets.total.description'),
      value: datasetStats.total,
      className: 'stat-card--total'
    },
    {
      title: props.t('admin.dashboard.stats.datasets.incomplete.heading'),
      description: props.t('admin.dashboard.stats.datasets.incomplete.description'),
      value: datasetStats.incomplete,
      className: 'stat-card--incomplete'
    },
    {
      title: props.t('admin.dashboard.stats.datasets.pending.heading'),
      description: props.t('admin.dashboard.stats.datasets.pending.description'),
      value: datasetStats.pendingApproval,
      className: 'stat-card--pending'
    },
    {
      title: props.t('admin.dashboard.stats.datasets.published.heading'),
      description: props.t('admin.dashboard.stats.datasets.published.description'),
      value: datasetStats.published,
      className: 'stat-card--published'
    },
    {
      title: props.t('admin.dashboard.stats.datasets.archived.heading'),
      description: props.t('admin.dashboard.stats.datasets.archived.description'),
      value: datasetStats.archived,
      className: 'stat-card--archived'
    }
  ];

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
            <div className="stat-grid">
              {datasetCards.map((card, index) => (
                <StatCard key={index} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
