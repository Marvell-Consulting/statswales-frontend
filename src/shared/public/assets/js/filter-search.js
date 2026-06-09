// Progressive enhancement for high-cardinality dimension filters (thousands of
// values). The server embeds the full value list as JSON and renders a capped
// no-JS checkbox fallback. Here we replace that fallback with a typeahead +
// chips selector so only a handful of nodes are ever in the DOM.
//
// Selection model (mirrors the plain checkbox filters):
//   - "all"  → dimension not filtered; submits a filter_all[col]=1 sentinel
//   - "some" → submits one filter[col].<value>[] hidden input per chosen value
//   - "none" → submits nothing; the server reports "select at least 1 value"
(() => {
  if (typeof accessibleAutocomplete === 'undefined') return; // library missing: keep no-JS fallback

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const form = document.querySelector('.filters-container')?.closest('form');
  const searchableFilters = [...document.querySelectorAll('.filter[data-searchable]')];

  searchableFilters.forEach((filterEl) => {
    const app = filterEl.querySelector('.filter-search-app');
    const optionsScript = filterEl.querySelector('script.filter-options-data');
    const stateScript = filterEl.querySelector('script.filter-state-data');
    const noJs = filterEl.querySelector('.filter-nojs');
    if (!app || !optionsScript || !stateScript) return;

    let options;
    let initial;
    try {
      options = JSON.parse(optionsScript.textContent); // [[label, value], [label, value, 1], ...]
      initial = JSON.parse(stateScript.textContent); // { state, selected: [value, ...] }
    } catch {
      return; // malformed data: leave the no-JS fallback in place
    }

    const column = filterEl.dataset.column;
    const total = Number(filterEl.dataset.total) || options.length;
    const inputId = `${filterEl.id}-search`;

    // value -> label lookup, and the searchable item list (excluding disabled)
    const labelOf = new Map();
    const items = [];
    options.forEach(([label, value, disabled]) => {
      labelOf.set(value, label);
      if (!disabled) items.push({ l: label, v: value });
    });

    // The no-JS checkboxes would otherwise submit too — remove them entirely.
    if (noJs) noJs.remove();
    app.hidden = false;
    app.classList.remove('js-only');

    const selected = new Map(); // value -> label, in insertion order
    let mode = initial.state === 'some' ? 'some' : initial.state === 'none' ? 'none' : 'all';
    if (mode === 'some') {
      (initial.selected || []).forEach((v) => selected.set(v, labelOf.get(v) ?? decodeURIComponent(v)));
    }

    const wrap = app.querySelector('.filter-search-input-wrap');
    const chipList = app.querySelector('.filter-chips');
    const countLabel = filterEl.querySelector('.number-selected');
    const placeholder = wrap?.dataset.placeholder || '';
    const ariaLabel = wrap?.dataset.aria || '';
    const noMatch = wrap?.dataset.noMatch || '';
    const removeLabel = wrap?.dataset.removeLabel || 'Remove';

    const updateCount = () => {
      if (countLabel) countLabel.textContent = String(mode === 'all' ? total : selected.size);
    };

    const fieldName = (value) => `filter[${column}].${value}[]`;

    const renderChips = () => {
      chipList.textContent = '';
      selected.forEach((label, value) => {
        const li = document.createElement('li');
        li.className = 'filter-chip';

        const text = document.createElement('span');
        text.className = 'filter-chip__label';
        text.textContent = label;

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'filter-chip__remove';
        remove.setAttribute('aria-label', `${removeLabel} ${label}`);
        remove.innerHTML = '<span aria-hidden="true">×</span>';
        remove.addEventListener('click', () => {
          selected.delete(value);
          if (selected.size === 0) mode = 'none';
          renderChips();
          updateCount();
        });

        const field = document.createElement('input');
        field.type = 'hidden';
        field.name = fieldName(value);
        field.value = value;

        li.append(text, remove, field);
        chipList.appendChild(li);
      });
    };

    const addSelection = (value, label) => {
      if (!value || selected.has(value)) return;
      selected.set(value, label ?? labelOf.get(value) ?? value);
      mode = 'some';
      renderChips();
      updateCount();
    };

    // Controls: select all / clear
    app.querySelector('.filter-search-select-all')?.addEventListener('click', () => {
      selected.clear();
      mode = 'all';
      renderChips();
      updateCount();
    });
    app.querySelector('.filter-search-clear')?.addEventListener('click', () => {
      selected.clear();
      mode = 'none';
      renderChips();
      updateCount();
    });

    // Typeahead
    accessibleAutocomplete({
      element: wrap,
      id: inputId,
      minLength: 1,
      confirmOnBlur: false,
      autoselect: false,
      showNoOptionsFound: true,
      placeholder,
      tNoResults: () => noMatch,
      source: (query, populateResults) => {
        const q = query.trim().toLowerCase();
        if (!q) return populateResults([]);
        const out = [];
        for (let i = 0; i < items.length && out.length < 50; i++) {
          const it = items[i];
          if (selected.has(it.v)) continue;
          if (it.l.toLowerCase().includes(q)) out.push(it);
        }
        populateResults(out);
      },
      templates: {
        inputValue: () => '', // keep the box clear so the next value can be searched
        suggestion: (it) => (typeof it === 'string' ? escapeHtml(it) : escapeHtml(it.l))
      },
      onConfirm: (it) => {
        if (!it) return;
        addSelection(it.v, it.l);
        const input = document.getElementById(inputId);
        if (input) {
          input.value = '';
          input.focus();
        }
      }
    });

    const input = document.getElementById(inputId);
    if (input && ariaLabel) input.setAttribute('aria-label', ariaLabel);

    renderChips();
    updateCount();

    // Keep a sentinel input in sync so "all selected" submits as "not filtered".
    const sentinelName = `filter_all[${column}]`;
    if (form) {
      form.addEventListener('submit', () => {
        app.querySelector(`input[name="${CSS.escape(sentinelName)}"]`)?.remove();
        if (mode === 'all') {
          const sentinel = document.createElement('input');
          sentinel.type = 'hidden';
          sentinel.name = sentinelName;
          sentinel.value = '1';
          app.appendChild(sentinel);
        }
      });
    }
  });
})();
