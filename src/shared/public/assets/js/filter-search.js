// Progressive enhancement for high-cardinality dimension filters (thousands of
// values). The server renders the first NO_JS_FILTER_CAP values as a normal
// checkbox list and embeds the full value list as JSON. Here we reveal the
// search box and let it reach values beyond the rendered cap: matches from the
// full list that aren't already on the page are injected as checkboxes.
//
// Selection is positive — ticking a box selects that value. The form carries an
// always-present filter_all sentinel, so an untouched filter submits as "not
// filtered" and ticked values apply via their filter[col].VALUE[] inputs. No
// submit-time JS is needed for that; this script only handles search and the
// selected-count label.
(() => {
  const RESULT_LIMIT = 100; // max out-of-cap matches injected per search

  document.querySelectorAll('.filter[data-searchable]').forEach((filterEl) => {
    const optionsScript = filterEl.querySelector('script.filter-options-data');
    const group = filterEl.querySelector('.filter-body .govuk-checkboxes');
    if (!optionsScript || !group) return;

    let options;
    try {
      options = JSON.parse(optionsScript.textContent); // [[label, value], [label, value, 1], ...]
    } catch {
      return; // malformed data: leave the rendered checkboxes as-is
    }

    const column = filterEl.dataset.column;
    const nameFor = (value) => `filter[${column}].${value}[]`;
    const all = options.map(([label, value, disabled]) => ({
      label,
      value,
      search: label.toLowerCase(),
      disabled: !!disabled
    }));

    const countLabel = filterEl.querySelector('.number-selected');
    const noMatch = filterEl.querySelector('.filter-search-no-match');
    const searchInput = filterEl.querySelector('.filter-search-input');

    // Values already on the page (the server-rendered first cap), plus any we inject.
    const rendered = new Set([...group.querySelectorAll('input[type="checkbox"]')].map((cb) => cb.value));
    const injected = [];

    const updateCount = () => {
      if (countLabel) countLabel.textContent = String(group.querySelectorAll('input:checked').length);
    };

    const wireCheckbox = (cb) => cb.addEventListener('change', updateCount);
    group.querySelectorAll('input[type="checkbox"]').forEach(wireCheckbox);

    const makeCheckbox = ({ label, value, disabled }) => {
      const item = document.createElement('div');
      item.className = 'govuk-checkboxes__item';
      item.dataset.injected = '1';

      const id = nameFor(value).replace(/\s+/g, '_');
      const input = document.createElement('input');
      input.className = 'govuk-checkboxes__input';
      input.id = id;
      input.name = nameFor(value);
      input.type = 'checkbox';
      input.value = value;
      input.disabled = disabled;
      wireCheckbox(input);

      const labelEl = document.createElement('label');
      labelEl.className = 'govuk-label govuk-checkboxes__label';
      labelEl.htmlFor = id;
      labelEl.textContent = label;

      item.append(input, labelEl);
      return item;
    };

    // Drop unchecked injected boxes so the DOM doesn't grow without bound;
    // keep checked ones — they're part of the selection and must keep submitting.
    const pruneInjected = () => {
      for (let i = injected.length - 1; i >= 0; i--) {
        const cb = injected[i].querySelector('input');
        if (!cb.checked) {
          rendered.delete(cb.value);
          injected[i].remove();
          injected.splice(i, 1);
        }
      }
    };

    const applySearch = (term) => {
      const q = term.trim().toLowerCase();
      pruneInjected();

      if (!q) {
        group.querySelectorAll('.govuk-checkboxes__item').forEach((item) => (item.style.display = ''));
        noMatch?.classList.add('js-hidden');
        return;
      }

      let matches = 0;

      // Filter the boxes already on the page by their label.
      group.querySelectorAll('.govuk-checkboxes__item').forEach((item) => {
        const label = item.querySelector('label');
        const hit = !!label && label.textContent.toLowerCase().includes(q);
        item.style.display = hit ? '' : 'none';
        if (hit) matches++;
      });

      // Pull in matches from the full list that aren't rendered yet.
      for (let i = 0; i < all.length && injected.length < RESULT_LIMIT; i++) {
        const opt = all[i];
        if (rendered.has(opt.value) || !opt.search.includes(q)) continue;
        group.appendChild(makeCheckbox(opt));
        rendered.add(opt.value);
        injected.push(group.lastChild);
        matches++;
      }

      noMatch?.classList.toggle('js-hidden', matches > 0);
    };

    // Reveal the search box (hidden by default so it never shows without JS).
    filterEl.querySelector('.filter-search')?.classList.remove('js-hidden');
    filterEl.querySelector('.filter-head')?.classList.remove('js-hidden');

    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        const value = e.target.value;
        debounce = setTimeout(() => applySearch(value), 200);
      });
    }

    // Clear selection: untick everything and drop injected boxes.
    filterEl.querySelector('.filter-search-clear')?.addEventListener('click', () => {
      group.querySelectorAll('input:checked').forEach((cb) => (cb.checked = false));
      if (searchInput) searchInput.value = '';
      applySearch('');
      updateCount();
    });

    updateCount();
  });
})();
