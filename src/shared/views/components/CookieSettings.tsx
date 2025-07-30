import React from 'react';
import { useLocals } from '../context/Locals';
import RadioGroup from './RadioGroup';
import T from './T';
import { CookiePreferences } from '../../interfaces/cookie-preferences';

type CookieSettingsProps = {
  content: string;
  tableOfContents: string;
  cookiePreferences: CookiePreferences;
};

export default function CookieSettings(props: CookieSettingsProps) {
  const { buildUrl, i18n } = useLocals();

  return (
    <>
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
              value={
                props.cookiePreferences.measuring !== undefined
                  ? props.cookiePreferences.measuring === true
                    ? 'accept'
                    : 'reject'
                  : undefined
              }
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
