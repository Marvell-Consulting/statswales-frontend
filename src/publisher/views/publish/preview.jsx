import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import Pagination from '../../../shared/views/components/Pagination';
import Table from '../components/Table';
import RadioGroup from '../components/RadioGroup';
import Select from '../../../shared/views/components/Select';
import T from '../components/T';

export default function Preview(props) {
  const returnLink =
    props.revisit && props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.revisit && returnLink;
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
  const title = props.revisit ? props.t('publish.preview.heading_summary') : props.t('publish.preview.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>

      <ErrorHandler />

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
            <Select
              name="page_size"
              label={<T>pagination.page_size</T>}
              options={[5, 10, 25, 50, 100, 250, 500]}
              value={props.page_size}
              inline
            />{' '}
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
                  <RadioGroup
                    name="actionChooser"
                    label={props.t('publish.preview.revisit_question')}
                    options={[
                      {
                        value: 'replace-table',
                        label: props.t('publish.preview.upload_different'),
                        hint: props.t('publish.preview.upload_different_hint')
                      },
                      {
                        value: 'replace-sources',
                        label: props.t('publish.preview.change_source'),
                        hint: props.t('publish.preview.change_source_hint')
                      }
                    ]}
                  />
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
