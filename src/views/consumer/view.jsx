import React, { Fragment } from 'react';
import qs from 'qs';
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
import RadioGroup from '../components/RadioGroup';
import Select from '../components/Select';
import T from '../components/T';

export default function ConsumerView(props) {
  const LayoutComponent = props.isDeveloper ? Layout : ConsumerLayout;
  const parsed = qs.parse(props.url.split('?')[1]);

  const DataPanel = (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper govuk-!-padding-top-0">
        <div className="govuk-grid-row govuk-!-margin-bottom-0">
          {/* Disabled for consumer testing */}
          {/*<div className="govuk-grid-column-one-half">*/}
          {/*  <form method="get">*/}
          {/*    <Select*/}
          {/*      name="dataViewsChoice"*/}
          {/*      label={<T>consumer_view.data_view</T>}*/}
          {/*      labelClassName="govuk-label--s"*/}
          {/*      options={[*/}
          {/*        {*/}
          {/*          value: '',*/}
          {/*          label: <T>consumer_view.select_view</T>*/}
          {/*        },*/}
          {/*        {*/}
          {/*          value: 'default',*/}
          {/*          label: <T>consumer_view.data_table</T>*/}
          {/*        }*/}
          {/*      ]}*/}
          {/*      value={new URLSearchParams(props.url.split('?')[1]).get('dataViewsChoice')}*/}
          {/*      inline*/}
          {/*    />{' '}*/}
          {/*    <button type="submit" className="govuk-button button-black govuk-button-small" data-module="govuk-button">*/}
          {/*      {props.t('consumer_view.apply_view')}*/}
          {/*    </button>*/}
          {/*  </form>*/}
          {/*</div>*/}
        </div>
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-padding-top-0" />
        <div className="govuk-grid-row">
          {/* Sidebar filters */}
          <div className="govuk-grid-column-one-quarter">
            <form method="get">
              <h2 className="govuk-heading-m">{props.t('consumer_view.options')}</h2>
              <div className="govuk-form-group">
                <label className="govuk-label region-subhead" htmlFor="page_size">
                  {props.t('consumer_view.page_size')}
                </label>
                <select className="govuk-select" id="page_size" name="page_size" defaultValue={props.page_size}>
                  {[5, 10, 25, 50, 100, 250, 500].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <h2 className="govuk-heading-m">{props.t('consumer_view.filters')}</h2>
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
              {props.filters?.map((filter, index) => {
                const selected = parsed?.filter?.[filter.columnName];
                return (
                  <Fragment key={index}>
                    <h3 className="region-subhead">{filter.columnName}</h3>
                    <div className="filter-container">
                      <div
                        className="govuk-checkboxes govuk-checkboxes--small option-select"
                        data-module="govuk-checkboxes"
                      >
                        {filter.values.map((value, index) => {
                          const isSelected =
                            selected &&
                            (Array.isArray(selected)
                              ? selected.includes(value.description)
                              : selected === value.description);
                          return (
                            <div className="govuk-checkboxes__item" key={index}>
                              <input
                                className="govuk-checkboxes__input checkboxes__input__filter"
                                id={value.description}
                                name={`filter[${filter.columnName}]`}
                                type="checkbox"
                                // we are using description for now.
                                value={value.description}
                                defaultChecked={isSelected}
                              />
                              <label
                                className="govuk-label govuk-checkboxes__label checkboxes__label__filter"
                                htmlFor={value.description}
                              >
                                {value.description}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Fragment>
                );
              })}
              <br />
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
            <Pagination {...props} />
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
          <RadioGroup
            name="view_type"
            label={props.t('consumer_view.download_heading')}
            options={[
              {
                value: 'filtered',
                label: props.t('consumer_view.filtered_download'),
                disabled: true
              },
              {
                value: 'default',
                label: props.t('consumer_view.default_download')
              }
            ]}
            value="default"
          />

          <RadioGroup
            name="format"
            label={props.t('consumer_view.download_format')}
            options={[
              {
                value: 'csv',
                label: 'CSV',
                hint: props.t('consumer_view.data_only_hint')
              },
              {
                value: 'xlsx',
                label: 'Excel',
                hint: props.t('consumer_view.data_metadata_hint')
              },
              {
                value: 'parquet',
                label: 'Parquet',
                hint: props.t('consumer_view.data_metadata_hint')
              },
              {
                value: 'duckdb',
                label: 'DuckDB',
                hint: props.t('consumer_view.everything_hint')
              }
            ]}
          />

          <RadioGroup
            name="number_format"
            label={props.t('consumer_view.number_formating')}
            options={[
              {
                value: 'default',
                label: props.t('consumer_view.formatted_numbers'),
                hint: props.t('consumer_view.formatted_numbers_hint')
              },
              {
                value: 'raw',
                label: props.t('consumer_view.unformatted_numbers'),
                disabled: true
              }
            ]}
            value="default"
          />

          <RadioGroup
            name="download_language"
            label={props.t('consumer_view.select_language')}
            options={[
              {
                value: 'en-GB',
                label: props.t('consumer_view.english')
              },
              {
                value: 'cy-GB',
                label: props.t('consumer_view.welsh')
              }
            ]}
          />

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
