'use strict';

const { page, esc } = require('../layout');
const C = require('../components');
const { icons, categoryPhoto } = require('../art');
const { categories, researchAreas, products, articles, lots } = require('../data');

/* ------------------------------------------------------------- filter rail */

function filterGroup(title, items, open = true) {
  return `<div class="fgroup">
    <button class="fgroup__btn" type="button" aria-expanded="${open}" data-fgroup>
      ${esc(title)}<span class="acc__icon" aria-hidden="true"></span>
    </button>
    <div class="fgroup__panel" data-open="${open}"><div><div class="inner">
      ${items
        .map(
          (i) => `<label class="check">
        <input type="checkbox"${i.checked ? ' checked' : ''}>
        <span>${esc(i.label)}${i.n !== undefined ? `<span class="check__count">${i.n}</span>` : ''}</span>
      </label>`
        )
        .join('')}
    </div></div></div>
  </div>`;
}

function filters(activeCat) {
  return `<aside class="filters" data-filters data-open="false" aria-label="Filter products">
    <div class="filters__inner">
      <div class="filters__head">
        <h2>Filters</h2>
        <button class="btn-text" type="button">Clear all</button>
        <button class="modal__close filters__close" type="button" data-filters-close aria-label="Close filters">${icons.close}</button>
      </div>
      ${filterGroup('Category', categories.map((c) => ({ label: c.name, n: c.count, checked: c.slug === activeCat })))}
      ${filterGroup('Research area', researchAreas.map((a) => ({ label: a, n: products.filter((p) => p.area === a).length })))}
      ${filterGroup('Form', [
        { label: 'Lyophilised powder', n: 19 },
        { label: 'Solution', n: 0 },
        { label: 'Blend', n: 2 },
      ])}
      ${filterGroup('Available size', [
        { label: '1–2 mg', n: 6 }, { label: '5 mg', n: 9 }, { label: '10 mg', n: 11 },
        { label: '20–50 mg', n: 6 }, { label: '100 mg +', n: 3 },
      ], false)}
      ${filterGroup('Availability', [
        { label: 'In stock', n: 17 }, { label: 'Low stock', n: 2 }, { label: 'Backorder', n: 1 },
      ], false)}
      ${filterGroup('Documentation', [
        { label: 'Certificate available', n: 20 }, { label: 'Mass spectrometry data', n: 19 },
        { label: 'Multiple lots on file', n: 6 },
      ], false)}
      ${filterGroup('Product type', [
        { label: 'Single compound', n: 18 }, { label: 'Blend', n: 2 }, { label: 'Reference standard', n: 3 },
      ], false)}
      <div class="filters__apply">
        <button class="btn btn--secondary" type="button" data-filters-close>Cancel</button>
        <button class="btn btn--primary" style="flex:1" type="button" data-filters-close>Show 20 products</button>
      </div>
    </div>
  </aside>`;
}

function toolbar(count, opts = {}) {
  return `<div class="toolbar">
    <div class="toolbar__left">
      <button class="btn btn--secondary btn--sm filter-fab" type="button" data-filters-open>${icons.filter} Filters</button>
      <form class="searchbar" style="flex:1;max-width:340px" action="/search/" method="get" role="search">
        <span class="searchbar__icon">${icons.search}</span>
        <label class="visually-hidden" for="within">Search within results</label>
        <input id="within" name="q" type="search" placeholder="${esc(opts.placeholder || 'Search within products')}">
      </form>
    </div>
    <div class="toolbar__right">
      <span class="results-count">${count} results</span>
      <label class="visually-hidden" for="sort">Sort products</label>
      <select class="select" id="sort" style="width:auto;min-width:170px">
        <option>Sort: Featured</option>
        <option>Name A–Z</option>
        <option>Newest first</option>
        <option>Price, low to high</option>
        <option>Price, high to low</option>
      </select>
      <div class="viewtoggle" role="group" aria-label="Result layout">
        <button type="button" aria-pressed="${opts.view !== 'list'}" data-view="grid" aria-label="Grid view">${icons.grid}</button>
        <button type="button" aria-pressed="${opts.view === 'list'}" data-view="list" aria-label="List view">${icons.list}</button>
      </div>
    </div>
  </div>`;
}

function resultsArea(list, view) {
  return `
  <div data-results-grid${view === 'list' ? ' hidden' : ''}>
    <div class="product-grid">${list.map(C.productCard).join('')}</div>
  </div>
  <div data-results-list${view !== 'list' ? ' hidden' : ''} style="padding-top:8px">
    ${list.map(C.productRow).join('')}
  </div>`;
}

/* --------------------------------------------------------- products landing */

function productsLanding() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Products' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Catalogue</span>
    <h1>Research materials</h1>
    <p>
      Synthetic peptides and related compounds supplied to laboratories for in-vitro and preclinical
      research. Specifications, available sizes and lot documentation are published on every product page.
    </p>
    <div class="row" style="margin-top:24px;gap:8px">
      <span class="results-count">${products.length} products</span>
      <span class="utility__sep" style="background:var(--rule)"></span>
      <span class="results-count">${lots.filter((l) => l.status === 'available').length} lots documented</span>
    </div>
  </div>
</div>

<section class="section section--tight">
  <div class="wrap">
    ${C.sectionHead({ title: 'Browse by category', action: { label: 'Research areas', href: '/applications/' } })}
    <div class="grid grid-3">${categories.map(C.categoryPanel).join('')}</div>
  </div>
</section>

<section id="quick-order" class="finder">
  <div class="wrap finder__inner">
    <div>
      <span class="eyebrow">Quick order</span>
      <h2 style="font-size:var(--t-h3)">Order by SKU or paste a list</h2>
      <p class="muted small" style="margin-top:10px;max-width:42ch">
        Enter one SKU and quantity per line, for example <span class="mono">PP-1001, 10 mg, 2</span>.
        Lines are validated against the catalogue before the order is created.
      </p>
    </div>
    <div>
      <label class="field__label" for="bulk">Order lines</label>
      <textarea class="textarea input--mono" id="bulk" rows="4" placeholder="PP-1001, 10 mg, 2&#10;PP-1003, 50 mg, 1"></textarea>
      <div class="row" style="margin-top:12px">
        <button class="btn btn--primary" type="button" data-toast="3 lines validated and added to your order">Add to order</button>
        <a class="btn-text" href="/products/">Browse the catalogue instead</a>
      </div>
    </div>
  </div>
</section>

<div class="wrap catalog">
  ${filters()}
  <div>
    ${toolbar(products.length)}
    <div class="applied">
      <span class="label" style="display:inline">Applied</span>
      <span class="chip">In stock<button type="button" aria-label="Remove filter: in stock">${icons.close}</button></span>
      <span class="chip">Certificate available<button type="button" aria-label="Remove filter: certificate available">${icons.close}</button></span>
    </div>
    ${resultsArea(products, 'grid')}
    ${C.pager(1, 2, '/products/')}
  </div>
</div>`;

  return page({
    title: 'Research materials catalogue',
    description: 'Browse Purely Peptides research peptides and related materials. Specifications, purity data and lot-specific certificates published for every product.',
    canonical: '/products/',
    active: 'Products',
    body,
  });
}

/* ------------------------------------------------------------- category page */

function categoryPage(cat) {
  const list = products.filter((p) => p.category === cat.slug);
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Products', href: '/products/' }, { label: cat.name }])}

<div class="pagehead pagehead--media">
  <div class="wrap pagehead__split">
    <div>
      <span class="eyebrow">${esc(cat.name)}</span>
      <h1>${esc(cat.name)}</h1>
      <p>${esc(cat.blurb)} Every listed material is supplied with the analytical record for its production lot.</p>
      <div class="row" style="margin-top:24px"><span class="results-count">${list.length} products in this category</span></div>
    </div>
    <div class="pagehead__media">${categoryPhoto(cat.slug)}</div>
  </div>
</div>

<div class="wrap catalog">
  ${filters(cat.slug)}
  <div>
    ${toolbar(list.length, { placeholder: `Search within ${cat.name.toLowerCase()}` })}
    ${resultsArea(list, 'grid')}
    ${list.length === 0 ? `<div class="empty" style="margin-top:24px">
      <h3>No products match these filters</h3>
      <p>Clear one or more filters, or tell us what you are looking for and we will confirm whether it can be sourced.</p>
      <a class="btn btn--secondary" href="/contact/?topic=product">Request a material</a>
    </div>` : ''}
  </div>
</div>

<section class="section section--mist">
  <div class="wrap">
    ${C.sectionHead({ title: 'Related reading', action: { label: 'Research library', href: '/research/' } })}
    <div class="grid grid-3">${articles.slice(0, 3).map(C.researchCard).join('')}</div>
  </div>
</section>`;

  return page({
    title: cat.name,
    description: `${cat.blurb} Browse the ${cat.name.toLowerCase()} catalogue at Purely Peptides.`,
    canonical: `/products/category/${cat.slug}/`,
    active: 'Products',
    body,
  });
}

/* ------------------------------------------------------------- search page */

function searchPage() {
  const q = 'BPC-157';
  const matched = products.filter((p) => /bpc|repair/i.test(p.name + p.slug + p.area));
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Search' }])}

<div class="pagehead">
  <div class="wrap">
    <h1>Search results</h1>
    <p>
      <span class="results-count">${matched.length + 2} results for</span>
      <strong class="mono" style="font-size:var(--t-body-lg)">“${esc(q)}”</strong>
    </p>
    <form class="searchbar" action="/search/" method="get" role="search" style="max-width:620px;margin-top:20px">
      <span class="searchbar__icon">${icons.search}</span>
      <label class="visually-hidden" for="sp">Refine your search</label>
      <input id="sp" name="q" type="search" value="${esc(q)}" placeholder="Search products, CAS, SKU, articles or lot numbers">
      <button class="btn btn--dark" type="submit">Search</button>
    </form>
  </div>
</div>

<div class="wrap searchpage">
  <div class="search-scope tabs" role="tablist" aria-label="Result type">
    <button role="tab" aria-selected="true">All (${matched.length + 2})</button>
    <button role="tab" aria-selected="false">Products (${matched.length})</button>
    <button role="tab" aria-selected="false">Documentation (1)</button>
    <button role="tab" aria-selected="false">Research (1)</button>
  </div>

  <h2 class="label" style="margin:24px 0 12px">Products</h2>
  ${matched.map(C.productRow).join('')}

  <h2 class="label" style="margin:40px 0 12px">Documentation</h2>
  <table class="dtable dtable--stack">
    <thead><tr><th>Product</th><th>Lot</th><th>Size</th><th>Test date</th><th>Purity</th><th>Status</th><th>Certificate</th></tr></thead>
    <tbody>${lots.filter((l) => l.slug === 'bpc-157').map(C.lotRow).join('')}</tbody>
  </table>

  <h2 class="label" style="margin:40px 0 16px">Research</h2>
  <div class="grid grid-3">${articles.slice(0, 3).map(C.researchCard).join('')}</div>

  <div class="empty" style="margin-top:56px">
    <h3>Not finding it?</h3>
    <p>If a compound is not listed, send the sequence or CAS number and we will confirm whether it can be sourced and documented.</p>
    <a class="btn btn--primary" href="/contact/?topic=product">Request a material</a>
  </div>
</div>`;

  return page({
    title: `Search results for ${q}`,
    description: 'Search Purely Peptides research materials, batch documentation and technical articles by name, CAS number, SKU or lot.',
    canonical: '/search/',
    active: null,
    body,
  });
}

module.exports = { productsLanding, categoryPage, searchPage, filters, toolbar };
