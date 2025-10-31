import React from 'react';
import Layout from '../components/Layout';
import FlashMessages from '../../../shared/views/components/FlashMessages';
import Table from '../../../shared/views/components/Table';
import Pagination from '../../../shared/views/components/Pagination';
import { dateFormat } from '../../../shared/utils/date-format';

export default function UserList(props) {
  const columns = [
    {
      key: 'name',
      label: props.t('admin.user.list.table.name'),
      format: (value, row) => {
        const url = props.buildUrl(`/admin/user/${row.id}`, props.i18n.language);
        return (
          <a href={url} className="govuk-link">
            {value || row.email}
          </a>
        );
      }
    },
    {
      key: 'groups',
      format: (value) => value?.length || 0
    },
    {
      key: 'last_login_at',
      label: props.t('admin.user.list.table.login'),
      format: (value) =>
        value
          ? dateFormat(value, 'd MMMM yyyy h:mm a', { locale: props.i18n.language })
          : props.t('admin.user.view.login_never')
    },
    {
      key: 'status',
      format: (value) => (
        <strong className={`govuk-tag govuk-tag--${props.statusToColour(value)}`}>
          {props.t(`admin.user.badge.status.${value}`)}
        </strong>
      )
    }
  ];
  const title = props.t('admin.user.list.heading');
  return (
    <Layout {...props} title={title}>
      <FlashMessages />

      <h1 className="govuk-heading-xl">{title}</h1>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <a href={props.buildUrl(`/admin/user/create`, props.i18n.language)} className="govuk-button">
            {props.t('admin.user.list.buttons.add')}
          </a>
        </div>
        <div className="govuk-grid-column-one-third govuk-!-text-align-right">
          <form method="GET" className="search-form">
            <input
              type="text"
              name="search"
              className="govuk-input"
              placeholder={props.t('admin.user.list.search.placeholder')}
              defaultValue={props.search || ''}
            />
            <button type="submit" className="govuk-button govuk-button-small">
              {props.t('admin.user.list.search.button')}
            </button>
          </form>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {props?.users && (
            <>
              <Table i18nBase="admin.user.list.table" columns={columns} rows={props.users} />
              <Pagination {...props} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
