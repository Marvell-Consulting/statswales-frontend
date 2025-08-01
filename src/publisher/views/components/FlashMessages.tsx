import React from 'react';
import { useLocals } from '../../../shared/views/context/Locals';
import T from '../../../shared/views/components/T';

export default function FlashMessages() {
  const { flash } = useLocals();
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
                <T>{msg}</T>
              </p>
            );
          } else if (msg != null && typeof msg == 'object') {
            return (
              <p key={index} className="govuk-notification-banner__heading">
                <T {...msg.params}>{msg.key}</T>
              </p>
            );
          }
        })}
      </div>
    </div>
  );
}
