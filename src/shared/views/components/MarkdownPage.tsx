import React from 'react';
import { useLocals } from '../context/Locals';

type MarkdownPageProps = {
  content: string;
  tableOfContents: string;
};

export default function MarkdownPage(props: MarkdownPageProps) {
  const { i18n } = useLocals();

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds" dangerouslySetInnerHTML={{ __html: props.content }} />
      <div style={{ position: 'sticky', top: '10px' }} className="govuk-grid-column-one-third">
        {props.tableOfContents && <h2 className="govuk-heading-s">{i18n.t('toc')}</h2>}
        <div dangerouslySetInnerHTML={{ __html: props.tableOfContents }}></div>
      </div>
    </div>
  );
}
