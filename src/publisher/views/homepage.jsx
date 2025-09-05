import React from 'react';

import ErrorHandler from './components/ErrorHandler';
import FlashMessages from '../../shared/views/components/FlashMessages';
import Pagination from '../../shared/views/components/Pagination';
import Table from '../../shared/views/components/Table';
import Layout from './components/Layout';

export default function Homepage(props) {
  const columns = [
    {
      key: 'title',
      label: props.t('homepage.table.title'),
      format: (value, row) => {
        const url = props.buildUrl(`/publish/${row.id}/overview`, props.i18n.language);
        const content = value || `${row.title_alt} [${props.t('homepage.table.not_translated')}]`;
        return (
          <a href={url} className="govuk-link">
            {content}
          </a>
        );
      }
    },
    {
      key: 'group_name',
      label: props.t('homepage.table.group'),
      cellClassName: 'group nowrap'
    },
    {
      key: 'last_updated',
      label: props.t('homepage.table.last_updated'),
      style: { width: '15%' },
      format: (value) => props.dateFormat(value, 'd MMMM yyyy', { locale: props.i18n.language }),
      cellClassName: 'date nowrap'
    },
    {
      key: 'status',
      label: props.t('homepage.table.dataset_status'),
      format: (value) =>
        value ? (
          <strong className={`govuk-tag max-width-none govuk-tag--${props.statusToColour(value)}`}>
            {props.t(`homepage.status.${value}`)}
          </strong>
        ) : null,
      cellClassName: 'status nowrap'
    },
    {
      key: 'publishing_status',
      label: props.t('homepage.table.publish_status'),
      format: (value) =>
        value ? (
          <strong className={`govuk-tag max-width-none govuk-tag--${props.statusToColour(value)}`}>
            {props.t(`badge.publishing_status.${value}`)}
          </strong>
        ) : null,
      cellClassName: 'status nowrap'
    }
  ];

  const title = props.t('homepage.heading');
  const showDatasetList = props.canCreate || props.canApprove || props.isDeveloper;

  return (
    <Layout {...props} title={title}>
      <FlashMessages />
      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">{title}</h1>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {props.canCreate && (
            <a className="govuk-button" href={`${props.buildUrl(`/publish`, props.i18n.language)}`}>
              {props.t('homepage.buttons.create')}
            </a>
          )}
          &nbsp;
        </div>

        <div className="govuk-grid-column-one-third govuk-!-text-align-right">
          {showDatasetList && (
            <form method="GET" className="search-form">
              <input
                type="text"
                name="search"
                className="govuk-input"
                placeholder={props.t('homepage.search.placeholder')}
                defaultValue={props.search || ''}
              />
              <button type="submit" className="govuk-button govuk-button-small">
                {props.t('homepage.search.button')}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {showDatasetList ? (
            <>
              <Table columns={columns} rows={props.data} />
              <Pagination {...props} />
            </>
          ) : (
            <>
              <p className="govuk-body">{props.t('homepage.no_results.summary')}</p>
              <ul className="govuk-list govuk-list--bullet">
                <li>{props.t('homepage.no_results.summary_1')}</li>
                <li>{props.t('homepage.no_results.summary_2')}</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
