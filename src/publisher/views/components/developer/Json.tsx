import React from 'react';

type jsonDDisplayProps = {
  datasetJson: string;
};

export default function Json({ datasetJson }: jsonDDisplayProps) {
  return (
    <div className="govuk-accordion__section">
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span className="govuk-accordion__section-button" id="accordion-default-heading-4">
            JSON
          </span>
        </h2>
      </div>
      <div id="accordion-default-content-4" className="govuk-accordion__section-content">
        <div>
          <pre className="hljs mb-0 p-4 block min-h-full overflow-auto code-block">
            <code dangerouslySetInnerHTML={{ __html: datasetJson }} />
          </pre>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              code, code > span, code > span.wg {
                font-family: 'Fira Code', monospace !important;
              }
              .code-block {
                font-family: 'Fira Code', monospace;
                max-height: 500px;
                overflow: auto;
                border: 1px solid #bfc1c3;
                padding: 10px;
              }`
            }}
          />
        </div>
      </div>
    </div>
  );
}
