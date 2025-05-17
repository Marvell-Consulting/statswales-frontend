import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import Table from '../components/Table';

export default function DateChooser(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const columns = props.headers.map((col, index) => ({
    key: index,
    label:
      props.dimension?.extractor &&
      props.t(`publish.time_dimension_review.column_headers.${col.name}`) !==
        `publish.time_dimension_review.column_headers.${col.name}`
        ? props.t(`publish.time_dimension_review.column_headers.${col.name}`)
        : col.name === props.dimension.factTableColumn
          ? props.dimension.metadata.name
          : col.name,
    format: (value) => {
      switch (col.name) {
        case 'start_date':
        case 'end_date':
          return props.dateFormat(props.parseISO(value.split('T')[0]), 'do MMMM yyyy');
        case 'date_type':
          return props.t(`publish.time_dimension_review.year_type.${value}`);
      }
      return value;
    }
  }));
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <span className="region-subhead">{props.dimension.metadata.name}</span>
            {props.review ? (
              <h1 className="govuk-heading-xl">{props.t('publish.time_dimension_review.heading')}</h1>
            ) : (
              <h1 className="govuk-heading-xl">{props.t('publish.time_dimension_chooser.heading')}</h1>
            )}

            <ErrorHandler {...props} />

            {props.data && (
              <>
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-full with-overflow">
                    <Table {...props} columns={columns} rows={props.data} />
                    {props.page_info?.total_records > props.page_size && (
                      <p className="govuk-body govuk-hint">
                        {props.t('publish.time_dimension_review.showing', {
                          rows: props.page_size,
                          total: props.page_info.total_records
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {props.review ? (
                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                      <form method="post" role="continue">
                        <fieldset className="govuk-fieldset">
                          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                            <h2 className="govuk-fieldset__heading">
                              {props.t('publish.time_dimension_review.confirm')}
                            </h2>
                          </legend>
                          <div className="govuk-button-group">
                            <button
                              type="submit"
                              name="confirm"
                              value="true"
                              className="govuk-button"
                              data-module="govuk-button"
                              style={{ verticalAlign: 'unset' }}
                              data-prevent-double-click="true"
                            >
                              {props.t('buttons.continue')}
                            </button>
                          </div>
                        </fieldset>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                      <form method="post" role="continue">
                        <div className="govuk-form-group">
                          <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                              <h2 className="govuk-fieldset__heading">
                                {props.t('publish.time_dimension_chooser.question')}
                              </h2>
                            </legend>
                            <div className="govuk-radios" data-module="govuk-radios">
                              <div className="govuk-radios__item">
                                <input
                                  className="govuk-radios__input"
                                  id="dimensionTypePeriod"
                                  name="dimensionType"
                                  type="radio"
                                  value="time_period"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypePeriod">
                                  {props.t('publish.time_dimension_chooser.chooser.period')}
                                </label>
                                <div className="govuk-hint govuk-radios__hint">
                                  {props.t('publish.time_dimension_chooser.chooser.period-hint')}
                                </div>
                              </div>
                              <div className="govuk-radios__item">
                                <input
                                  className="govuk-radios__input"
                                  id="dimensionTypePoint"
                                  name="dimensionType"
                                  type="radio"
                                  value="time_point"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypePoint">
                                  {props.t('publish.time_dimension_chooser.chooser.point')}
                                </label>
                                <div className="govuk-hint govuk-radios__hint">
                                  {props.t('publish.time_dimension_chooser.chooser.point-hint')}
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        <div className="govuk-button-group">
                          <button
                            type="submit"
                            name="confirm"
                            value="true"
                            className="govuk-button"
                            data-module="govuk-button"
                            style={{ verticalAlign: 'unset' }}
                            data-prevent-double-click="true"
                          >
                            {props.t('buttons.continue')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
