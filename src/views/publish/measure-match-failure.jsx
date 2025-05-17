import React from 'react';
import Layout from '../components/layouts/Publisher';

export default function MeasureMatchFailure(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <span className="region-subhead">{props.measure.metadata.name}</span>
          <h1 className="govuk-heading-xl">{props.t('publish.measure_match_failure.heading')}</h1>

          <p className="govuk-body">
            {props.t('publish.measure_match_failure.information', { failureCount: props.extension.totalNonMatching })}
          </p>
          <p className="govuk-body">{props.t('publish.measure_match_failure.things_to_check')}</p>
          <ul className="govuk-list govuk-list--bullet">
            <li className="govuk-list--bullet">{props.t('publish.measure_match_failure.formatting')}</li>
            <li className="govuk-list--bullet">{props.t('publish.measure_match_failure.choices')}</li>
          </ul>

          {props.extension.nonMatchingDataTableValues && (
            <>
              <h2 className="govuk-heading-l">{props.t('publish.dimension_match_failure.fact_table_subheading')}</h2>

              <ul className="govuk-list govuk-list--bullet">
                {props.extension.nonMatchingDataTableValues.length === 0 ? (
                  <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.no_matches')}</li>
                ) : (
                  props.extension.nonMatchingDataTableValues.map((value, index) => (
                    <li
                      key={index}
                      className="govuk-list--bullet"
                      dangerouslySetInnerHTML={{
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

          {props.extension.nonMatchingLookupValues && (
            <>
              <h2 className="govuk-heading-l">{props.t('publish.measure_match_failure.measure_subheading')}</h2>

              <ul className="govuk-list govuk-list--bullet">
                {props.extension.nonMatchingLookupValues.length === 0 ? (
                  <li className="govuk-list--bullet">{props.t('publish.dimension_match_failure.no_matches')}</li>
                ) : (
                  props.extension.nonMatchingLookupValues.map((value, index) => (
                    <li
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

          <p className="govuk-body">
            <a
              href={props.buildUrl(`/publish/${props.datasetId}/measure/`, props.i18n.language)}
              className="govuk-link"
            >
              {props.t('publish.measure_match_failure.upload_different_measure')}
            </a>
          </p>

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
