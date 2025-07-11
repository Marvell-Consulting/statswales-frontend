import React, { Fragment } from 'react';
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
import { CheckboxGroup, CheckboxOptions } from '../components/CheckboxGroup';
import { PreviewMetadata } from '../../interfaces/preview-metadata';
import { DatasetDTO } from '../../dtos/dataset';
import { PublishingStatus } from '../../enums/publishing-status';
import { DatasetStatus as DatasetStatusType } from '../../enums/dataset-status';
import { PageInfo } from '../../dtos/view-dto';
import { Filters } from '../components/Filters';
import qs from 'qs';

export default function ConsumerView(props) {
  const LayoutComponent = props.isDeveloper ? Layout : ConsumerLayout;
  const [originalUrl, query] = props.url.split('?');
  const parsedQuery = qs.parse(query);
  const sortBy = parsedQuery.sort_by;

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
                <select
                  className="govuk-select full-width"
                  id="page_size"
                  name="page_size"
                  defaultValue={props.page_size}
                >
                  {[5, 10, 25, 50, 100, 250, 500].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              {sortBy && (
                <>
                  <input type="hidden" name="sort_by[columnName]" value={sortBy.columnName} />
                  <input type="hidden" name="sort_by[direction]" value={sortBy.direction} />
                </>
              )}

              <Filters filters={props.filters} url={props.url} title={props.t('consumer_view.filters')} />
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
                label: props.t('consumer_view.filtered_download')
              },
              {
                value: 'default',
                label: props.t('consumer_view.default_download')
              }
            ]}
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
                hint: props.t('consumer_view.data_only_hint')
              },
              {
                value: 'json',
                label: 'JSON',
                hint: props.t('consumer_view.data_only_hint')
              }
              // {
              //   value: 'parquet',
              //   label: 'Parquet',
              //   hint: props.t('consumer_view.data_metadata_hint')
              // }
              // {
              //   value: 'duckdb',
              //   label: 'DuckDB',
              //   hint: props.t('consumer_view.everything_hint')
              // }
            ]}
          />

          <RadioGroup
            name="number_format"
            label={props.t('consumer_view.number_formating')}
            options={[
              {
                value: 'default',
                label: props.t('consumer_view.formatted_numbers'),
                hint: props.t('consumer_view.formatted_numbers_hint'),
                disabled: true
              },
              {
                value: 'raw',
                label: props.t('consumer_view.unformatted_numbers')
              }
            ]}
            value="raw"
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

          <input
            type="hidden"
            id="selected_filter_options"
            name="selected_filter_options"
            value={JSON.stringify(props.selectedFilterOptions)}
          ></input>

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

  const title = props.datasetMetadata.title;
  console.log({ title });

  return (
    <LayoutComponent {...props} title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>
      {(props.preview || (props?.isDeveloper && props?.showDeveloperTab)) && <DatasetStatus {...props} />}
      {props.preview && (
        <div className="govuk-panel">
          <p className="govuk-panel__title-m">{props.t('publish.cube_preview.panel')}</p>
        </div>
      )}

      <Tabs
        title={props.t('toc')}
        tabs={[
          ...(props?.isDeveloper && props?.showDeveloperTab
            ? [{ label: props.t('developer.heading'), id: 'developer', children: <DeveloperView {...props} /> }]
            : []),
          { label: props.t('consumer_view.data'), id: 'data', children: DataPanel },
          { label: props.t('consumer_view.about_this_dataset'), id: 'about_dataset', children: AboutPanel },
          { label: props.t('consumer_view.download'), id: 'download_dataset', children: DownloadPanel }
        ]}
      />
    </LayoutComponent>
  );
}
