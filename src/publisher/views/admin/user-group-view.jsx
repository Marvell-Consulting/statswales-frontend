import React from 'react';
import Layout from '../components/Layout';
import Table from '../../../shared/views/components/Table';
import FlashMessages from '../../../shared/views/components/FlashMessages';

export default function UserGroupView(props) {
  const columns = [
    {
      key: 'name',
      format: (_, row) => {
        const url = props.buildUrl(`/admin/user/${row.id}`, props.i18n.language);
        return (
          <a href={url} className="govuk-link">
            {row.name || row.email}
          </a>
        );
      }
    },
    {
      key: 'roles',
      format: (value) => value?.map((r) => props.t(`user_roles.${r}`)).join(', ')
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
  const title = props.group?.name;
  return (
    <Layout {...props} title={title}>
      <FlashMessages />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{title}</h1>

          <h2 className="govuk-heading-l">{props.t('admin.group.view.details.heading')}</h2>
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.group.view.details.status')}</dt>
              <dd className="govuk-summary-list__value">
                <strong className={`govuk-tag govuk-tag--${props.statusToColour(props.group.status)}`}>
                  {props.t(`admin.group.badge.status.${props.group.status}`)}
                </strong>
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.group.view.details.organisation.heading')}</dt>
              <dd className="govuk-summary-list__value">
                {props.group?.organisation || props.t('admin.group.view.details.organisation.not_set')}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('admin.group.view.details.email.heading')}</dt>
              <dd className="govuk-summary-list__value">
                {props.group?.email || props.t('admin.group.view.details.email.not_set')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="govuk-grid-row govuk-!-margin-top-6">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">{props.t('admin.group.view.users.heading')}</h2>
          {!props.group?.users || props.group.users.length === 0 ? (
            <p>{props.t('admin.group.view.users.none')}</p>
          ) : (
            <Table
              i18nBase="admin.group.view.users.table"
              columns={columns}
              rows={props.group.users.map((userWithRoles) => ({
                ...userWithRoles.user,
                roles: userWithRoles.roles
              }))}
            />
          )}
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">{props.t('admin.group.view.datasets.heading')}</h2>
          {!props.group?.datasets || props.group.datasets.length === 0 ? (
            <p>{props.t('admin.group.view.datasets.none')}</p>
          ) : (
            <p>{props.t('admin.group.view.datasets.some', { count: props.datasetCount })}</p>
          )}
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">{props.t('admin.group.view.actions.heading')}</h2>

          <div className="actions">
            <ul className="govuk-list">
              {props.actions?.map((action, index) => (
                <li key={index}>
                  <a className="govuk-link govuk-link--no-underline" href={action.url}>
                    {props.t(`admin.group.view.actions.${action.key}.label`)}
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
