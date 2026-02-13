import React from 'react';
import { clsx } from 'clsx';

import { FilterTable, FilterValues } from '../../dtos/filter-table';
import { Checkbox, CheckboxGroup, CheckboxOptions, Controls } from './CheckboxGroup';
import T from './T';
import { Filter } from '../../interfaces/filter';
import { useLocals } from '../context/Locals';
import { DatasetDTO } from '../../dtos/dataset';

export type FiltersProps = {
  filters: FilterTable[];
  url: string;
  title: string;
  selected: Filter[];
  dataset: DatasetDTO;
  preview?: boolean;
};

const normalizeFilters = (options: FilterValues[]): CheckboxOptions[] => {
  return options.map((opt) => {
    return {
      label: opt.description,
      value: encodeURIComponent(opt.reference), // this is used in checkbox input name
      children: opt.children ? normalizeFilters(opt.children) : undefined
    };
  });
};

const filterOptionCount = (options: FilterValues[]): number => {
  return options.reduce((count, opt) => {
    const childCount = opt.children ? filterOptionCount(opt.children) : 0;
    return count + childCount + 1;
  }, 0);
};

export const Filters = (props: FiltersProps) => {
  const { filters, title, selected, preview, dataset } = props;
  const { buildUrl, i18n } = useLocals();

  const activeFilters = selected?.length > 0;

  const clearFiltersLink = preview
    ? buildUrl(`/publish/${dataset.id}/cube-preview`, i18n.language)
    : buildUrl(`/${dataset.id}`, i18n.language);

  return (
    <div className="filters-container">
      <div className="filters-head">
        <h2 className="govuk-heading-m">{title}</h2>
        {!!activeFilters && (
          <a href={clearFiltersLink} className={'clear-filters'}>
            <T>filters.clear</T>
          </a>
        )}
      </div>

      {filters?.map((filter, index) => {
        const values = selected?.find((f) => f.columnName === filter.factTableColumn)?.values;
        const filtered = values?.length;
        const total = filterOptionCount(filter.values);

        return (
          <div className="filters" id={`filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`} key={index}>
            <h3 className="region-subhead">
              {filter.columnName} (
              <T filtered={filtered} total={total} className={clsx('filtered-label', { 'js-hidden': !filtered })} raw>
                filters.summary
              </T>
              <T total={total} className={clsx('non-filtered-label', { 'js-hidden': filtered })} raw>
                filters.non-filtered-summary
              </T>
              )
            </h3>
            <div className="filter-container option-select">
              <div className="padding-box">
                <div className="filter-search js-hidden">
                  <input
                    type="text"
                    className="govuk-input filter-search-input"
                    placeholder="Search..."
                    aria-label={`Search ${filter.columnName}`}
                  />
                </div>
                <div className="filter-head non-js-hidden">
                  <Controls
                    className="parent-controls"
                    selectAllLabel={
                      <T columnName={filter.columnName} raw>
                        filters.select_all
                      </T>
                    }
                    noneLabel={
                      <T columnName={filter.columnName} raw>
                        filters.none
                      </T>
                    }
                  />
                  <div className="govuk-checkboxes--small">
                    <Checkbox
                      checked={!values}
                      label={
                        <T columnName={filter.columnName} raw>
                          filters.no_filter
                        </T>
                      }
                      name={`filter-${filter.factTableColumn}-all`}
                      value="all"
                      omitName
                      values={Array.isArray(values) ? values : []}
                    />
                  </div>
                </div>
              </div>
              <div className="filter-body">
                <CheckboxGroup
                  name={`filter[${filter.factTableColumn}]`}
                  options={normalizeFilters(filter.values)}
                  values={values ?? []}
                  independentExpand
                />
              </div>
            </div>
          </div>
        );
      })}
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
          (() => {
            function addListeners(filter) {
              const name = filter.getAttribute("id");
              const checkboxId = name.trim() + "-all";
              const allCheckbox = filter.querySelector(".filter-head input#" + checkboxId);
              const selectedLabel = filter.querySelector("span.number-selected");
              const filteredLabel = filter.querySelector("span.filtered-label");
              const nonFilteredLabel = filter.querySelector("span.non-filtered-label");
              const childDetails = filter.querySelectorAll("details") || [];

              const childCheckboxes = [...filter.querySelectorAll('.filter-body [type="checkbox"]')];

              function checkState() {
                const anyChecked = childCheckboxes.some(c => c.checked);
                allCheckbox.checked = !anyChecked;
                updateTotals();
              }

              childCheckboxes.forEach(checkbox => checkbox.addEventListener("change", checkState));

              function updateTotals() {
                const numChecked = childCheckboxes.reduce((sum, check) => sum + (check.checked ? 1 : 0), 0);
                selectedLabel.innerText = numChecked;
                if (numChecked) {
                  filteredLabel.classList.remove("js-hidden");
                  nonFilteredLabel.classList.add("js-hidden");
                } else {
                  filteredLabel.classList.add("js-hidden");
                  nonFilteredLabel.classList.remove("js-hidden");
                }
              }

              allCheckbox.addEventListener("change", (e) => {
                if (e.target.checked) {
                  childCheckboxes.filter(c => c.checked).forEach(c => {
                    const event = new MouseEvent("click", {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                    });
                    c.dispatchEvent(event);
                  });
                  // collapse children
                  childDetails.forEach(el => el.removeAttribute("open"))
                }
                e.target.checked = true;
                updateTotals();
              });
            }

            const filters = document.querySelectorAll(".filters");

            filters.forEach(filter => {
              const head = filter.querySelector(".filter-container > .filter-head");

              addListeners(filter);

              // Show search input if more than 8 checkboxes
              const allCheckboxes = filter.querySelectorAll('.filter-body [type="checkbox"]');
              const filterSearch = filter.querySelector('.filter-search');
              if (allCheckboxes.length > 8 && filterSearch) {
                filterSearch.classList.remove('js-hidden');

                // Add search functionality
                const searchInput = filterSearch.querySelector('.filter-search-input');
                const filterBody = filter.querySelector('.filter-body');

                // Cache DOM queries outside the debounce
                const checkboxItems = filterBody.querySelectorAll('.govuk-checkboxes__item');
                const detailsElements = filterBody.querySelectorAll('details');
                let debounceTimer;

                searchInput.addEventListener('input', (e) => {
                  clearTimeout(debounceTimer);

                  debounceTimer = setTimeout(() => {
                    const searchTerm = e.target.value.toLowerCase().trim();

                    if (searchTerm === '') {
                      // Reset: show all and collapse
                      checkboxItems.forEach(item => item.style.display = '');
                      detailsElements.forEach(details => {
                        details.style.display = '';
                        details.removeAttribute('open');
                      });
                      return;
                    }

                    // Mark matching items and their parent details elements
                    const matchingItems = new Set();
                    const matchingDetails = new Set();

                    checkboxItems.forEach(item => {
                      const label = item.querySelector('label');
                      if (label && label.textContent.toLowerCase().includes(searchTerm)) {
                        matchingItems.add(item);

                        // Walk up the details tree and mark parents
                        let parent = item.closest('details');
                        while (parent && filterBody.contains(parent)) {
                          matchingDetails.add(parent);
                          const parentItem = parent.querySelector(':scope > summary > .govuk-checkboxes__item');
                          if (parentItem) matchingItems.add(parentItem);
                          parent = parent.parentElement.closest('details');
                        }
                      }
                    });

                    // Apply visibility changes
                    checkboxItems.forEach(item => {
                      item.style.display = matchingItems.has(item) ? '' : 'none';
                    });

                    detailsElements.forEach(details => {
                      if (matchingDetails.has(details)) {
                        details.style.display = '';
                        details.setAttribute('open', true);
                      } else {
                        details.style.display = 'none';
                        details.removeAttribute('open');
                      }
                    });
                  }, 250);
                });
              }

              const filterBody = filter.querySelector(".filter-body");
              const parentControls = filter.querySelector(".parent-controls");

              filterBody.insertBefore(parentControls, filterBody.firstChild);

              const controls = filter.querySelectorAll(".controls");

              controls.forEach(control => {
                const selectAll = control.querySelector("[data-action='select-all']");
                const clear = control.querySelector("[data-action='clear']");

                const parent = control.parentNode.parentNode;

                const selectors = [
                  // nested items with children
                  ":scope > .indent > .govuk-checkboxes > details > summary > .govuk-checkboxes__item > input[type='checkbox']",
                  // nested items without children
                  ":scope > .indent > .govuk-checkboxes .govuk-checkboxes__item > input[type='checkbox']",
                  // top-level items with children
                  ":scope > .filter-body > .govuk-checkboxes > details > summary > .govuk-checkboxes__item > input[type='checkbox']:not(.all-filter)",
                  // top-level items without children
                  ":scope > .filter-body > .govuk-checkboxes .govuk-checkboxes__item > input[type='checkbox']:not(.all-filter)",
                ];
                const checkboxes = parent.querySelectorAll(selectors.join(", "));
                const details = parent.querySelectorAll("details") || [];

                selectAll.addEventListener("click", (e) => {
                  e.preventDefault();
                  checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                    const evt = new Event("change");
                    checkbox.dispatchEvent(evt);
                  });
                  // expand all children
                  details.forEach(el => {
                    el.setAttribute("open", true);
                  })
                  return false;
                });

                clear.addEventListener("click", (e) => {
                  e.preventDefault();

                  checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    const evt = new Event("change");
                    checkbox.dispatchEvent(evt);
                  });
                  // collapse all children
                  details.forEach(el => {
                    el.removeAttribute("open");
                  })

                  return false;
                })
              });
            });
          })();
          `
        }}
      />
    </div>
  );
};
