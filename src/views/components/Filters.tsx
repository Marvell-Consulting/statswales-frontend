import React from 'react';
import { FilterTable } from '../../dtos/filter-table';
import { Checkbox, CheckboxGroup, CheckboxOptions, Controls } from './CheckboxGroup';
import qs from 'qs';
import { get } from 'lodash';

export type FiltersProps = {
  filters: FilterTable[];
  url: string;
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

export const Filters = ({ filters, url }: FiltersProps) => {
  const parsedFilter = qs.parse(url.split('?')[1])?.filter;
  return (
    <>
      {filters?.map((filter, index) => {
        const values = get(parsedFilter, filter.columnName);

        return (
          <div className="filters" id={`filter-${filter.factTableColumn}`} key={index}>
            <h3 className="region-subhead">{`${filter.columnName} (${filterOptionCount(filter.values)})`}</h3>
            <div className="filter-container option-select">
              <div className="filter-head hidden">
                <Controls className="parent-controls" />
                <div className="govuk-checkboxes--small">
                  <Checkbox
                    checked={!values}
                    label="No filter"
                    name={`filter-${filter.factTableColumn}-all`}
                    value="all"
                    omitName
                    values={Array.isArray(values) ? values : [values]}
                  />
                  <hr />
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
              const allCheckbox = filter.querySelector(".filter-head input#" + checkboxId)

              const childCheckboxes = [...filter.querySelectorAll('.filter-body [type="checkbox"]')]

              function checkState() {
                const anyChecked = childCheckboxes.some(c => c.checked);

                allCheckbox.checked = !anyChecked
              }

              childCheckboxes.forEach(checkbox => checkbox.addEventListener("change", checkState));

              allCheckbox.addEventListener("change", (e) => {
                if (e.target.checked) {
                  childCheckboxes.filter(c => c.checked).forEach(c => {
                    const event = new MouseEvent("click", {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                    });
                    c.dispatchEvent(event)
                  })
                }
                e.target.checked = true;
              })
            }

            const filters = document.querySelectorAll(".filters");

            filters.forEach(filter => {
              const head = filter.querySelector(".filter-container > .filter-head");
              head.classList.remove("hidden");

              addListeners(filter);

              const filterBody = filter.querySelector(".filter-body")
              const parentControls = filter.querySelector(".parent-controls");

              filterBody.insertBefore(parentControls, filterBody.firstChild);

              const controls = filter.querySelectorAll(".controls");

              controls.forEach(control => {
                control.classList.remove("hidden");

                const selectAll = control.querySelector("[data-action='select-all']")
                const clear = control.querySelector("[data-action='clear']")

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
                ]
                const checkboxes = details.querySelectorAll(selectors.join(", "));

                selectAll.addEventListener("click", (e) => {
                  e.preventDefault();
                  checkboxes.forEach(checkbox => {
                    checkbox.checked = true
                    const evt = new Event("change")
                    checkbox.dispatchEvent(evt)
                  })
                  if (details.tagName === "DETAILS") {
                    details.setAttribute("open", true)
                  }
                  return false;
                })

                clear.addEventListener("click", (e) => {
                  e.preventDefault();

                  checkboxes.forEach(checkbox => {
                    checkbox.checked = false
                    const evt = new Event("change")
                    checkbox.dispatchEvent(evt)
                  })
                
                  return false;
                })
              });
            });
          })();
          `
        }}
      />
    </>
  );
};
