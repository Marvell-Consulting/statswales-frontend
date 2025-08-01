import React from 'react';
import { useLocals } from '../context/Locals';
import RadioGroup from './RadioGroup';
import T from './T';
import { CookiePreferences } from '../../interfaces/cookie-preferences';

type CookieSettingsProps = {
  content: string;
  tableOfContents: string;
  cookiePreferences: CookiePreferences;
  saved?: boolean;
  referrer?: string;
};

export default function CookieSettings(props: CookieSettingsProps) {
  const { buildUrl, i18n } = useLocals();
  const { showBanner, measuring } = props.cookiePreferences;

  return (
    <>
      {showBanner && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-notification-banner" data-module="govuk-notification-banner">
              <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading govuk-heading-m">
                  <T>cookies.settings.not_saved.heading</T>
                </h3>
                <p className="govuk-body">
                  <T>cookies.settings.not_saved.content</T>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {props.saved && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div
              className="govuk-notification-banner govuk-notification-banner--success"
              data-module="govuk-notification-banner"
            >
              <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading govuk-heading-m">
                  <T>cookies.settings.saved.heading</T>
                </h3>
                <a href={props.referrer} className="govuk-link">
                  <T>cookies.settings.saved.link</T>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds" dangerouslySetInnerHTML={{ __html: props.content }} />
        <div style={{ position: 'sticky', top: '10px' }} className="govuk-grid-column-one-third">
          {props.tableOfContents && <h2 className="govuk-heading-s">{i18n.t('toc')}</h2>}
          <div dangerouslySetInnerHTML={{ __html: props.tableOfContents }}></div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form method="POST" action={buildUrl('/cookies', i18n.language)} className="govuk-form-group">
            <RadioGroup
              name="measuring"
              labelledBy="guidance-cookies-that-measure-website-use"
              options={[
                { value: 'reject', label: i18n.t('cookies.settings.measuring.options.reject') },
                { value: 'accept', label: i18n.t('cookies.settings.measuring.options.accept') }
              ]}
              value={showBanner ? undefined : measuring ? 'accept' : 'reject'}
            />
            <div className="govuk-button-group">
              <button type="submit" className="govuk-button">
                <T>cookies.settings.buttons.submit</T>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
