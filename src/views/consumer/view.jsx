import React from 'react';
import Layout from '../components/layouts/Publisher';
import ConsumerLayout from '../components/layouts/Consumer';
import DatasetStatus from '../components/dataset/DatasetStatus';
import Tabs from '../components/Tabs';
import DeveloperView from '../components/developer/DeveloperView';
import ViewTable from '../components/consumer/ViewTable';
import Pagination from '../components/Pagination';
import KeyInfo from '../components/dataset/KeyInfo';
import Notes from '../components/dataset/Notes';
import About from '../components/dataset/About';
import Published from '../components/dataset/Published';

export default function ConsumerView(props) {
  const LayoutComponent = props.isDeveloper ? Layout : ConsumerLayout;

  const DataPanel = (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper govuk-!-padding-top-0">
        <div className="govuk-grid-row govuk-!-margin-bottom-0">
          <div className="govuk-grid-column-one-half">
            <form method="get">
              <label className="govuk-label govuk-label--s" htmlFor="view" style={{ display: 'inline-block' }}>
                {props.t('consumer_view.data_view')}:
              </label>{' '}
              <select className="govuk-select" id="view" name="dataViewsChoice">
                <option value="" disabled="">
                  {props.t('consumer_view.select_view')}
                </option>
                <option value="default" selected>
                  {props.t('consumer_view.data_table')}
                </option>
              </select>{' '}
              <button type="submit" className="govuk-button button-black govuk-button-small" data-module="govuk-button">
                {props.t('consumer_view.apply_view')}
              </button>
            </form>
          </div>
          <div className="govuk-grid-column-one-half govuk-!-text-align-right">
            {props.t('publish.preview.showing_rows', {
              start: props.page_info.start_record,
              end: props.page_info.end_record,
              total: props.page_info.total_records
            })}
          </div>
        </div>
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-padding-top-0" />
        <div className="govuk-grid-row">
          {/* Sidebar filters */}
          <div className="govuk-grid-column-one-quarter">
            <form method="get">
              <h3>{props.t('consumer_view.filters')}</h3>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="page_size">
                  {props.t('pagination.page_size')}
                </label>
                <select className="govuk-select" id="page_size" name="page_size">
                  {[5, 10, 25, 50, 100, 250, 500].map((size) => (
                    <option key={size} value={size} selected={props.page_size === size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    // Ensure nested checkboxes toggle visibility but do not auto-select
                    document.querySelectorAll('.govuk-checkboxes__input').forEach(parentCheckbox => {
                      const controlledId = parentCheckbox.getAttribute('data-aria-controls');
                      const nestedContainer = controlledId ? document.getElementById(controlledId) : null;

                      if (nestedContainer) {
                        // Toggle visibility of nested checkboxes
                        parentCheckbox.addEventListener('change', function () {
                          nestedContainer.style.display = parentCheckbox.checked ? 'block' : 'none';
                        });
                      }
                    })`
                }}
              />
              <button
                name="dataViewsChoice"
                value="filter"
                type="submit"
                className="govuk-button button-black"
                data-module="govuk-button"
              >
                {props.t('consumer_view.apply_filters')}
              </button>
            </form>
          </div>

          {/* Main column */}
          <div className="govuk-grid-column-three-quarters">
            {/* Table */}
            <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
              <ViewTable {...props} />
            </div>

            {/* Pagination */}
            <Pagination {...props} hideLineCount />
          </div>
        </div>
      </div>
    </div>
  );

  const AboutPanel = (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <KeyInfo {...props} keyInfo={props.datasetMetadata.keyInfo} />
        <Notes {...props} notes={props.datasetMetadata.notes} />
        <About {...props} about={props.datasetMetadata.about} />
        <Published {...props} published={props.datasetMetadata.published} />
      </div>
    </div>
  );

  const DownloadPanel = (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <form
          method="get"
          action={props.buildUrl(
            `/${props.preview ? 'publish' : 'published'}/${props.dataset.id}/download`,
            props.i18n.language
          )}
        >
          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h2 className="govuk-fieldset__heading govuk-heading-m">{props.t('consumer_view.download_heading')}</h2>
              </legend>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="filtered"
                    name="view_type"
                    type="radio"
                    value="filtered"
                    disabled
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="filtered">
                    {props.t('consumer_view.filtered_download')}
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="default"
                    name="view_type"
                    type="radio"
                    value="default"
                    defaultChecked
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="default">
                    {props.t('consumer_view.default_download')}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h2 className="govuk-fieldset__heading govuk-heading-m">{props.t('consumer_view.download_format')}</h2>
              </legend>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="csv" name="format" type="radio" value="csv" />
                  <label className="govuk-label govuk-radios__label" htmlFor="csv">
                    CSV
                  </label>
                  <div id="number-format-hint" className="govuk-hint govuk-radios__hint govuk-radios__hint-gel">
                    {props.t('consumer_view.data_only_hint')}
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="excel" name="format" type="radio" value="xlsx" />
                  <label className="govuk-label govuk-radios__label" htmlFor="excel">
                    Excel
                  </label>
                  <div id="number-format-hint" className="govuk-hint govuk-radios__hint govuk-radios__hint-gel">
                    {props.t('consumer_view.data_metadata_hint')}
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="parquet" name="format" type="radio" value="parquet" />
                  <label className="govuk-label govuk-radios__label" htmlFor="parquet">
                    Parquet
                  </label>
                  <div id="number-format-hint" className="govuk-hint govuk-radios__hint govuk-radios__hint-gel">
                    {props.t('consumer_view.data_metadata_hint')}
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="duckdb" name="format" type="radio" value="duckdb" />
                  <label className="govuk-label govuk-radios__label" htmlFor="duckdb">
                    DuckDB
                  </label>
                  <div id="number-format-hint" className="govuk-hint govuk-radios__hint govuk-radios__hint-gel">
                    {props.t('consumer_view.everything_hint')}
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h2 className="govuk-fieldset__heading govuk-heading-m">{props.t('consumer_view.number_formating')}</h2>
              </legend>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="dafault_format"
                    name="number_format"
                    type="radio"
                    value="default"
                    defaultChecked
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="dafault_format">
                    {props.t('consumer_view.formatted_numbers')}
                  </label>
                  <div id="number-format-hint" className="govuk-hint govuk-radios__hint govuk-radios__hint-gel">
                    {props.t('consumer_view.formatted_numbers_hint')}
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="raw_format"
                    name="number_format"
                    type="radio"
                    value="raw"
                    disabled
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="raw_format">
                    {props.t('consumer_view.unformatted_numbers')}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h2 className="govuk-fieldset__heading govuk-heading-m">{props.t('consumer_view.select_language')}</h2>
              </legend>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="en-GB"
                    name="download_language"
                    type="radio"
                    value="en-GB"
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="en-GB">
                    {props.t('consumer_view.english')}
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="cy-GB"
                    name="download_language"
                    type="radio"
                    value="cy-GB"
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="cy-GB">
                    {props.t('consumer_view.welsh')}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <button
            name="action"
            value="download"
            type="submit"
            className="govuk-button button-blue"
            data-module="govuk-button"
          >
            {props.t('consumer_view.download_button')}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <LayoutComponent {...props}>
      <h1 className="govuk-heading-xl">{props.datasetMetadata.title}</h1>
      {(props.preview || (props?.isDeveloper && props?.ShowDeveloperTab)) && <DatasetStatus {...props} />}
      {props.preview && (
        <div className="govuk-panel">
          <p className="govuk-panel__title-m">{props.t('publish.cube_preview.panel')}</p>
        </div>
      )}

      <div className="govuk-tabs" data-module="govuk-tabs">
        <h2 className="govuk-tabs__title">{props.t('toc')}</h2>

        <Tabs
          tabs={[
            ...(props?.isDeveloper && props?.showDeveloperTab
              ? [{ label: props.t('developer.heading'), id: 'developer', children: <DeveloperView {...props} /> }]
              : []),
            { label: props.t('consumer_view.data'), id: 'data', children: DataPanel },
            { label: props.t('consumer_view.about_this_dataset'), id: 'about_dataset', children: AboutPanel },
            { label: props.t('consumer_view.download'), id: 'download_dataset', children: DownloadPanel }
          ]}
        />

        {/* <div className="govuk-tabs__panel govuk-tabs__panel&#45;&#45;hidden" id="history" role="tabpanel" aria-labelledby="tab_history">
                  <div className="govuk-grid-row">
                      <div className="govuk-grid-column-two-thirds">

                          <p><b>Next update expected (provisional):</b>  This dataset will not be updated</p>

                          <h2 className="govuk-heading-m">Updates</h2>

                          <dl className="govuk-summary-list">
                              <div className="govuk-summary-list__row">
                                  <dt style="width:16%" className="govuk-summary-list__key">
                                      19 December 2019
                                  </dt>
                                  <dd className="govuk-summary-list__value">
                                      Provisional values for Isle of Anglesey were revised. The 2019 dataset is now completed and will not be updated further.
                                  </dd>
                              </div>
                              <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">
                                      14 September 2019
                                  </dt>
                                  <dd className="govuk-summary-list__value">
                                      Dataset first published.
                                  </dd>
                              </div>
                          </dl>

                      </div>
                  </div>
              </div> */}
      </div>
    </LayoutComponent>
  );
}
