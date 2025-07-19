import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import { Spinner } from '../components/Spinner';
import T from '../components/T';

export default function Title(props) {
  const backLink = props.revisit && props.referrer;
  const returnLink =
    props.revisit && props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);

  const title =
    props.uploadType === 'lookup'
      ? props.t('publish.upload.lookup_heading')
      : props.uploadType === 'measure'
        ? props.t('publish.upload.measure_heading')
        : props.t('publish.upload.title');

  const errorHtml = `
    <div class="govuk-error-summary" data-module="govuk-error-summary">
      <div role="alert">
        <h2 class="govuk-error-summary__title">
          ${props.t('errors.problem')}
        </h2>
        <div class="govuk-error-summary__body">
          <ul class="govuk-list govuk-error-summary__list" />
        </div>
      </div>
    </div>
  `;

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>

      <ErrorHandler />
      <div id="error-wrapper" />

      <form method="post" id="upload-form" encType="multipart/form-data">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="csv">
            {props.t('publish.upload.form.file.label')}
          </label>
          <input
            className="govuk-file-upload"
            id="csv"
            name="csv"
            type="file"
            placeholder="Upload file"
            accept={props.supportedFormats}
          />
        </div>
        <div className="govuk-button-group">
          <input type="hidden" name="updateType" value={props.updateType} />
          <input type="hidden" name="test" value="test" />
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            style={{ verticalAlign: 'unset' }}
            data-prevent-double-click="true"
          >
            {props.t('publish.upload.buttons.upload')}
          </button>
        </div>
      </form>

      <noscript>
        <h3 className="govuk-heading-md">
          <T>publish.upload.noscript</T>
        </h3>
      </noscript>

      <div className="upload-progress hidden">
        <Spinner />
        <h3 className="govuk-heading-md">
          <T>publish.upload.uploading</T>
        </h3>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const form = document.getElementById("upload-form");
            const loading = document.querySelector(".upload-progress");
            const fileInput = document.getElementById("csv");
            const errorWrapper = document.getElementById("error-wrapper");

            form.addEventListener("submit", async (e) => {
              e.preventDefault();
              loading.classList.remove("hidden");

              const formData = new FormData();
              const file = fileInput.files[0];

              if (file) {
                formData.append('csv', file, file.name);
              }

              if (${props.updateType}) {
                formData.append('updateType', '${props.updateType}');
              }
              console.log("${props.updateType}")

              try {
                const res = await fetch('${props.url}', {
                  method: "POST",
                  body: formData,
                  headers: {
                    "X-Requested-With": "XMLHttpRequest"
                  }
                });

                const resJson = await res.json();
                if (res.ok) {
                  return window.location.href = resJson.redirectTo;
                } else {
                  loading.classList.add("hidden");
                  const errors = resJson.errors;

                  errorWrapper.innerHTML = '${errorHtml.split('\n').join('')}';
                  const innerWrapper = errorWrapper.querySelector(".govuk-error-summary__list");

                  errors.forEach(error => {
                    const li = document.createElement("li");
                    const innerHTML = "<a href='#" + error.field + "'>" + error.message.translated + "</a>";
                    li.innerHTML = innerHTML;

                    innerWrapper.appendChild(li)  
                  });
                }
              } catch (err) {
                console.log(err);
              }
            });
          `
        }}
      />
    </Layout>
  );
}
