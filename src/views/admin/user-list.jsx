import React from 'react';
import Layout from '../components/layouts/Publisher';
import FlashMessages from '../components/FlashMessages';
import Table from '../components/Table';

export default function UserList(props) {
  const columns = [
    {
      key: 'full_name',
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
        value ? props.dateFormat(value, 'd MMMM yyyy h:mm a') : props.t('admin.user.view.login_never')
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
  return (
    <Layout {...props}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <FlashMessages {...props} />

          <h1 className="govuk-heading-xl">{props.t('admin.user.list.heading')}</h1>

          <a href={props.buildUrl(`/admin/user/create`, props.i18n.language)} className="govuk-button">
            {props.t('admin.user.list.buttons.add')}
          </a>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              {props?.users && props?.users.length > 0 && (
                <Table {...props} i18nBase="admin.user.list.table" columns={columns} rows={props.users} />
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
