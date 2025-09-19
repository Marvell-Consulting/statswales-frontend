import React from 'react';
import Layout from '../components/Layout';
import FlashMessages from '../../../shared/views/components/FlashMessages';
import Pagination from '../../../shared/views/components/Pagination';
import Table from '../../../shared/views/components/Table';

export default function UserGroupList(props) {
  const columns = [
    {
      key: 'name',
      format: (value, row) => {
        const url = props.buildUrl(`/admin/group/${row.id}`, props.i18n.language);
        return (
          <a href={url} className="govuk-link">
            {value}
          </a>
        );
      }
    },
    'organisation',
    'email',
    'user_count',
    'dataset_count',
    {
      key: 'status',
      format: (value) => (
        <strong className={`govuk-tag govuk-tag--${props.statusToColour(value)}`}>
          {props.t(`admin.user.badge.status.${value}`)}
        </strong>
      )
    }
  ];

  const title = props.t('admin.group.list.heading');

  return (
    <Layout {...props} title={title}>
      <FlashMessages />

      <h1 className="govuk-heading-xl">{title}</h1>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <a href={props.buildUrl(`/admin/group/create`, props.i18n.language)} className="govuk-button">
            {props.t('admin.group.list.buttons.add')}
          </a>
        </div>
        <div className="govuk-grid-column-one-third govuk-!-text-align-right">
          <form method="GET" className="search-form">
            <input
              type="text"
              name="search"
              className="govuk-input"
              placeholder={props.t('admin.group.list.search.placeholder')}
              defaultValue={props.search || ''}
            />
            <button type="submit" className="govuk-button govuk-button-small">
              {props.t('admin.group.list.search.button')}
            </button>
          </form>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {props?.groups && (
            <>
              <Table i18nBase="admin.group.list.table" columns={columns} rows={props.groups} />
              {props.total_pages > 1 && <Pagination {...props} />}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
