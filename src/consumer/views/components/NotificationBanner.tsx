import React from 'react';

type NotificationBannerProps = {
  notification: string;
  t: (key: string) => string;
};

export default function NotificationBanner(props: NotificationBannerProps) {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <div className="govuk-notification-banner" data-module="govuk-notification-banner">
          <div className="govuk-notification-banner__content">
            <h3 className="govuk-notification-banner__heading govuk-heading-m">{props.t(props.notification)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
