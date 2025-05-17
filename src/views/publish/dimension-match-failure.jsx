import React from 'react';
import Layout from '../components/layouts/Publisher';

export default function DimensionMatchFailure(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <span className="region-subhead">{props.dimension.metadata.name}</span>
          {props.patchRequest.dimension_type === 'lookup_table' ? (
            <h1 className="govuk-heading-xl">{props.t('publish.dimension_match_failure.lookup_heading')}</h1>
          ) : (
            <h1 className="govuk-heading-xl">{props.t('publish.dimension_match_failure.heading')}</h1>
          )}

          {props.patchRequest.dimension_type === 'lookup_table' ? (
            <>
              <p className="govuk-body">
                {props.t('publish.dimension_match_failure.lookup_information', {
                  failureCount: props.extension.totalNonMatching
                })}
              </p>
              <p className="govuk-body">{props.t('publish.dimension_match_failure.you_should_check')}</p>
              <ul className="govuk-list govuk-list--bullet">
                <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.formatting')}</li>
                <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.choices')}</li>
              </ul>
            </>
          ) : (
            <>
              <p className="govuk-body">
                {props.t('publish.dimension_match_failure.ref_information', {
                  failureCount: props.extension.totalNonMatching
                })}
              </p>
              <p className="govuk-body">{props.t('publish.dimension_match_failure.you_should_check_ref')}</p>
              <ul className="govuk-list govuk-list--bullet">
                <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.ref_formatting')}</li>
                <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.ref_choices')}</li>
              </ul>
            </>
          )}

          {props.extension.nonMatchingDataTableValues && (
            <>
              <h2 className="govuk-heading-l">
                {props.t('publish.dimension_match_failure.missing_data_table_values')}
              </h2>

              <ul className="govuk-list govuk-list--bullet">
                {props.extension.nonMatchingDataTableValues.length === 0 ? (
                  <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.no_matches')}</li>
                ) : (
                  props.extension.nonMatchingDataTableValues.map((value, index) => (
                    <li
                      key={index}
                      className="govuk-list--bullet"
                      __dangerouslySetInnerHTML={{
                        __html: `
                          "${value.toString().replace(
                            ' ',
                            <>
                              <span className="govuk-visually-hidden">space</span>
                              <span aria-hidden="true" className="mid-dot">
                                &middot;
                              </span>
                            </>
                          )}"
                          `
                      }}
                    />
                  ))
                )}
              </ul>
            </>
          )}

          {props.extension.nonMatchedLookupValues && (
            <>
              <h2 className="govuk-heading-l">
                {props.t('publish.dimension_match_failure.missing_lookup_table_values')}
              </h2>

              <ul className="govuk-list govuk-list--bullet">
                {props.extension.nonMatchedLookupValues.length === 0 ? (
                  <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.no_matches')}</li>
                ) : (
                  props.extension.nonMatchedLookupValues.map((value, index) => (
                    <li
                      key={index}
                      className="govuk-list--bullet"
                      dangerouslySetInnerHTML={{
                        __html: `"${value.toString().replace(
                          ' ',
                          <>
                            <span className="govuk-visually-hidden">space</span>
                            <span aria-hidden="true" className="mid-dot">
                              &middot;
                            </span>
                          </>
                        )}"`
                      }}
                    />
                  ))
                )}
              </ul>
            </>
          )}

          <h2 className="govuk-heading-l">{props.t('publish.dimension_match_failure.actions')}</h2>
          <pre>{JSON.stringify(props.dimensionPatch, null, 2)}</pre>

          <p className="govuk-body">
            <a
              href={props.buildUrl(`/publish/${props.datasetId}/dimension/${props.dimension.id}/`, props.i18n.language)}
              className="govuk-link"
            >
              {props.t('publish.dimension_match_failure.try_different_format')}
            </a>
          </p>
          {props.patchRequest.dimension_type !== 'reference_data' && (
            <p className="govuk-body">
              <a
                href={props.buildUrl(`/publish/${props.datasetId}/lookup/${props.dimension.id}/`, props.i18n.language)}
                className="govuk-link"
              >
                {props.t('publish.dimension_match_failure.try_different_lookup')}
              </a>
            </p>
          )}

          <p className="govuk-body">
            <a href={props.buildUrl(`/publish/${props.dataset.id}/upload`, props.i18n.language)} className="govuk-link">
              {props.t('publish.dimension_match_failure.upload_different_file')}
            </a>
            <br />
            {props.t('publish.dimension_match_failure.upload_different_file_warning')}
          </p>
        </main>
      </div>

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
