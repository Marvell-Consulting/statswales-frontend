import React from 'react';
import About from '../../../../shared/views/components/dataset/About';
import KeyInfo from '../../../../shared/views/components/dataset/KeyInfo';
import Publisher from '../../../../shared/views/components/dataset/Publisher';
import { PreviewMetadata } from '../../../../shared/interfaces/preview-metadata';

export type AboutTabProps = {
  datasetMetadata: PreviewMetadata;
};

export default function AboutTab(props: AboutTabProps) {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <KeyInfo {...props} keyInfo={props.datasetMetadata.keyInfo} />
        <About {...props} about={props.datasetMetadata.about} />
        <Publisher {...props} publisher={props.datasetMetadata.publisher} />
      </div>
    </div>
  );
}
