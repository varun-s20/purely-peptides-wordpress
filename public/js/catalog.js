/* =========================================================================
   Purely Peptides - catalogue filtering, sorting and quick order.

   The catalogue page already ships every product in the DOM, so filtering is a
   matter of hiding rows rather than fetching anything. The facts each filter
   needs are on the card itself (data-cat, data-area, data-form, data-stock,
   data-price, data-added), which keeps a second copy of the catalogue out of
   this file.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Each block guards itself. An early return here would skip the search and
     certificate lookup further down, which live on pages that have no
     product grid. */
  var grid = $('[data-results-grid]');
  var list = $('[data-results-list]');

  var gridHost = grid ? $('.product-grid', grid) : null;
  var listHost = list;

  function cards() {
    return (grid ? $$('.pcard', grid) : []).concat(list ? $$('.prow', list) : []);
  }

  /* ------------------------------------------------------------- filtering */

  function activeFilters() {
    var sets = {};
    $$('[data-filter]:checked').forEach(function (input) {
      var facet = input.getAttribute('data-filter');
      (sets[facet] = sets[facet] || []).push(input.value);
    });
    return sets;
  }

  function matchesFacets(el, sets) {
    for (var facet in sets) {
      if (!Object.prototype.hasOwnProperty.call(sets, facet)) continue;
      var want = sets[facet];
      var has = el.getAttribute('data-' + facet) || '';
      // Form is matched loosely: "Lyophilised powder" should catch a card
      // whose form reads "Lyophilised powder, sterile filtered".
      var hit = facet === 'form'
        ? want.some(function (v) { return has.toLowerCase().indexOf(String(v).toLowerCase().split(' ')[0]) !== -1; })
        : want.indexOf(has) !== -1;
      if (!hit) return false;
    }
    return true;
  }

  function matchesQuery(el, q) {
    if (!q) return true;
    var hay = [
      el.getAttribute('data-name'), el.getAttribute('data-sku'),
      el.getAttribute('data-cas'), el.getAttribute('data-area'),
      el.getAttribute('data-form'), el.textContent
    ].join(' ').toLowerCase();
    // every word must appear somewhere, so "bpc 5 mg" narrows rather than widens
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  /* --------------------------------------------------------------- sorting */

  var SORTS = {
    featured: null, // the order the page was built in
    name: function (a, b) { return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')); },
    newest: function (a, b) { return (b.getAttribute('data-added') || '').localeCompare(a.getAttribute('data-added') || ''); },
    'price-asc': function (a, b) { return (+a.getAttribute('data-price')) - (+b.getAttribute('data-price')); },
    'price-desc': function (a, b) { return (+b.getAttribute('data-price')) - (+a.getAttribute('data-price')); }
  };

  // Remember the served order so "Featured" can be restored without a reload.
  var originalGrid = gridHost ? $$('.pcard', gridHost) : [];
  var originalList = listHost ? $$('.prow', listHost) : [];

  function applySort(key) {
    var cmp = SORTS[key];
    function reorder(host, nodes) {
      if (!host) return;
      var order = cmp ? nodes.slice().sort(cmp) : nodes;
      order.forEach(function (n) { host.appendChild(n); });
    }
    reorder(gridHost, originalGrid);
    reorder(listHost, originalList);
  }

  /* ---------------------------------------------------------------- apply */

  function apply() {
    var sets = activeFilters();
    var within = $('[data-within]');
    var q = within ? within.value.trim() : '';
    var shown = 0;
    var seen = {};

    cards().forEach(function (el) {
      var on = matchesFacets(el, sets) && matchesQuery(el, q);
      el.hidden = !on;
      if (on && !seen[el.getAttribute('data-slug')]) { seen[el.getAttribute('data-slug')] = 1; shown++; }
    });

    var count = $('[data-results-count]');
    if (count) count.textContent = shown + (shown === 1 ? ' result' : ' results');

    var empty = $('[data-results-empty]');
    if (empty) empty.hidden = shown > 0;

    var apply = $('[data-filters-apply]');
    if (apply) apply.textContent = 'Show ' + shown + (shown === 1 ? ' product' : ' products');
  }

  if (grid || list) {
  $$('[data-filter]').forEach(function (i) { i.addEventListener('change', apply); });

  var within = $('[data-within]');
  if (within) {
    within.addEventListener('input', apply);
    // The field sits in a form; submitting would reload and lose the filters.
    var form = within.closest('form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
  }

  var sort = $('[data-sort]');
  if (sort) sort.addEventListener('change', function () { applySort(sort.value); apply(); });

  var clear = $('[data-filters-clear]');
  if (clear) {
    clear.addEventListener('click', function () {
      $$('[data-filter]:checked').forEach(function (i) { i.checked = false; });
      if (within) within.value = '';
      if (sort) { sort.value = 'featured'; applySort('featured'); }
      apply();
    });
  }

  apply();
  }

  /* ----------------------------------------------------------- quick order

     "PP-1001, 10 mg, 2" per line. Every line is checked against the catalogue
     and reported back individually, because a paste of twenty lines with one
     typo should tell you which line, not just fail. */

  var bulkBtn = $('[data-bulk-add]');
  var bulkField = $('[data-bulk]');
  var report = $('[data-bulk-report]');

  if (bulkBtn && bulkField) {
    bulkBtn.addEventListener('click', function () {
      var cat = window.PP_CATALOGUE || [];
      var bySku = {};
      cat.forEach(function (p) { bySku[p.sku.toUpperCase()] = p; });

      var lines = bulkField.value.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      var okLines = [], bad = [];

      lines.forEach(function (raw, i) {
        var parts = raw.split(',').map(function (x) { return x.trim(); });
        var sku = (parts[0] || '').toUpperCase();
        var p = bySku[sku];
        if (!p) { bad.push('Line ' + (i + 1) + ': no product with SKU ' + (parts[0] || '(blank)')); return; }

        var sizeArg = parts[1] || '';
        var size = p.sizes.filter(function (s) {
          return s.label.toLowerCase().replace(/\s+/g, '') === sizeArg.toLowerCase().replace(/\s+/g, '');
        })[0];
        if (sizeArg && !size) {
          bad.push('Line ' + (i + 1) + ': ' + p.name + ' has no ' + sizeArg + ' size (' + p.sizes.map(function (s) { return s.label; }).join(', ') + ')');
          return;
        }
        var qty = parseInt(parts[2], 10);
        if (parts[2] && (isNaN(qty) || qty < 1)) { bad.push('Line ' + (i + 1) + ': quantity "' + parts[2] + '" is not a number'); return; }
        if (p.stock === 'out-of-stock') { bad.push('Line ' + (i + 1) + ': ' + p.name + ' is on backorder'); return; }

        okLines.push({ slug: p.slug, size: (size || p.sizes[0]).label, qty: qty || 1, mode: 'once', freq: null, name: p.name });
      });

      if (report) {
        report.hidden = false;
        report.innerHTML =
          (okLines.length ? '<p class="bulk-report__ok">' + okLines.length + (okLines.length === 1 ? ' line' : ' lines') + ' added to your order.</p>' : '') +
          (bad.length ? '<ul class="bulk-report__bad">' + bad.map(function (b) {
            return '<li>' + b.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</li>';
          }).join('') + '</ul>' : '') +
          (!lines.length ? '<p class="bulk-report__bad">Nothing to add - paste one SKU per line.</p>' : '');
      }

      if (okLines.length && window.PP && window.PP.addToCart) {
        okLines.forEach(function (l) { window.PP.addToCart(l); });
        if (window.PP.toast) {
          window.PP.toast(okLines.length + (okLines.length === 1 ? ' line' : ' lines') + ' added to your order');
        }
        bulkField.value = '';
      }
    });
  }

  /* ---------------------------------------------------------- search page

     The whole corpus is in the page; the query filters it. Reads ?q on load so
     a link or the header search lands on real results rather than a page that
     only ever knew one query. */

  var sInput = $('[data-search-input]');
  if (sInput) {
    var groups = [
      { key: 'products', host: $('[data-search-products]'), sel: '.prow' },
      { key: 'docs', host: $('[data-search-docs]'), sel: 'tr' },
      { key: 'research', host: $('[data-search-research]'), sel: '.rcard' }
    ].filter(function (g) { return g.host; });

    function runSearch(q) {
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      var total = 0;
      var counts = {};

      groups.forEach(function (g) {
        var n = 0;
        $$(g.sel, g.host).forEach(function (row) {
          var hay = row.textContent.toLowerCase();
          var on = !words.length || words.every(function (w) { return hay.indexOf(w) !== -1; });
          row.hidden = !on;
          if (on) n++;
        });
        counts[g.key] = n;
        total += n;
      });

      $$('[data-scope-count]').forEach(function (el) {
        var k = el.getAttribute('data-scope-count');
        el.textContent = k === 'all' ? total : (counts[k] || 0);
      });

      var countEl = $('[data-search-count]');
      if (countEl) countEl.textContent = total + (total === 1 ? ' result' : ' results');
      var echo = $('[data-search-echo]');
      if (echo) echo.textContent = q ? '\u201C' + q + '\u201D' : '';

      var empty = $('[data-search-empty]');
      if (empty) empty.hidden = total > 0;
      // A section with nothing in it is noise, so its heading goes too.
      groups.forEach(function (g) {
        var sec = g.host.closest('[data-scope]');
        if (sec) sec.hidden = counts[g.key] === 0;
      });
      applyScope();
    }

    var scope = 'all';
    function applyScope() {
      $$('[data-scope-tab]').forEach(function (b) {
        b.setAttribute('aria-selected', String(b.getAttribute('data-scope-tab') === scope));
      });
      $$('[data-scope]').forEach(function (sec) {
        var k = sec.getAttribute('data-scope');
        var hasRows = $$('[hidden]', sec).length < $$(k === 'docs' ? 'tr' : (k === 'products' ? '.prow' : '.rcard'), sec).length;
        sec.hidden = !hasRows || (scope !== 'all' && scope !== k);
      });
    }
    $$('[data-scope-tab]').forEach(function (b) {
      b.addEventListener('click', function () { scope = b.getAttribute('data-scope-tab'); applyScope(); });
    });

    var form = $('[data-search-form]');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); runSearch(sInput.value.trim()); });
    sInput.addEventListener('input', function () { runSearch(sInput.value.trim()); });
    var clearBtn = $('[data-search-clear]');
    if (clearBtn) clearBtn.addEventListener('click', function () { sInput.value = ''; runSearch(''); sInput.focus(); });

    var initial = (new URLSearchParams(location.search).get('q') || '').trim();
    sInput.value = initial;
    runSearch(initial);
  }

  /* ------------------------------------------------------ certificate lookup

     An exact lot number goes straight to its certificate - that is what the
     person typing a number off a vial label actually wants. Anything else
     filters the table. */

  var coaInput = $('#coa-q');
  if (coaInput) {
    var coaBody = $('.dtable tbody');
    var coaForm = coaInput.closest('form');

    function runCoa(q) {
      if (!coaBody) return;
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      var n = 0;
      $$('tr', coaBody).forEach(function (row) {
        var hay = row.textContent.toLowerCase();
        var on = !words.length || words.every(function (w) { return hay.indexOf(w) !== -1; });
        row.hidden = !on;
        if (on) n++;
      });
      var note = $('[data-coa-count]');
      if (note) {
        note.hidden = !q;
        note.textContent = n + (n === 1 ? ' record matches ' : ' records match ') + '\u201C' + q + '\u201D';
      }
      var none = $('[data-coa-empty]');
      if (none) none.hidden = n > 0;
    }

    function jumpIfExact(q) {
      var hit = null;
      $$('tr', coaBody || document.createElement('tbody')).forEach(function (row) {
        var cell = row.querySelector('.mono');
        // the row's first link is the product; the certificate is the one wanted
        if (cell && cell.textContent.trim().toLowerCase() === q.toLowerCase()) {
          hit = row.querySelector('a[href*="certificate"]');
        }
      });
      if (hit) { location.href = hit.getAttribute('href'); return true; }
      return false;
    }

    if (coaForm) {
      coaForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = coaInput.value.trim();
        if (q && jumpIfExact(q)) return;
        runCoa(q);
      });
    }
    coaInput.addEventListener('input', function () { runCoa(coaInput.value.trim()); });

    var fromUrl = (new URLSearchParams(location.search).get('lot') || '').trim();
    if (fromUrl) {
      coaInput.value = fromUrl;
      if (!jumpIfExact(fromUrl)) runCoa(fromUrl);
    }
  }

})();
