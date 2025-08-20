import React from 'react';
import qs from 'qs';

import PublisherLayout from '../../publisher/views/components/Layout';
import ConsumerLayout from './components/Layout';
import DatasetStatus from '../../shared/views/components/dataset/DatasetStatus';
import Tabs from '../../shared/views/components/Tabs';
import DeveloperView from '../../publisher/views/components/developer/DeveloperView';
import ViewTable from './components/ViewTable';
import Pagination from '../../shared/views/components/Pagination';
import KeyInfo from '../../shared/views/components/dataset/KeyInfo';
import Notes from '../../shared/views/components/dataset/Notes';
import About from '../../shared/views/components/dataset/About';
import Publisher from '../../shared/views/components/dataset/Publisher';
import RadioGroup from '../../shared/views/components/RadioGroup';
import { Filters } from '../../shared/views/components/Filters';
import { T } from '../../shared/views/components/T';
// import { CheckboxGroup, CheckboxOptions } from '../../shared/views/components/CheckboxGroup';
// import { PreviewMetadata } from '../../shared/interfaces/preview-metadata';
// import { DatasetDTO } from '../../shared/dtos/dataset';
// import { PublishingStatus } from '../../shared/enums/publishing-status';
// import { DatasetStatus as DatasetStatusType } from '../../shared/enums/dataset-status';
// import { PageInfo } from '../../shared/dtos/view-dto';

export default function ConsumerView(props) {
  const LayoutComponent = props.isDeveloper ? PublisherLayout : ConsumerLayout;
  const [originalUrl, query] = props.url.split('?');
  const parsedQuery = qs.parse(query);
  const sortBy = parsedQuery.sort_by;

  const NoteCodesLegend = () => {
    if (!props.note_codes || props.note_codes.length === 0) return null;

    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <p className="govuk-body standard-shorthand">
            <span
              dangerouslySetInnerHTML={{
                __html: props.t('dataset_view.notes.shorthand', { shorthand_url: props.shorthandUrl })
              }}
            ></span>
            {props.note_codes.map((code, idx) => (
              <span key={code} className="govuk-body">
                {` [${code}] = ${props.t(`dataset_view.notes.${code}`).toLowerCase()}${idx < props.note_codes.length - 1 ? ',' : '.'}`}
              </span>
            ))}
          </p>
        </div>
      </div>
    );
  };

  const DataPanel = (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper govuk-!-padding-top-0">
        <NoteCodesLegend />
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
        <div className="govuk-grid-row border-top-small">
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
                  autoComplete="on"
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

          {/* In developer view, if the preview has failed just hide the table and still render the rest of the page */}
          {props?.isDeveloper && props?.previewFailed ? (
            <div className="govuk-grid-column-three-quarters">
              <div className="govuk-error-summary" data-module="govuk-error-summary">
                <div role="alert">
                  <h2 className="govuk-error-summary__title">Cube preview failed to load</h2>
                  <p>{props.previewFailed}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="govuk-grid-column-three-quarters">
              <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
                <ViewTable {...props} />
              </div>
              <Pagination {...props} />
            </div>
          )}
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
        <Publisher {...props} publisher={props.datasetMetadata.publisher} />
      </div>
    </div>
  );

  const DownloadPanel = (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <form
          method="get"
          action={props.buildUrl(
            `${props.preview || props.isDeveloper ? '/publish' : ''}/${props.dataset.id}/download`,
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
            value={props.selectedFilterOptions ? 'filtered' : 'default'}
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
            value="csv"
          />

          <RadioGroup
            name="view_choice"
            label={props.t('consumer_view.number_formating')}
            options={[
              {
                value: 'raw',
                label: props.t('consumer_view.unformatted_numbers')
              },
              {
                value: 'formatted',
                label: props.t('consumer_view.formatted_numbers'),
                hint: props.t('consumer_view.formatted_numbers_hint')
              },
              {
                value: 'raw_extended',
                label: props.t('consumer_view.unformatted_numbers_extended')
              },
              {
                value: 'formatted_extended',
                label: props.t('consumer_view.formatted_numbers_extended'),
                hint: props.t('consumer_view.formatted_numbers_hint')
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
            value={props.i18n.language}
          />

          <input
            type="hidden"
            id="selected_filter_options"
            name="selected_filter_options"
            value={JSON.stringify(props.selectedFilterOptions)}
          ></input>

          <button name="action" value="download" type="submit" className="govuk-button" data-module="govuk-button">
            {props.t('consumer_view.download_button')}
          </button>
        </form>

        <div className="download-metadata govuk-!-margin-top-5">
          <h2 className="govuk-heading-m">{props.t('consumer_view.metadata_download.heading')}</h2>
          <p className="govuk-body">{props.t('consumer_view.metadata_download.description')}</p>
          <a
            href={props.buildUrl(`/${props.dataset.id}/download/metadata`, props.i18n.language)}
            className="govuk-button button-primary"
          >
            {props.t('consumer_view.metadata_download.button')}
          </a>
        </div>
      </div>
    </div>
  );

  const title = props.datasetMetadata.title;

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
