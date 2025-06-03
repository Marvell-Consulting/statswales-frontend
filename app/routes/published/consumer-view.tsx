import ViewTable from '~/components/consumer/ViewTable';
import About from '~/components/dataset/About';
import DatasetStatus from '~/components/dataset/DatasetStatus';
import KeyInfo from '~/components/dataset/KeyInfo';
import Notes from '~/components/dataset/Notes';
import Published from '~/components/dataset/Published';
import Pagination from '~/components/Pagination';
import RadioGroup from '~/components/RadioGroup';
import Select from '~/components/Select';
import T from '~/components/T';
import Tabs from '~/components/Tabs';
import { fetchPublishedDataset } from '~/middleware/load-published-dataset';
import type { Route } from './+types/consumer-view';
import { datasetContext } from '~/middleware/load-dataset';
import { getLocale } from '~/middleware/i18next.server';
import { consumerApi } from '~/middleware/consumer-api';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NotFoundException } from '~/exceptions/not-found.exception';
import { getDatasetPreview } from '~/utils/dataset-preview';
import { generateSequenceForNumber } from '~/utils/pagination';
import { localeUrl } from '~/utils/locale-url';
import { authContext } from '~/middleware/auth-middleware';
import { singleLangDataset } from '~/utils/single-lang-dataset';

export const unstable_middleware = [fetchPublishedDataset];

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const { isDeveloper } = context.get(authContext);
  const { dataset: loadedDataset } = context.get(datasetContext);
  const locale = getLocale(context);
  const api = context.get(consumerApi);
  const dataset = singleLangDataset(loadedDataset, locale);
  const revision = dataset.published_revision;
  const query = new URL(request.url).searchParams;
  const pageNumber = Number.parseInt(query.get('page_number') as string, 10) || 1;
  const pageSize = Number.parseInt(query.get('page_size') as string, 10) || 100;
  let pagination: (string | number)[] = [];

  if (!dataset.live || !revision) {
    throw new NotFoundException('no published revision found');
  }

  const datasetMetadata = await getDatasetPreview(dataset, revision);
  const preview = await api.getPublishedDatasetView(dataset.id, pageSize, pageNumber, undefined);

  pagination = generateSequenceForNumber(preview.current_page, preview.total_pages);

  return { ...preview, datasetMetadata, pagination, isDeveloper };
};

export default function ConsumerView({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
  const DataPanel = (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper govuk-!-padding-top-0">
        <div className="govuk-grid-row govuk-!-margin-bottom-0">
          <div className="govuk-grid-column-one-half">
            <form method="get">
              <Select
                name="dataViewsChoice"
                label={<T>consumer_view.data_view</T>}
                labelClassName="govuk-label--s"
                options={[
                  {
                    value: '',
                    label: <T>consumer_view.select_view</T>
                  },
                  {
                    value: 'default',
                    label: <T>consumer_view.data_table</T>
                  }
                ]}
                value={searchParams.get('dataViewsChoice') as string}
                inline
              />{' '}
              <button
                type="submit"
                className="govuk-button button-black govuk-button-small"
                data-module="govuk-button"
              >
                <T>consumer_view.apply_view</T>
              </button>
            </form>
          </div>
          <div className="govuk-grid-column-one-half govuk-!-text-align-right">
            <T
              start={loaderData.page_info.start_record}
              end={loaderData.page_info.end_record}
              total={loaderData.page_info.total_records}
            >
              publish.preview.showing_rows
            </T>
          </div>
        </div>
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-padding-top-0" />
        <div className="govuk-grid-row">
          {/* Sidebar filters */}
          <div className="govuk-grid-column-one-quarter">
            <form method="get">
              <h3>
                <T>consumer_view.filters</T>
              </h3>
              <Select
                name="page_size"
                label={<T>pagination.page_size</T>}
                value={String(loaderData.page_size)}
                options={[5, 10, 25, 50, 100, 250, 500].map((size) => ({
                  value: size,
                  label: String(size)
                }))}
              />
              <button
                name="dataViewsChoice"
                value="filter"
                type="submit"
                className="govuk-button button-black"
                data-module="govuk-button"
              >
                <T>consumer_view.apply_filters</T>
              </button>
            </form>
          </div>

          {/* Main column */}
          <div className="govuk-grid-column-three-quarters">
            {/* Table */}
            <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
              <ViewTable {...loaderData} />
            </div>

            {/* Pagination */}
            <Pagination {...loaderData} hideLineCount />
          </div>
        </div>
      </div>
    </div>
  );

  const AboutPanel = (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <KeyInfo keyInfo={loaderData.datasetMetadata.keyInfo} />
        <Notes notes={loaderData.datasetMetadata.notes} />
        <About about={loaderData.datasetMetadata.about} />
        <Published published={loaderData.datasetMetadata.published} />
      </div>
    </div>
  );

  const DownloadPanel = (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <form
          method="get"
          action={localeUrl(`/published/${loaderData.dataset.id}/download`, i18n.language)}
        >
          <RadioGroup
            name="view_type"
            label={<T>consumer_view.download_heading</T>}
            options={[
              {
                value: 'filtered',
                label: <T>consumer_view.filtered_download</T>,
                disabled: true
              },
              {
                value: 'default',
                label: <T>consumer_view.default_download</T>
              }
            ]}
            value="default"
          />

          <RadioGroup
            name="format"
            label={<T>consumer_view.download_format</T>}
            options={[
              {
                value: 'csv',
                label: 'CSV',
                hint: <T>consumer_view.data_only_hint</T>
              },
              {
                value: 'xlsx',
                label: 'Excel',
                hint: <T>consumer_view.data_metadata_hint</T>
              },
              {
                value: 'parquet',
                label: 'Parquet',
                hint: <T>consumer_view.data_metadata_hint</T>
              },
              {
                value: 'duckdb',
                label: 'DuckDB',
                hint: <T>consumer_view.everything_hint</T>
              }
            ]}
          />

          <RadioGroup
            name="number_format"
            label={<T>consumer_view.number_formating</T>}
            options={[
              {
                value: 'default',
                label: <T>consumer_view.formatted_numbers</T>,
                hint: <T>consumer_view.formatted_numbers_hint</T>
              },
              {
                value: 'raw',
                label: <T>consumer_view.unformatted_numbers</T>,
                disabled: true
              }
            ]}
            value="default"
          />

          <RadioGroup
            name="download_language"
            label={<T>consumer_view.select_language</T>}
            options={[
              {
                value: 'en-GB',
                label: <T>consumer_view.english</T>
              },
              {
                value: 'cy-GB',
                label: <T>consumer_view.welsh</T>
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
            <T>consumer_view.download_button</T>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <h1 className="govuk-heading-xl">{loaderData.datasetMetadata.title}</h1>
      {/* FIXME: check these */}
      {(loaderData.preview || (loaderData?.isDeveloper && loaderData?.ShowDeveloperTab)) && (
        // FIXME: fix types
        <DatasetStatus {...loaderData} />
      )}
      {loaderData.preview && (
        <div className="govuk-panel">
          <p className="govuk-panel__title-m">
            <T>publish.cube_preview.panel</T>
          </p>
        </div>
      )}

      <div className="govuk-tabs" data-module="govuk-tabs">
        <h2 className="govuk-tabs__title">
          <T>toc</T>
        </h2>

        <Tabs
          tabs={[
            // TODO: fix this
            // ...(props?.isDeveloper && props?.showDeveloperTab
            //   ? [
            //       {
            //         label:<T>developer.heading</T>
            //         id: 'developer',
            //         children: <DeveloperView {...loaderData} />
            //       }
            //     ]
            //   : []),
            { label: <T>consumer_view.data</T>, id: 'data', children: DataPanel },

            {
              label: <T>consumer_view.about_this_dataset</T>,
              id: 'about_dataset',
              children: AboutPanel
            },
            {
              label: <T>consumer_view.download</T>,
              id: 'download_dataset',
              children: DownloadPanel
            }
          ]}
        />
      </div>
    </>
  );
}
