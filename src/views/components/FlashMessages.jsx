import React from 'react';

export default function FlashMessages({ flash, t }) {
  if (!flash || !flash.length) {
    return null;
  }
  return (
    <div
      className="govuk-notification-banner govuk-notification-banner--success"
      role="region"
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__content">
        {flash?.map((msg, index) => {
          if (typeof msg == 'string') {
            return (
              <p key={index} className="govuk-notification-banner__heading">
                {t(msg)}
              </p>
            );
          } else if (msg != null && typeof msg == 'object') {
            return (
              <p key={index} className="govuk-notification-banner__heading">
                {t(msg.key, msg.params)}
              </p>
            );
          }
        })}
      </div>
    </div>
  );
}
