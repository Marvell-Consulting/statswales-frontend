import { useEffect, type ReactNode } from 'react';
import clsx from 'clsx';

type Tab = {
  id: string;
  label: ReactNode;
  children?: ReactNode;
};

export type TabsProps = {
  tabs: Tab[];
  tabIndexBase?: number;
};

export default function Tabs({ tabs, tabIndexBase = 0 }: TabsProps) {
  useEffect(() => {
    (async () => {
      const { initAll } = await import('govuk-frontend/dist/govuk/govuk-frontend.min.js');
      initAll();
    })();
  }, []);

  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <div className="tabs">
        <div className="govuk-width-container">
          <div className="govuk-main-wrapper govuk-!-padding-bottom-0">
            <ul className="govuk-tabs__list" role="tablist">
              {tabs.map((tab, i) => (
                <li
                  key={i}
                  className={clsx('govuk-tabs__list-item', {
                    'govuk-tabs__list-item--selected': i === 0
                  })}
                  role="presentation"
                  // this is needed to supress govuk frontend warnings
                  suppressHydrationWarning
                >
                  <a
                    className="govuk-tabs__tab"
                    href={`#${tab.id}`}
                    id={`tab_${tab.id}`}
                    role="tab"
                    aria-controls={tab.id}
                    tabIndex={tabIndexBase + i}
                    // this is needed to supress govuk frontend warnings
                    suppressHydrationWarning
                  >
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {tabs
        .filter((t) => t.children)
        .map((tab, i) => (
          <div
            key={i}
            className="govuk-tabs__panel"
            id={tab.id}
            role="tabpanel"
            aria-labelledby={`tab_${tab.id}`}
            // this is needed to supress govuk frontend warnings
            suppressHydrationWarning
          >
            {tab.children}
          </div>
        ))}
    </div>
  );
}
