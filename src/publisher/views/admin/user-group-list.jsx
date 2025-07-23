import React from 'react';
import Layout from '../components/Layout';
import FlashMessages from '../components/FlashMessages';
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
    'email',
    'user_count',
    'dataset_count'
  ];

  const title = props.t('admin.group.list.heading');

  return (
    <Layout {...props} title={title}>
      <FlashMessages />

      <h1 className="govuk-heading-xl">{title}</h1>

      <a href={props.buildUrl(`/admin/group/create`, props.i18n.language)} className="govuk-button">
        {props.t('admin.group.list.buttons.add')}
      </a>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {props?.groups && props?.groups.length > 0 && (
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
