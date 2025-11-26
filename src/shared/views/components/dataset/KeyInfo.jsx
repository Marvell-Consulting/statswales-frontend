import React, { Fragment } from 'react';

import T from '../T';
import { dateFormat } from '../../../utils/date-format';

function PeriodCovered({ timePeriod, locale }) {
  if (!timePeriod.start || !timePeriod.end) {
    return null;
  }
  return (
    <div id="time-period" className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        <T>dataset_view.key_information.time_covered</T>
      </dt>
      <dd className="govuk-summary-list__value">
        <T
          start={dateFormat(timePeriod.start, 'MMMM yyyy', { locale })}
          end={dateFormat(timePeriod.end, 'MMMM yyyy', { locale })}
        >
          dataset_view.key_information.time_period
        </T>
      </dd>
    </div>
  );
}

export default function KeyInfo(props) {
  return (
    <div className="dataset-key-information">
      <h2 className="govuk-heading-m">{props.t('dataset_view.key_information.heading')}</h2>

      <dl className="govuk-summary-list">
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

        <PeriodCovered locale={props.i18n.language} timePeriod={props.keyInfo.timePeriod} />
      </dl>
    </div>
  );
}
