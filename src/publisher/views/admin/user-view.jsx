import React from 'react';
import Layout from '../components/Layout';
import FlashMessages from '../components/FlashMessages';
import Table from '../../../shared/views/components/Table';

export default function UserView(props) {
  const columns = [
    {
      key: 'name',
      label: props.t('admin.user.view.groups.table.name'),
      format: (value, row) => {
        const url = props.buildUrl(`/admin/group/${row.id}`, props.i18n.language);
        return <a href={url}>{value}</a>;
      }
    },
    {
      key: 'roles',
      label: props.t('admin.user.view.groups.table.roles'),
      format: (value) => value?.map((r) => props.t(`user_roles.${r}`)).join(', ')
    }
  ];

  const title = props.user.name || props.user.email;

  return (
    <Layout {...props} title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <FlashMessages />

          <h1 className="govuk-heading-xl">{title}</h1>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.user.view.details.status')}</dt>
              <dd className="govuk-summary-list__value">
                <strong className={`govuk-tag govuk-tag--${props.statusToColour(props.user.status)}`}>
                  {props.t(`admin.user.badge.status.${props.user.status}`)}
                </strong>
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.user.view.details.email')}</dt>
              <dd className="govuk-summary-list__value">{props.user.email}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.user.view.details.login')}</dt>
              <dd className="govuk-summary-list__value">
                {props.user.last_login_at
                  ? props.dateFormat(props.user.last_login_at, 'd MMMM yyyy h:mm a', { locale: props.i18n.language })
                  : props.t('admin.user.view.login_never')}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.user.view.details.service_admin')}</dt>
              <dd className="govuk-summary-list__value">
                {props.user.global_roles.includes('service_admin') ? props.t('yes') : props.t('no')}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.user.view.details.developer')}</dt>
              <dd className="govuk-summary-list__value">
                {props.user.global_roles.includes('developer') ? props.t('yes') : props.t('no')}
              </dd>
            </div>
          </dl>

          <h2 className="govuk-heading-l">{props.t('admin.user.view.groups.heading')}</h2>

          {props.groups && props.groups.length > 0 ? (
            <Table columns={columns} rows={props.groups} />
          ) : (
            <p className="govuk-body">{props.t('admin.user.view.groups.empty')}</p>
          )}

          <h2 className="govuk-heading-l">{props.t('admin.user.view.actions.heading')}</h2>

          <div className="actions">
            <ul className="govuk-list">
              {props.actions?.map((action, index) => (
                <li key={index}>
                  <a className="govuk-link govuk-link--no-underline" href={action.url}>
                    {props.t(`admin.user.view.actions.${action.key}.label`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
