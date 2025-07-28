import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import MeasurePreviewTable from '../components/MeasurePreviewTable';

export default function MeasureRevisit(props) {
  const backLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const title = props.measure.metadata?.name || props.t('publish.time_dimension_review.unknown_name');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} title={title}>
      <span className="region-subhead">{props.measure.metadata.name}</span>
      <h1 className="govuk-heading-xl">{title}</h1>
      <ErrorHandler />

      {props.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <MeasurePreviewTable {...props} />
              {props.page_info?.total_records > props.page_size && (
                <p className="govuk-body govuk-hint">
                  {props.t('publish.lookup_table_review.showing', {
                    rows: props.page_size,
                    total: props.page_info.total_records
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-l">{props.t('publish.time_dimension_review.actions')}</h2>
              <ul className="govuk-list">
                <li>
                  <a
                    href={props.buildUrl(`/publish/${props.datasetId}/measure/change-lookup`, props.i18n.language)}
                    className="govuk-link"
                  >
                    {props.t('publish.lookup_table_review.change_lookup_table')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
