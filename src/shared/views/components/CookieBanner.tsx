import React from 'react';
import T from './T';
import { useLocals } from '../context/Locals';

export default function CookieBanner() {
  const { showCookieBanner, buildUrl, i18n } = useLocals();

  if (!showCookieBanner) return null;

  return (
    <div id="cookie-banner" className="cookie-banner container-fluid">
      <p className="govuk-body">
        <T>cookies.banner.required.summary</T>
      </p>

      <p className="govuk-body">
        <T>cookies.banner.optional.summary</T>
      </p>

      <form id="cookie-banner-form" action={buildUrl('/cookies', i18n.language)} method="post">
        <input type="hidden" name="acceptAll" value="true" />

        <div className="govuk-button-group">
          <button id="cookies-accept-all" className="govuk-button govuk-button--secondary">
            <T>cookies.banner.buttons.accept_all</T>
          </button>
          <a
            id="cookieOptions"
            className="govuk-button govuk-button--secondary"
            href={buildUrl('/cookies', i18n.language)}
          >
            <T>cookies.banner.buttons.change_settings</T>
          </a>
        </div>
      </form>
    </div>
  );
}
