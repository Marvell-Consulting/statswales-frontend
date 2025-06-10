import React, { Fragment } from 'react';

export default function KeyInfo(props) {
  return (
    <div className="dataset-key-information">
      <h2 className="govuk-heading-m">{props.t('dataset_view.key_information.heading')}</h2>

      <dl className="govuk-summary-list">
        <div id="last-updated" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.key_information.last_update')}</dt>
          <dd className="govuk-summary-list__value">
            {props.keyInfo.updatedAt
              ? props.dateFormat(props.keyInfo.updatedAt, 'd MMMM yyyy')
              : props.t('dataset_view.key_information.update_missing')}
          </dd>
        </div>

        <div id="next-updated" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.key_information.next_update')}</dt>
          <dd className="govuk-summary-list__value">
            {props.keyInfo.nextUpdateAt
              ? props.dateFormat(props.keyInfo.nextUpdateAt, 'MMMM yyyy')
              : props.keyInfo.nextUpdateAt === false
                ? props.t('dataset_view.key_information.not_updated')
                : props.t('dataset_view.key_information.next_update_missing')}
          </dd>
        </div>

        <div id="designation" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.about.designation')}</dt>
          <dd className="govuk-summary-list__value">
            {props.keyInfo.designation
              ? props.t(`dataset_view.about.designations.${props.keyInfo.designation}`)
              : props.t('dataset_view.not_selected')}
          </dd>
        </div>

        {props.keyInfo.providers.length > 0 ? (
          props.keyInfo.providers.map((provider, idx) => (
            <Fragment key={idx}>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {props.keyInfo.providers?.length > 1
                    ? props.t('dataset_view.key_information.data_providers', { index: idx + 1 })
                    : props.t('dataset_view.key_information.data_provider')}
                </dt>
                <dd className="govuk-summary-list__value">{provider.provider_name}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {props.keyInfo.providers?.length > 1
                    ? props.t('dataset_view.key_information.data_sources', { index: idx + 1 })
                    : props.t('dataset_view.key_information.data_source')}
                </dt>
                <dd className="govuk-summary-list__value">
                  {provider.source_name ? provider.source_name : props.t('dataset_view.key_information.no_source')}
                </dd>
              </div>
            </Fragment>
          ))
        ) : (
          <>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('dataset_view.key_information.data_provider')}</dt>
              <dd className="govuk-summary-list__value">{props.t('dataset_view.not_selected')}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{props.t('dataset_view.key_information.data_source')}</dt>
              <dd className="govuk-summary-list__value">{props.t('dataset_view.not_selected')}</dd>
            </div>
          </>
        )}

        <div id="time-period" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.key_information.time_covered')}</dt>
          <dd className="govuk-summary-list__value">
            {props.keyInfo.timePeriod.start && props.keyInfo.timePeriod.end
              ? props.t('dataset_view.key_information.time_period', {
                  start: props.dateFormat(props.keyInfo.timePeriod.start, 'MMMM yyyy'),
                  end: props.dateFormat(props.keyInfo.timePeriod.end, 'MMMM yyyy')
                })
              : props.t('dataset_view.period_cover_missing')}
          </dd>
        </div>
      </dl>
    </div>
  );
}
