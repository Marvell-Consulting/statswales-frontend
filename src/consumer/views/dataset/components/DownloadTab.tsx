import React from 'react';
import RadioGroup from '../../../../shared/views/components/RadioGroup';
import { useLocals } from '../../../../shared/views/context/Locals';
import { Filter } from '../../../../shared/interfaces/filter';

export type DownloadTabProps = {
  dataset: { id: string };
  selectedFilterOptions: Filter[];
  preview?: boolean;
};

export default function DownloadTab(props: DownloadTabProps) {
  const { buildUrl, i18n } = useLocals();
  const downloadMetaUrl = props.preview
    ? buildUrl(`/publish/${props.dataset.id}/download/metadata`, i18n.language)
    : buildUrl(`/${props.dataset.id}/download/metadata`, i18n.language);

  const formSubmitUrl = props.preview
    ? buildUrl(`/publish/${props.dataset.id}/download`, i18n.language)
    : buildUrl(`/${props.dataset.id}/download`, i18n.language);
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <form method="get" action={formSubmitUrl}>
          <RadioGroup
            name="view_type"
            label={i18n.t('consumer_view.download_heading')}
            options={[
              {
                value: 'filtered',
                label: i18n.t('consumer_view.filtered_download')
              },
              {
                value: 'default',
                label: i18n.t('consumer_view.default_download')
              }
            ]}
            value={props.selectedFilterOptions ? 'filtered' : 'default'}
          />

          <RadioGroup
            name="format"
            label={i18n.t('consumer_view.download_format')}
            options={[
              {
                value: 'csv',
                label: 'CSV',
                hint: i18n.t('consumer_view.data_only_hint')
              },
              {
                value: 'xlsx',
                label: 'Excel',
                hint: i18n.t('consumer_view.data_only_hint')
              },
              {
                value: 'json',
                label: 'JSON',
                hint: i18n.t('consumer_view.data_only_hint')
              }
            ]}
            value="csv"
          />

          <RadioGroup
            name="view_choice"
            label={i18n.t('consumer_view.number_formating')}
            options={[
              {
                value: 'raw',
                label: i18n.t('consumer_view.unformatted_numbers')
              },
              {
                value: 'formatted',
                label: i18n.t('consumer_view.formatted_numbers'),
                hint: i18n.t('consumer_view.formatted_numbers_hint')
              },
              {
                value: 'raw_extended',
                label: i18n.t('consumer_view.unformatted_numbers_extended')
              },
              {
                value: 'formatted_extended',
                label: i18n.t('consumer_view.formatted_numbers_extended'),
                hint: i18n.t('consumer_view.formatted_numbers_hint')
              }
            ]}
            value="raw"
          />

          <RadioGroup
            name="download_language"
            label={i18n.t('consumer_view.select_language')}
            options={[
              {
                value: 'en-GB',
                label: i18n.t('consumer_view.english')
              },
              {
                value: 'cy-GB',
                label: i18n.t('consumer_view.welsh')
              }
            ]}
            value={i18n.language}
          />

          <input
            type="hidden"
            id="selected_filter_options"
            name="selected_filter_options"
            value={JSON.stringify(props.selectedFilterOptions)}
          ></input>

          <button name="action" value="download" type="submit" className="govuk-button" data-module="govuk-button">
            {i18n.t('consumer_view.download_button')}
          </button>
        </form>

        <div className="download-metadata govuk-!-margin-top-5">
          <h2 className="govuk-heading-m">{i18n.t('consumer_view.metadata_download.heading')}</h2>
          <p className="govuk-body">{i18n.t('consumer_view.metadata_download.description')}</p>
          <a href={downloadMetaUrl} className="govuk-button button-primary">
            {i18n.t('consumer_view.metadata_download.button')}
          </a>
        </div>
      </div>
    </div>
  );
}
