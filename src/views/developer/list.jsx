import React from 'react';
import Layout from '../components/layouts/Publisher';
import FlashMessages from '../components/FlashMessages';
import Pagination from '../components/Pagination';
import Table from '../components/Table';

export default function DeveloperList(props) {
  const columns = [
    {
      key: 'title',
      label: props.t('developer.list.table.title'),
      format: (value, row) => {
        const url = `/${props.i18n.language}/developer/${row.id}`;
        const label = value || `${dataset.title_alt} [${props.t('homepage.table.not_translated')}]`;
        return (
          <a href={url} className="govuk-link">
            {label}
          </a>
        );
      }
    },
    {
      key: 'group_name',
      label: props.t('developer.list.table.group'),
      cellClassName: 'group'
    },
    {
      key: 'revision_by',
      label: props.t('developer.list.table.revision_by'),
      cellClassName: 'group'
    },
    {
      key: 'last_updated',
      label: props.t('developer.list.table.last_updated'),
      style: { width: '15%' },
      format: (value) => props.dateFormat(value, 'd MMMM yyyy', { locale: props.i18n.language }),
      cellClassName: 'date white-space-nowrap;'
    },
    {
      key: 'status',
      label: props.t('developer.list.table.dataset_status'),
      format: (value) => {
        if (!value) {
          return;
        }
        const label = props.t(`homepage.status.${value}`);
        return (
          <strong className={`govuk-tag max-width-none govuk-tag--${props.statusToColour(value)}`}>{label}</strong>
        );
      },
      cellClassName: 'status white-space-nowrap'
    },
    {
      key: 'publishing_status',
      label: props.t('developer.list.table.publish_status'),
      format: (value) => {
        if (!value) {
          return;
        }
        const label = props.t(`homepage.publishing_status.${value}`);
        return (
          <strong className={`govuk-tag max-width-none govuk-tag--${props.statusToColour(value)}`}>{label}</strong>
        );
      },
      cellClassName: 'status white-space-nowrap'
    },
    {
      key: 'id',
      label: '',
      format: (value) => {
        const url = `/${props.i18n.language}/publish/${value}/tasklist`;
        return (
          <a href={url} className="govuk-link">
            <i className="fa-solid fa-list-check"></i> {props.t('developer.list.tasklist')}
          </a>
        );
      }
    }
  ];
  return (
    <Layout {...props}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <FlashMessages {...props} />

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-xl">{props.t('developer.heading')}</h1>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              {props.data && props.data.length > 0 && (
                <>
                  <Table {...props} columns={columns} rows={props.data} />
                  {props.total_pages > 1 && <Pagination {...props} />}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
