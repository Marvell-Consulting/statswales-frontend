import React from 'react';

import Layout from '../components/Layout';
import DatasetStatus from '../../../shared/views/components/dataset/DatasetStatus';
import T from '../../../shared/views/components/T';
import { CubeBuildStatus } from '../../../shared/enums/cube-build-status';

export default function LongBuild(props) {
  const spinner = {
    display: 'inline-block',
    height: '50px',
    width: '50px',
    verticalAlign: 'middle',
    marginLeft: '50px'
  };
  const showSpinner = () => {
    switch (props.buildLogEntry.status) {
      case CubeBuildStatus.Completed:
      case CubeBuildStatus.Materializing:
      case CubeBuildStatus.Failed:
        return <></>;
      default:
        return <div className="loader" id="spinner" style={spinner}></div>;
    }
  };
  const actionButton = () => {
    switch (props.buildLogEntry.status) {
      case CubeBuildStatus.Completed:
        return (
          <>
            <a href={props.nextAction} className="govuk-button" id="action-button">
              {props.t('buttons.continue')}
            </a>
          </>
        );
      case CubeBuildStatus.Failed:
        return (
          <>
            <a href={props.previousAction} className="govuk-button" id="action-button">
              {props.t('buttons.go_back')}
            </a>
          </>
        );
      default:
        return (
          <>
            <a
              href={props.buildUrl(`/publish/${props.datasetId}/build/${props.buildLogEntry.id}`, props.i18n.language)}
              className="govuk-button"
              id="action-button"
            >
              {props.t('buttons.refresh')}
            </a>
          </>
        );
    }
  };
  const translationKeys = {
    title: {
      completed: props.t('publish.build.title.completed'),
      failed: props.t('publish.build.title.failed'),
      building: props.t('publish.build.title.building')
    },
    buttons: {
      continue: props.t('buttons.continue'),
      back: props.t('buttons.back'),
      refresh: props.t('buttons.refresh')
    },
    message: {
      completed: props.t('publish.build.paragraph.completed'),
      failed: props.t('publish.build.paragraph.failed'),
      building: props.t('publish.build.message.building')
    }
  };
  return (
    <Layout {...props} title={props.title}>
      <span className="region-subhead">
        <T>publish.overview.subheading</T>
      </span>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

      <DatasetStatus {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-header-s govuk-!-margin-bottom-2">
            <span id="build-status-heading">
              <T>publish.build.title.{props.buildLogEntry.status}</T>
            </span>
            {showSpinner()}
          </h2>

          <p className="govuk-body" id="build-status-message">
            <T>publish.build.paragraph.{props.buildLogEntry.status}</T>
          </p>

          <input type="hidden" id="build-id" name="build-id" value={props.buildLogEntry.id} />
          <input type="hidden" id="dataset-id" name="dataset-id" value={props.datasetId} />
          <input type="hidden" id="next-action" name="next-action" value={props.nextAction} />
          <input type="hidden" id="previous-action" name="previous-action" value={props.previousAction} />
          <input type="hidden" id="translation-keys" name="translation-keys" value={JSON.stringify(translationKeys)} />
          <input type="hidden" id="lang" name="lang" value={props.i18n.language} />
          {actionButton()}
        </div>
      </div>
      <script src="/assets/js/long-build.js"></script>
    </Layout>
  );
}
