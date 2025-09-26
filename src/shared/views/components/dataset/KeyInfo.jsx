import React, { Fragment } from 'react';
import T from '../T';
import { NextUpdateType } from '../../../enums/next-update-type';
import { parse } from 'date-fns';
import { dateFormat } from '../../../../consumer/middleware/services';

export default function KeyInfo(props) {
  function NextUpdate() {
    const nextUpdateAt = props.keyInfo?.nextUpdateAt;

    if (nextUpdateAt?.update_type) {
      switch (nextUpdateAt.update_type) {
        case NextUpdateType.Update: {
          const { day, month, year } = nextUpdateAt.date || {};
          const date = parse(`${day || '01'} ${month} ${year}`, 'dd MM yyyy', new Date());

          if (day) {
            return props.dateFormat(date, 'd MMMM yyyy', { locale: props.i18n.language });
          } else {
            return props.dateFormat(date, 'MMMM yyyy', { locale: props.i18n.language });
          }
        }

        case NextUpdateType.Replacement:
          return <T>dataset_view.key_information.next_update_replacement</T>;

        case NextUpdateType.None:
          return <T>dataset_view.key_information.next_update_none</T>;
      }
    }

    return <T>dataset_view.key_information.next_update_missing</T>;
  }

  function PeriodCovered({ timePeriod, locale }) {
    if (!timePeriod.start || !timePeriod.end) {
      return false;
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

  return (
    <div className="dataset-key-information">
      <h2 className="govuk-heading-m">{props.t('dataset_view.key_information.heading')}</h2>

      <dl className="govuk-summary-list">
        <div id="last-updated" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.key_information.last_update')}</dt>
          <dd className="govuk-summary-list__value">
            {props.keyInfo.updatedAt
              ? props.dateFormat(props.keyInfo.updatedAt, 'd MMMM yyyy', { locale: props.i18n.language })
              : props.t('dataset_view.key_information.update_missing')}
          </dd>
        </div>

        <div id="next-updated" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.key_information.next_update')}</dt>
          <dd className="govuk-summary-list__value">
            <NextUpdate />
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

        <PeriodCovered locale={props.i18n.language} timePeriod={props.keyInfo.timePeriod} />
      </dl>
    </div>
  );
}
