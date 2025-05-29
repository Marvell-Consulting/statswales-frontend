import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import DimensionPreviewTable from '../components/DimensionPreviewTable';

export default function DimensionRevisit(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.url.includes('change-type')
    ? props.buildUrl(`/publish/${props.datasetId}/dimension/${props.dimension.id}`, props.i18n.language)
    : returnLink;
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">
        {props.dimension.metadata?.name || props.t('publish.time_dimension_review.unknown_name')}
      </h1>

      <ErrorHandler />

      {props.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <DimensionPreviewTable {...props} />

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
                {props.dimension.type === 'lookup_table' ? (
                  <li>
                    <a
                      href={props.buildUrl(
                        `/publish/${props.datasetId}/lookup/${props.dimension.id}/`,
                        props.i18n.language
                      )}
                      className="govuk-link"
                    >
                      {props.t('publish.lookup_table_review.change_lookup_table')}
                    </a>
                  </li>
                ) : (
                  (props.dimension.type === 'date_period' || props.dimension.type === 'date') && (
                    <li>
                      <a
                        href={props.buildUrl(
                          `/publish/${props.datasetId}/dates/${props.dimension.id}/change-format`,
                          props.i18n.language
                        )}
                        className="govuk-link"
                      >
                        {props.t('publish.lookup_table_review.change_date_format')}
                      </a>
                    </li>
                  )
                )}
                <li>
                  <a
                    href={props.buildUrl(
                      `/publish/${props.datasetId}/dimension/${props.dimension.id}/change-type`,
                      props.i18n.language
                    )}
                    className="govuk-link"
                  >
                    {props.t('publish.lookup_table_review.change_dimension_type')}
                  </a>
                </li>
                <li>
                  <a
                    href={props.buildUrl(
                      `/publish/${props.datasetId}/dimension/${props.dimension.id}/change-name`,
                      props.i18n.language
                    )}
                    className="govuk-link"
                  >
                    {props.t('publish.time_dimension_review.change_name')}
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
