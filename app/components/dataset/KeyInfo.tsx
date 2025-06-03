import { Fragment } from 'react';
import T from '../T';
import type { PreviewMetadata } from '~/interfaces/preview-metadata';
import { dateFormat } from '~/utils/date-format';

export default function KeyInfo({ keyInfo }: { keyInfo: PreviewMetadata['keyInfo'] }) {
  return (
    <div className="dataset-key-information">
      <h2 className="govuk-heading-m">
        <T>dataset_view.key_information.heading</T>
      </h2>

      <dl className="govuk-summary-list">
        <div id="last-updated" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.key_information.last_update</T>
          </dt>
          <dd className="govuk-summary-list__value">
            {keyInfo.updatedAt ? (
              dateFormat(keyInfo.updatedAt, 'd MMMM yyyy')
            ) : (
              <T>dataset_view.key_information.update_missing</T>
            )}
          </dd>
        </div>

        <div id="next-updated" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.key_information.next_update</T>
          </dt>
          <dd className="govuk-summary-list__value">
            {keyInfo.nextUpdateAt ? (
              // FIXME: why can this been a boolean?
              dateFormat(keyInfo.nextUpdateAt as unknown as string, 'MMMM yyyy')
            ) : keyInfo.nextUpdateAt === false ? (
              <T>dataset_view.key_information.not_updated</T>
            ) : (
              <T>dataset_view.key_information.next_update_missing</T>
            )}
          </dd>
        </div>

        <div id="designation" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.about.designation</T>
          </dt>
          <dd className="govuk-summary-list__value">
            {keyInfo.designation ? (
              <T>dataset_view.about.designations.{keyInfo.designation}</T>
            ) : (
              <T>dataset_view.not_selected</T>
            )}
          </dd>
        </div>

        {keyInfo.providers !== undefined && keyInfo.providers.length > 0 ? (
          keyInfo.providers.map((provider, idx) => (
            <Fragment key={idx}>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {keyInfo.providers!.length > 1 ? (
                    <T index={idx + 1}>dataset_view.key_information.data_providers</T>
                  ) : (
                    <T>dataset_view.key_information.data_provider</T>
                  )}
                </dt>
                <dd className="govuk-summary-list__value">{provider.provider_name}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {keyInfo.providers!.length > 1 ? (
                    <T index={idx + 1}>dataset_view.key_information.data_sources</T>
                  ) : (
                    <T>dataset_view.key_information.data_source</T>
                  )}
                </dt>
                <dd className="govuk-summary-list__value">
                  {provider.source_name ? (
                    provider.source_name
                  ) : (
                    <T>dataset_view.key_information.no_source</T>
                  )}
                </dd>
              </div>
            </Fragment>
          ))
        ) : (
          <>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                <T>dataset_view.key_information.data_provider</T>
              </dt>
              <dd className="govuk-summary-list__value">
                <T>dataset_view.not_selected</T>
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                <T>dataset_view.key_information.data_source</T>
              </dt>
              <dd className="govuk-summary-list__value">
                <T>dataset_view.not_selected</T>
              </dd>
            </div>
          </>
        )}

        <div id="time-period" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.key_information.time_covered</T>
          </dt>
          <dd className="govuk-summary-list__value">
            {keyInfo.timePeriod.start && keyInfo.timePeriod.end ? (
              <T
                start={dateFormat(keyInfo.timePeriod.start, 'MMMM yyyy')}
                end={dateFormat(keyInfo.timePeriod.end, 'MMMM yyyy')}
                raw
              >
                dataset_view.key_information.time_period
              </T>
            ) : (
              <T>dataset_view.period_cover_missing</T>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
