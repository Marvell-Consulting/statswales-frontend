import React from 'react';
import { FilterTable } from '../../dtos/filter-table';
import { Checkbox, CheckboxGroup, CheckboxOptions, Controls } from './CheckboxGroup';
import qs from 'qs';
import { flatten, get } from 'lodash';
import clsx from 'clsx';
import T from './T';

export type FiltersProps = {
  filters: FilterTable[];
  url: string;
  title: string;
};

const normalizeFilters = (options: FilterTable['values']): CheckboxOptions[] => {
  return options.map((opt) => {
    return {
      label: opt.description,
      value: opt.description,
      children: opt.children ? normalizeFilters(opt.children) : undefined
    };
  });
};

const filterOptionCount = (options: FilterTable['values']): number => {
  return options.reduce((count, opt) => {
    const childCount = opt.children ? filterOptionCount(opt.children) : 0;
    return count + childCount + 1;
  }, 0);
};

export const Filters = ({ filters, url, title }: FiltersProps) => {
  const parsedFilter = qs.parse(url.split('?')[1])?.filter;
  const activeFilters = parsedFilter && flatten(Object.values(parsedFilter)).length;
  return (
    <div className="filters-container">
      <div className="filters-head">
        <h2 className="govuk-heading-m">{title}</h2>
        {!!activeFilters && (
          <button type="submit" name="_clear" value="filter" className={'clear-filters'}>
            <T>filters.clear</T>
          </button>
        )}
      </div>

      {filters?.map((filter, index) => {
        const values = get(parsedFilter, filter.columnName);

        const filtered = values?.length;
        const total = filterOptionCount(filter.values);

        return (
          <div className="filters" id={`filter-${filter.factTableColumn}`} key={index}>
            <h3 className="region-subhead">
              {filter.columnName} (
              <T filtered={filtered} total={total} className={clsx('filtered-label', { 'js-hidden': !filtered })} raw>
                filters.summary
              </T>
              <span className={clsx('non-filtered-label', { 'js-hidden': filtered })}>{total}</span>)
            </h3>
            <div className="filter-container option-select">
              <div className="padding-box">
                <div className="filter-head non-js-hidden">
                  <Controls
                    className="parent-controls"
                    selectAllLabel={<T>filters.select_all</T>}
                    noneLabel={<T>filters.none</T>}
                  />
                  <div className="govuk-checkboxes--small">
                    <Checkbox
                      checked={!values}
                      label={<T>filters.no_filter</T>}
                      name={`filter-${filter.factTableColumn}-all`}
                      value="all"
                      omitName
                      values={Array.isArray(values) ? values : [values]}
                    />
                  </div>
                </div>
              </div>
              <div className="filter-body">
                <CheckboxGroup
                  name={`filter[${filter.columnName}]`}
                  options={normalizeFilters(filter.values)}
                  values={Array.isArray(values) ? values : [values]}
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
              const checkboxId = name + "-all";
              const allCheckbox = filter.querySelector(".filter-head input#" + checkboxId);
              const selectedLabel = filter.querySelector("span.number-selected");
              const filteredLabel = filter.querySelector("span.filtered-label");
              const nonFilteredLabel = filter.querySelector("span.non-filtered-label");

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
                }
                e.target.checked = true;
                updateTotals();
              });
            }

            const filters = document.querySelectorAll(".filters");

            filters.forEach(filter => {
              const head = filter.querySelector(".filter-container > .filter-head");

              addListeners(filter);

              const filterBody = filter.querySelector(".filter-body");
              const parentControls = filter.querySelector(".parent-controls");

              filterBody.insertBefore(parentControls, filterBody.firstChild);

              const controls = filter.querySelectorAll(".controls");

              controls.forEach(control => {
                const selectAll = control.querySelector("[data-action='select-all']");
                const clear = control.querySelector("[data-action='clear']");

                const details = control.parentNode.parentNode;
                const selectors = [
                  // nested items with children
                  ":scope > .indent > .govuk-checkboxes > details > summary > .govuk-checkboxes__item > input[type='checkbox']",
                  // nested items without children
                  ":scope > .indent > .govuk-checkboxes > .govuk-checkboxes__item > input[type='checkbox']",
                  // top-level items with children
                  ":scope > .filter-body > .govuk-checkboxes > details > summary > .govuk-checkboxes__item > input[type='checkbox']:not(.all-filter)",
                  // top-level items without children
                  ":scope > .filter-body > .govuk-checkboxes > .govuk-checkboxes__item > input[type='checkbox']:not(.all-filter)",
                ];
                const checkboxes = details.querySelectorAll(selectors.join(", "));

                selectAll.addEventListener("click", (e) => {
                  e.preventDefault();
                  checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                    const evt = new Event("change");
                    checkbox.dispatchEvent(evt);
                  });
                  if (details.tagName === "DETAILS") {
                    details.setAttribute("open", true);
                  }
                  return false;
                });

                clear.addEventListener("click", (e) => {
                  e.preventDefault();

                  checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    const evt = new Event("change");
                    checkbox.dispatchEvent(evt);
                  });
                
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
