import React from 'react';

export default function Files(props) {
  return (
    <div className="govuk-accordion__section">
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span className="govuk-accordion__section-button" id="accordion-default-heading-4">
            {props.t('developer.display.download_files')}
          </span>
        </h2>
      </div>
      <div id="accordion-default-content-4" className="govuk-accordion__section-content">
        {props.fileList.map((sublist, index) => (
          <div key={index} className="govuk-grid-row">
            {sublist.map((file, index) => (
              <div key={index} className="govuk-grid-column-one-quarter" style={{ textAlign: 'center' }}>
                <p>
                  <a href={file.link}>
                    <img
                      src={`/assets/images/dev-icons/${file.file_type}-icon.svg`}
                      alt={`${file.type} Icon`}
                      width="64"
                      height="64"
                      style={{ marginBottom: '10px' }}
                    />
                    <br />
                    {`${file.filename.replaceAll('_', ' ').replaceAll('-', ' ')} (${file.type})`}
                  </a>
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
