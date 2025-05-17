import React from 'react';
import Layout from '../components/layouts/Publisher';
import Table from '../components/Table';

export default function UserGroupView(props) {
  const columns = [
    {
      key: 'name',
      format: (_, row) => {
        const url = props.buildUrl(`/admin/user/${row.id}`, props.i18n.language);
        return (
          <a href={url} className="govuk-link">
            {row.full_name || row.email}
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
  return (
    <Layout {...props}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl">{props.group?.name}</h1>

              <h2 className="govuk-heading-l">{props.t('admin.group.view.details.heading')}</h2>
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    {props.t('admin.group.view.details.organisation.heading')}
                  </dt>
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

              <a
                href={props.buildUrl(`/admin/group/${props.group.id}/name`, props.i18n.language)}
                className="govuk-link"
              >
                {props.t('admin.group.view.buttons.edit')}
              </a>
            </div>
          </div>

          <div className="govuk-grid-row govuk-!-margin-top-6">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-l">{props.t('admin.group.view.users.heading')}</h2>
              {!props.group?.users || props.group.users.length === 0 ? (
                <p>{props.t('admin.group.view.users.none')}</p>
              ) : (
                <Table
                  {...props}
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
                <p>{props.t('admin.group.view.datasets.some', { count: props.datsetCount })}</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
