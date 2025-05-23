import React from 'react';
import Layout from '../components/layouts/Publisher';

export default function PeriodMatchFailure(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.url;
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{props.t('publish.period_match_failure.heading')}</h1>

      <p className="govuk-body">
        {props.t('publish.period_match_failure.information', { failureCount: props.extension.totalNonMatching })}
      </p>
      <ul className="govuk-list govuk-list--bullet">
        <li className="govuk-list--bullet">{props.t('publish.period_match_failure.formatting')}</li>
        <li className="govuk-list--bullet">{props.t('publish.period_match_failure.choices')}</li>
      </ul>

      <p className="govuk-body">{props.t('publish.period_match_failure.supplied_format')}</p>

      <ul className="govuk-list govuk-list--bullet">
        {props.patchRequest.year_format && (
          <li
            className="govuk-list--bullet"
            dangerouslySetInnerHTML={{
              __html: props.t('publish.period_match_failure.year_format', {
                format: props.patchRequest.year_format
              })
            }}
          />
        )}
        {props.patchRequest.quarter_format && (
          <li
            className="govuk-list--bullet"
            dangerouslySetInnerHTML={{
              __html: props.t('publish.period_match_failure.quarter_format', {
                format: props.patchRequest.quarter_format
              })
            }}
          />
        )}
        {props.patchRequest.month_format && (
          <li
            className="govuk-list--bullet"
            dangerouslySetInnerHTML={{
              __html: props.t('publish.period_match_failure.month_format', {
                format: props.patchRequest.month_format
              })
            }}
          />
        )}
        {props.patchRequest.date_format && (
          <li
            className="govuk-list--bullet"
            dangerouslySetInnerHTML={{
              __html: props.t('publish.period_match_failure.date_format', {
                format: props.patchRequest.date_format
              })
            }}
          />
        )}
      </ul>

      <h2 className="govuk-heading-l">{props.t('publish.period_match_failure.subheading')}</h2>

      <ul className="govuk-list govuk-list--bullet">
        {props.extension.nonMatchingValues.length === 0 ? (
          <li className="govuk-list--bullet">{props.t('publish.period_match_failure.no_matches')}</li>
        ) : (
          props.extension.nonMatchingValues.map((value) => <li className="govuk-list--bullet">{value}</li>)
        )}
      </ul>

      <h2 className="govuk-heading-l">{props.t('publish.period_match_failure.actions')}</h2>

      <p className="govuk-body">
        <a
          href={props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}/`, props.i18n.language)}
          className="govuk-link"
        >
          {props.t('publish.period_match_failure.try_different_format')}
        </a>
      </p>

      <p className="govuk-body">
        <a href={props.buildUrl(`/publish/${props.dataset.id}/upload`, props.i18n.language)} className="govuk-link">
          {props.t('publish.period_match_failure.upload_different_file')}
        </a>
        <br />
        {props.t('publish.period_match_failure.upload_different_file_warning')}
      </p>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .mid-dot {
              color: #ffffff;
              font-weight: 600;
            }
          `
        }}
      />
    </Layout>
  );
}
