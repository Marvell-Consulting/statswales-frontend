import React, { ReactNode } from 'react';

type NotificationBannerProps = {
  notification: string | ReactNode;
  t?: (key: string) => string;
};

export default function NotificationBanner(props: NotificationBannerProps) {
  const content = typeof props.notification === 'string' && props.t ? props.t(props.notification) : props.notification;

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <div className="govuk-notification-banner" data-module="govuk-notification-banner">
          <div className="govuk-notification-banner__content">
            <h3 className="govuk-notification-banner__heading govuk-heading-m">{content}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
