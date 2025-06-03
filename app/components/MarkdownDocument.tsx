import Markdown from 'markdown-to-jsx';
import type { TreeNode } from '~/utils/gather-docs.server';
import T from './T';
import { RenderList } from './RenderList';

export const MarkdownDocument = ({ doc, toc }: { doc: string; toc: TreeNode[] }) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <Markdown
          options={{
            overrides: {
              h1: {
                props: {
                  className: 'govuk-heading-xl'
                }
              },
              h2: {
                props: {
                  className: 'govuk-heading-l'
                }
              },
              h3: {
                props: {
                  className: 'govuk-heading-m'
                }
              },
              h4: {
                props: {
                  className: 'govuk-heading-s'
                }
              },
              h5: {
                props: {
                  className: 'govuk-heading-xs'
                }
              },
              p: {
                props: {
                  className: 'govuk-body'
                }
              },
              ol: {
                props: {
                  className: 'govuk-list govuk-list--number'
                }
              },
              ul: {
                props: {
                  className: 'govuk-list govuk-list--bullet'
                }
              },
              table: {
                component: ({ children }) => {
                  return (
                    <div className="govuk-table__container">
                      <table className="govuk-table">{children}</table>
                    </div>
                  );
                }
              },
              th: {
                props: {
                  className: 'govuk-table__header'
                }
              },
              td: {
                props: {
                  className: 'govuk-table__cell'
                }
              },
              a: {
                props: {
                  className: 'govuk-link'
                }
              }
            }
          }}
        >
          {doc}
        </Markdown>
      </div>
      <div style={{ position: 'sticky', top: '10px' }} className="govuk-grid-column-one-third">
        <h2 className="govuk-heading-s">
          <T>toc</T>
        </h2>
        <RenderList nodes={toc} />
      </div>
    </div>
  );
};
