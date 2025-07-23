import React from 'react';
import Layout from '../components/Layout';
import DimensionPreviewTable from '../components/DimensionPreviewTable';

export default function EmptyFact(props) {
  const title =
    props.data.length > 499
      ? props.t('errors.fact_table_validation.incomplete_fact_500', { count: data.length })
      : props.data
        ? props.t('errors.fact_table_validation.incomplete_fact', { count: data.length })
        : props.t('errors.fact_table_validation.incomplete_fact_missing');
  return (
    <Layout {...props} title={title}>
      <div className="govuk-grid-row  govuk-!-margin-bottom-4">
        <div className="govuk-grid-column-full">
          <div className="warning-background">
            <div className="govuk-error-message alert-warning">
              <h1 className="govuk-heading-xl">{title}</h1>

              <p className="govuk-heading-s">{props.t('errors.fact_table_validation.incomplete_fact_info')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{props.t('errors.fact_table_validation.duplicate_fact_summary')}</h2>
          {props.data && (
            <>
              {props.data.length > 10 ? (
                <details className="govuk-details" data-module="govuk-details">
                  <summary className="govuk-details__summary">
                    {data.length > 499
                      ? props.t('errors.fact_table_validation.incomplete_table_summary_500', { rows: data.length })
                      : props.t('errors.fact_table_validation.incomplete_table_summary', { rows: data.length })}
                  </summary>
                  : <DimensionPreviewTable {...props} />
                </details>
              ) : (
                <DimensionPreviewTable {...props} />
              )}
            </>
          )}

          <p className="govuk-heading-s">{props.t('publish.time_dimension_review.actions')}</p>
          <ul className="govuk-list">
            <li>
              <a href={props.buildUrl(`/publish/${props.dataset.id}/upload`, props.i18n.language)}>
                {props.t('errors.fact_table_validation.change_data_table')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
