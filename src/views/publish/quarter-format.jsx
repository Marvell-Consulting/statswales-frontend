import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';

export default function QuarterFormat(props) {
  const backLink = props.quarterTotals
    ? props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}/period/months`, props.i18n.language)
    : props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}/period/type`, props.i18n.language);
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);

  const title = props.t(`publish.quarter_format.${props.quarterTotals ? 'heading-alt' : 'heading'}`);

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>

      <h1 className="govuk-heading-xl" id="quarter-type">
        {title}
      </h1>

      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <RadioGroup
              name="quarterType"
              labelledBy="quarter-type"
              options={[
                {
                  value: 'QX',
                  label: 'Qx',
                  hint: props.t('publish.quarter_format.example', { example: 'Q1' })
                },
                {
                  value: '_QX',
                  label: '_Qx',
                  hint: props.t('publish.quarter_format.example', { example: '_Q1' })
                },
                {
                  value: '-QX',
                  label: '-Qx',
                  hint: props.t('publish.quarter_format.example', { example: '-Q1' })
                },
                {
                  value: 'X',
                  label: 'x',
                  hint: props.t('publish.quarter_format.example', { example: '1' })
                },
                {
                  value: '_X',
                  label: '_x',
                  hint: props.t('publish.quarter_format.example', { example: '_1' })
                },
                {
                  value: '-X',
                  label: '-x',
                  hint: props.t('publish.quarter_format.example', { example: '-1' })
                },
                ...(props.quarterTotals
                  ? [
                      { divider: 'or' },
                      {
                        value: 'null',
                        label: props.t('publish.quarter_format.no_quarterly_totals')
                      }
                    ]
                  : [])
              ]}
              value={String(props.quarterType)}
            />

            <RadioGroup
              name="fifthQuater"
              label={props.t('publish.quarter_format.fifth_quarter')}
              hint={props.t('publish.quarter_format.fifth_example')}
              options={[
                {
                  value: 'yes',
                  label: props.t('yes')
                },
                {
                  value: 'no',
                  label: props.t('no')
                }
              ]}
              value={props.fifthQuater}
            />

            <div className="govuk-button-group">
              <button
                type="submit"
                name="confirm"
                value="true"
                className="govuk-button"
                data-module="govuk-button"
                style={{ verticalAlign: 'unset' }}
                data-prevent-double-click="true"
              >
                {props.t('buttons.continue')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
