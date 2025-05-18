import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import Pagination from '../components/Pagination';
import Table from '../components/Table';

export default function Preview(props) {
  const backLink = props.revisit && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const returnLink =
    props.revisit && props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const colgroup = (
    <>
      {props.headers.map((header, index) => (
        <col key={index} className={header.type === 'ignore' ? 'ignore-column' : ''} />
      ))}
    </>
  );
  const columns = props.headers.map((header, index) => {
    return {
      key: index,
      label:
        header.source_type === 'line_number' ? (
          <span className="govuk-visually-hidden">{props.t('publish.preview.row_number')}</span>
        ) : (
          (() => {
            const type =
              header.source_type && header.source_type !== 'unknown' && header.source_type !== 'line_number' ? (
                <>
                  <span className="region-subhead">{props.t(`publish.preview.source_type.${header.source_type}`)}</span>
                  <br />
                </>
              ) : null;
            return (
              <div>
                {type}
                <span>{header.name || props.t('publish.preview.unnamed_column', { colNum: idx + 1 })}</span>
              </div>
            );
          })()
        ),
      cellClassNameName: header.source_type
    };
  });
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <h1 className="govuk-heading-xl">
        {props.revisit ? props.t('publish.preview.heading_summary') : props.t('publish.preview.heading')}
      </h1>

      <ErrorHandler {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half" style={{ paddingTop: '7px' }}>
          <p className="govuk-body">
            {props.revisit
              ? props.t('publish.preview.upload_summary', {
                  cols: props.headers?.length - props.ignoredCount,
                  rows: props.page_info?.total_records,
                  ignored: props.ignoredCount
                })
              : props.t('publish.preview.preview_summary', {
                  cols: props.headers.length,
                  rows: props.page_info.total_records
                })}
          </p>
        </div>
        <div className="govuk-grid-column-one-half" style={{ textAlign: 'right' }}>
          <form
            action={props.buildUrl(`/publish/${props.datasetId}/preview`, props.i18n.language)}
            method="get"
            role="page-size"
            className="govuk-!-margin-bottom-0"
          >
            <label className="govuk-label govuk-!-display-inline" htmlFor="page_size">
              {props.t('pagination.page_size')}
            </label>{' '}
            <select className="govuk-select govuk-!-display-inline" id="page_size" name="page_size">
              {[5, 10, 25, 50, 100, 250, 500].map((num) => (
                <option key={num} value={num} selected={props.page_size === num}>
                  {num}
                </option>
              ))}
            </select>{' '}
            <input type="hidden" name="file" value={props.datafile_id} />
            <input type="hidden" name="page_number" value="1" />
            <button
              type="submit"
              className="govuk-button govuk-button-small govuk-!-display-inline"
              data-module="govuk-button"
            >
              {props.t('pagination.update')}
            </button>
          </form>
        </div>
      </div>
      {props.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <Table isSticky columns={columns} rows={props.data} colgroup={colgroup} />
            </div>
          </div>

          <Pagination {...props} />
          {props.revisit ? (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      <h2 className="govuk-fieldset__heading">{props.t('publish.preview.revisit_question')}</h2>
                    </legend>
                    <div className="govuk-radios govuk-body govuk-!-margin-bottom-3" data-module="govuk-radios">
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="actionChooserTable"
                          name="actionChooser"
                          type="radio"
                          value="replace-table"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="actionChooserTable">
                          {props.t('publish.preview.upload_different')}
                        </label>
                        <div id="actionChooserTable-hint" className="govuk-hint govuk-radios__hint">
                          {props.t('publish.preview.upload_different_hint')}
                        </div>
                      </div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="actionChooserSources"
                          name="actionChooser"
                          type="radio"
                          value="replace-sources"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="actionChooserSources">
                          {props.t('publish.preview.change_source')}
                        </label>
                        <div id="actionChooserSources-hint" className="govuk-hint govuk-radios__hint">
                          {props.t('publish.preview.change_source_hint')}
                        </div>
                      </div>
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
                  </fieldset>
                </form>
              </div>
            </div>
          ) : (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      <h2 className="govuk-fieldset__heading">{props.t('publish.preview.confirm_correct')}</h2>
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
          )}
        </>
      )}
    </Layout>
  );
}
