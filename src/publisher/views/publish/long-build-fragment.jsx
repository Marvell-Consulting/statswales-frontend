import React from 'react';

import { CubeBuildStatus } from '../../../shared/enums/cube-build-status';

export default function LongBuildFragment(props) {
  const spinnerStyle = {
    display: 'inline-block',
    height: '50px',
    width: '50px',
    verticalAlign: 'middle',
    marginLeft: '50px'
  };

  const actionButton = () => {
    switch (props.buildLogEntry.status) {
      case CubeBuildStatus.Completed:
        return (
          <a
            href={props.nextAction}
            className="govuk-button"
            id="action-button"
            data-build-status={props.buildLogEntry.status}
          >
            {props.t('buttons.continue')}
          </a>
        );
      case CubeBuildStatus.Failed:
        return (
          <a
            href={props.previousAction}
            className="govuk-button"
            id="action-button"
            data-build-status={props.buildLogEntry.status}
          >
            {props.t('buttons.go_back')}
          </a>
        );
      default:
        return (
          <a
            href={props.buildUrl(`/publish/${props.datasetId}/build/${props.buildLogEntry.id}`, props.i18n.language)}
            className="govuk-button"
            id="action-button"
            data-build-status={props.buildLogEntry.status}
          >
            {props.t('buttons.refresh')}
          </a>
        );
    }
  };

  const showSpinner = () => {
    switch (props.buildLogEntry.status) {
      case CubeBuildStatus.Completed:
      case CubeBuildStatus.Failed:
        return <></>;
      default:
        return <div className="loader" aria-live="polite" role="status" style={spinnerStyle}></div>;
    }
  };

  const showTimer = (show) => {
    if (show) {
      return props.t(`publish.build.message.${props.buildLogEntry.status}`);
    }
    return props.t(`publish.build.paragraph.${props.buildLogEntry.status}`);
  };

  return (
    <>
      <h2 className="govuk-header-s govuk-!-margin-bottom-2">
        <span id="build-status-heading">{props.t(`publish.build.title.${props.buildLogEntry.status}`)}</span>
        {showSpinner()}
      </h2>

      <p
        className="govuk-body"
        id="build-status-message"
        hidden={!props.refresh}
        dangerouslySetInnerHTML={{ __html: showTimer(props.refresh) }}
      />

      <p className="govuk-body" id="build-status-message-failed" hidden={props.refresh}>
        {props.t(`publish.build.paragraph.${props.buildLogEntry.status}`)}
      </p>

      {actionButton()}
    </>
  );
}
