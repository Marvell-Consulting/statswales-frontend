import React from 'react';
import RadioGroup from '../../../../shared/views/components/RadioGroup';
import { useLocals } from '../../../../shared/views/context/Locals';
import { Filter } from '../../../../shared/interfaces/filter';

export type DownloadTabProps = {
  dataset: { id: string };
  selectedFilterOptions: Filter[];
  preview?: boolean;
};

function ExtendedHint() {
  const { i18n } = useLocals();
  return (
    <ul className="govuk-list govuk-list--bullet">
      <li>{i18n.t('consumer_view.downloads.extended.description.reference_codes')}</li>
      <li>{i18n.t('consumer_view.downloads.extended.description.hierarchies')}</li>
      <li>{i18n.t('consumer_view.downloads.extended.description.hidden')}</li>
    </ul>
  );
}

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
      <div className="govuk-grid-column-two-thirds">
        <form method="POST" action={formSubmitUrl}>
          <RadioGroup
            name="view_type"
            label={i18n.t('consumer_view.downloads.type.heading')}
            options={[
              {
                value: 'filtered',
                label: i18n.t('consumer_view.downloads.type.options.filtered.label')
              },
              {
                value: 'unfiltered',
                label: i18n.t('consumer_view.downloads.type.options.full.label')
              }
            ]}
            value={props.selectedFilterOptions ? 'filtered' : 'unfiltered'}
          />

          <RadioGroup
            name="format"
            label={i18n.t('consumer_view.downloads.file_type.heading')}
            options={[
              {
                value: 'csv',
                label: i18n.t('consumer_view.downloads.file_type.options.csv.label')
              },
              {
                value: 'xlsx',
                label: i18n.t('consumer_view.downloads.file_type.options.excel.label')
              },
              {
                value: 'json',
                label: i18n.t('consumer_view.downloads.file_type.options.json.label')
              }
            ]}
            value="csv"
          />

          <RadioGroup
            name="view_choice"
            label={i18n.t('consumer_view.downloads.number_formatting.heading')}
            options={[
              {
                value: 'formatted',
                label: i18n.t('consumer_view.downloads.number_formatting.options.formatted.label'),
                hint: i18n.t('consumer_view.downloads.number_formatting.options.formatted.hint')
              },
              {
                value: 'raw',
                label: i18n.t('consumer_view.downloads.number_formatting.options.unformatted.label')
              }
            ]}
            value="formatted"
          />

          <RadioGroup
            name="extended"
            label={i18n.t('consumer_view.downloads.extended.heading')}
            hint={<ExtendedHint />}
            options={[
              {
                value: 'yes',
                label: i18n.t('consumer_view.downloads.extended.options.yes.label'),
                hint: i18n.t('consumer_view.downloads.extended.options.yes.hint')
              },
              {
                value: 'no',
                label: i18n.t('consumer_view.downloads.extended.options.no.label')
              }
            ]}
            value="yes"
          />

          <RadioGroup
            name="download_language"
            label={i18n.t('consumer_view.downloads.language.heading')}
            options={[
              {
                value: 'en-GB',
                label: i18n.t('consumer_view.downloads.language.options.english.label')
              },
              {
                value: 'cy-GB',
                label: i18n.t('consumer_view.downloads.language.options.welsh.label')
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
            {i18n.t('consumer_view.downloads.button')}
          </button>
        </form>

        <div className="download-metadata govuk-!-margin-top-5">
          <h2 className="govuk-heading-m">{i18n.t('consumer_view.downloads.metadata.heading')}</h2>
          <p className="govuk-body">{i18n.t('consumer_view.downloads.metadata.description')}</p>
          <a href={downloadMetaUrl} className="govuk-button button-primary">
            {i18n.t('consumer_view.downloads.metadata.button')}
          </a>
        </div>
      </div>
    </div>
  );
}
