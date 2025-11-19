import React from 'react';

import { CubeBuildStatus } from '../../../shared/enums/cube-build-status';

const ActionButton = (props) => {
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

const ShowSpinner = (props) => {
  switch (props.buildLogEntry.status) {
    case CubeBuildStatus.Completed:
    case CubeBuildStatus.Failed:
      return <></>;
    default:
      return <div className="loader inline-spinner" aria-live="polite" role="status"></div>;
  }
};

const showTimer = (props) => {
  if (props.refresh) {
    return props.t(`publish.build.message.${props.buildLogEntry.status}`);
  }
  return props.t(`publish.build.paragraph.${props.buildLogEntry.status}`);
};

export default function LongBuildMonitor(props) {
  return (
    <>
      <h2 className="govuk-header-s govuk-!-margin-bottom-2">
        <span id="build-status-heading">{props.t(`publish.build.title.${props.buildLogEntry.status}`)}</span>
        <ShowSpinner {...props} />
      </h2>

      <p
        className="govuk-body"
        id="build-status-message"
        hidden={!props.refresh}
        dangerouslySetInnerHTML={{ __html: showTimer(props) }}
      />

      <p className="govuk-body" id="build-status-message-failed" hidden={props.refresh}>
        {props.t(`publish.build.paragraph.${props.buildLogEntry.status}`)}
      </p>

      <ActionButton {...props} />
    </>
  );
}
