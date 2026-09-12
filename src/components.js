'use strict';

const { esc, money } = require('./layout');
const { icons, productShot, categoryPhoto, articlePhoto, chromatogram } = require('./art');
const { categories } = require('./data');

/* --------------------------------------------------------------- fragments */

const catName = (slug) => (categories.find((c) => c.slug === slug) || { name: 'Research material' }).name;

const stockBadge = (stock) => {
  if (stock === 'in-stock') return `<span class="status status--ok">${icons.check}In stock</span>`;
  if (stock === 'low-stock') return `<span class="status status--warn">${icons.alert}Low stock</span>`;
  return `<span class="status status--stop">${icons.close}Backorder</span>`;
};

// Reflects whether a certificate actually exists for that product. Our payment
// processor requires a lab report per product, and a badge that claims one
// where none is on file is the kind of thing that fails an underwriting review.
const docBadge = (p) =>
  p && p.hasCoa === false
    ? `<span class="status status--warn">${icons.clock}Lab report pending</span>`
    : `<span class="status status--flat">${icons.doc}Lab report</span>`;

function crumbs(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><div class="wrap"><ol>
    ${trail
      .map((t, i) =>
        i === trail.length - 1
          ? `<li aria-current="page">${esc(t.label)}</li>`
          : `<li><a href="${t.href}">${esc(t.label)}</a></li><li class="sep" aria-hidden="true">/</li>`
      )
      .join('')}
  </ol></div></nav>`;
}

function sectionHead({ title, body, action, id }) {
  return `<div class="section-head" data-reveal>
    <div class="section-head__text">
      <h2${id ? ` id="${id}"` : ''}>${title}</h2>
      ${body ? `<p>${body}</p>` : ''}
    </div>
    ${action ? `<a class="link-arrow" href="${action.href}"><span>${esc(action.label)}</span>${icons.arrow}</a>` : ''}
  </div>`;
}

/* ------------------------------------------------------------ product card */

const facets = (p) =>
  `data-slug="${p.slug}" data-cat="${p.category}" data-area="${esc(p.area)}" ` +
  `data-form="${esc(p.form)}" data-stock="${p.stock}" data-price="${p.sizes[0].price}" ` +
  `data-name="${esc(p.name)}" data-sku="${esc(p.sku)}" data-cas="${esc(p.cas)}" ` +
  `data-added="${p.added}" data-sizes="${esc(p.sizes.map((s) => s.label).join('|'))}"`;

function productCard(p) {
  const size = p.sizes[0];
  return `<article class="pcard" ${facets(p)}>
    <div class="pcard__media">${productShot(p.sku, p.name)}
      <button class="wishdot" type="button" data-wish-toggle="${p.slug}" data-wish-label="${esc(p.name)}" aria-pressed="false">${icons.heart}</button>
      <div class="pcard__quick">
        <button class="btn btn--primary btn--sm btn--block" type="button"
                data-add-to-order data-quick data-slug="${p.slug}" data-name="${esc(p.name)}"
                ${p.stock === 'out-of-stock' ? 'disabled' : ''}>
          ${p.stock === 'out-of-stock' ? 'Out of stock' : 'Add to order'}
        </button>
      </div>
    </div>
    <div class="pcard__body">
      <span class="tag">${esc(catName(p.category))}</span>
      <h3 class="pcard__name"><a href="/products/${p.slug}/">${esc(p.name)}</a></h3>
      <div class="pcard__meta">
        <span>CAS ${esc(p.cas)}</span>
        <span>${esc(p.sizes.map((s) => s.label).join(' · '))}</span>
      </div>
      <div class="row" style="gap:6px">${stockBadge(p.stock)}${docBadge(p)}</div>
      <div class="pcard__foot">
        <span class="pcard__price">${money(size.price)}<small>/ ${esc(size.label)}</small></span>
        <span class="link-arrow"><span>View</span>${icons.arrow}</span>
      </div>
    </div>
  </article>`;
}

/* ------------------------------------------------------------- product row */

function productRow(p) {
  const size = p.sizes[0];
  return `<article class="prow" ${facets(p)}>
    <div class="prow__media">${productShot(p.sku, p.name)}</div>
    <div class="prow__head">
      <h3 class="prow__name"><a href="/products/${p.slug}/">${esc(p.name)}</a></h3>
      <p class="prow__desc">${esc(p.summary)}</p>
      <div class="row" style="gap:6px;margin-top:10px">${stockBadge(p.stock)}${docBadge(p)}</div>
    </div>
    <div class="prow__cells" style="display:contents">
      <div class="prow__cell"><span class="label">CAS</span><span class="prow__val">${esc(p.cas)}</span></div>
      <div class="prow__cell"><span class="label">Form</span><span class="prow__val">${esc(p.form.replace(' powder', ''))}</span></div>
      <div class="prow__cell"><span class="label">Purity</span><span class="prow__val">${esc(p.purity)}</span></div>
    </div>
    <div class="prow__buy">
      <span class="pcard__price">${money(size.price)}<small>/ ${esc(size.label)}</small></span>
      <div class="row" style="gap:6px;flex-wrap:nowrap">
        <button class="btn btn--primary btn--sm" type="button" data-add-to-order data-quick
                data-slug="${p.slug}" data-name="${esc(p.name)}" ${p.stock === 'out-of-stock' ? 'disabled' : ''}>Add</button>
        <a class="btn btn--secondary btn--sm" href="/products/${p.slug}/">View</a>
      </div>
    </div>
  </article>`;
}

/* --------------------------------------------------------- category panel */

function categoryPanel(c) {
  return `<a class="cat-panel" href="/products/category/${c.slug}/">
    <div class="cat-panel__art">${categoryPhoto(c.slug)}</div>
    <h3 class="cat-panel__title">${esc(c.name)}</h3>
    <p class="cat-panel__blurb">${esc(c.blurb)}</p>
    <div class="cat-panel__foot">
      <span class="cat-panel__count">${c.count} materials</span>
      <span class="link-arrow"><span>Explore</span>${icons.arrow}</span>
    </div>
  </a>`;
}

/* --------------------------------------------------------- research card */

function researchCard(a) {
  return `<a class="rcard" href="/research/${a.slug}/">
    <div class="rcard__media">${articlePhoto(a.slug)}</div>
    <span class="rcard__cat">${esc(a.category)}</span>
    <h3 class="rcard__title">${esc(a.title)}</h3>
    <p class="rcard__excerpt">${esc(a.excerpt)}</p>
    <div class="rcard__meta">${esc(a.dateLabel)} · ${esc(a.readTime)} read</div>
  </a>`;
}

/* --------------------------------------------------------------- lot rows */

function lotRow(l) {
  const st =
    l.status === 'available'
      ? `<span class="status status--ok">${icons.check}Available</span>`
      : l.status === 'pending'
      ? `<span class="status status--warn">${icons.clock}Awaiting COA</span>`
      : `<span class="status status--flat">${icons.clock}Archived</span>`;
  return `<tr>
    <td data-label="Product"><a class="link" href="/products/${l.slug}/">${esc(l.product)}</a></td>
    <td data-label="Lot" class="mono">${esc(l.lot)}</td>
    <td data-label="Size" class="mono">${esc(l.size)}</td>
    <td data-label="Test date" class="mono">${esc(l.date)}</td>
    <td data-label="Purity" class="mono">${esc(l.purity)}</td>
    <td data-label="Status">${st}</td>
    <td data-label="Certificate">${l.doc
      ? `<a class="link-arrow" href="/certificates/${l.lot.toLowerCase()}/"><span>View</span>${icons.arrow}</a>`
      : '<span class="muted small">Pending</span>'}</td>
  </tr>`;
}

/* ------------------------------------------------------------ misc blocks */

function trustBar() {
  const items = [
    { icon: icons.doc, title: 'Batch-specific certificates', body: 'Documentation is issued against an individual production lot, not a product line.' },
    { icon: icons.chart, title: 'Analytical testing', body: 'Purity by reversed-phase HPLC and identity by mass spectrometry, reported per lot.' },
    { icon: icons.truck, title: 'US fulfilment', body: 'Orders ship from our US facility with tracked handling and cold-chain options.' },
    { icon: icons.flask, title: 'Research use only', body: 'Supplied to laboratories and research organisations for in-vitro investigation.' },
  ];
  return `<section class="trust" aria-labelledby="trust-heading">
    <div class="wrap">
      <h2 id="trust-heading" class="visually-hidden">Why researchers order from Purely Peptides Hub</h2>
      <div class="trust__grid">
      ${items
        .map(
          (i) => `<div class="trust__item">
        <div class="trust__icon">${i.icon.replace('width="18" height="18"', 'width="24" height="24"')}</div>
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.body)}</p>
      </div>`
        )
        .join('')}
    </div></div>
  </section>`;
}

function supportCards() {
  const cards = [
    { t: 'Product specifications', b: 'Questions on sequence, purity, solubility or handling for a specific material.', href: '/contact/?topic=product' },
    { t: 'Existing orders', b: 'Order status, tracking, amendments and delivery questions.', href: '/contact/?topic=order' },
    { t: 'Finding documentation', b: 'Locating a certificate for a lot you already hold, or a historical batch.', href: '/contact/?topic=documentation' },
    { t: 'Institutional ordering', b: 'Purchase orders, invoicing, bulk quantities and account pricing.', href: '/contact/?topic=wholesale' },
  ];
  return `<div class="grid grid-4">
    ${cards
      .map(
        (c) => `<div class="icard">
      <h3>${esc(c.t)}</h3>
      <p>${esc(c.b)}</p>
      <a class="link-arrow" href="${c.href}"><span>Contact support</span>${icons.arrow}</a>
    </div>`
      )
      .join('')}
  </div>`;
}

function verifyResultCard(lot) {
  return `<div class="result-card">
    <div class="result-card__head">
      <div>
        <span class="label">Lot</span>
        <strong class="mono" style="font-size:var(--t-h4)">${esc(lot.lot)}</strong>
      </div>
      <span class="status status--ok">${icons.checkCircle}Documentation available</span>
    </div>
    <div class="result-card__grid">
      <div class="result-card__cell"><span class="label">Product</span><span class="result-card__val">${esc(lot.product)}</span></div>
      <div class="result-card__cell"><span class="label">Reported purity</span><span class="result-card__val">${esc(lot.purity)}</span></div>
      <div class="result-card__cell"><span class="label">Method</span><span class="result-card__val">${esc(lot.method)}</span></div>
      <div class="result-card__cell"><span class="label">Test date</span><span class="result-card__val">${esc(lot.date)}</span></div>
    </div>
    <div class="result-card__trace" data-graph>
      <span class="label" style="margin:14px 0 6px">Chromatogram</span>
      ${chromatogram(lot.lot, { w: 520, h: 84, axis: false, gridColor: '#F6F6F4' })}
    </div>
    <div class="result-card__foot">
      <a class="btn btn--primary" href="/certificates/${lot.lot.toLowerCase()}/">View certificate</a>
      <a class="btn btn--secondary" href="/products/${lot.slug}/">Go to product</a>
    </div>
  </div>`;
}

function pager(current, total, base) {
  const items = [];
  items.push(current > 1 ? `<a href="${base}?page=${current - 1}" rel="prev">Previous</a>` : `<span aria-disabled="true" style="opacity:.4">Previous</span>`);
  for (let i = 1; i <= total; i++) {
    if (i === current) items.push(`<span aria-current="page">${i}</span>`);
    else if (i <= 2 || i > total - 1 || Math.abs(i - current) <= 1) items.push(`<a href="${base}?page=${i}">${i}</a>`);
    else if (items[items.length - 1] !== '<span class="is-gap">…</span>') items.push('<span class="is-gap">…</span>');
  }
  items.push(current < total ? `<a href="${base}?page=${current + 1}" rel="next">Next</a>` : `<span aria-disabled="true" style="opacity:.4">Next</span>`);
  return `<nav class="pager" aria-label="Pagination">${items.join('')}</nav>`;
}

function accordion(items, idPrefix) {
  return `<div class="acc">
    ${items
      .map(
        (it, i) => `<div class="acc__item">
      <h3 style="margin:0">
        <button class="acc__btn" type="button" aria-expanded="${i === 0}" aria-controls="${idPrefix}-${i}" data-acc>
          ${esc(it.q)}<span class="acc__icon" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="acc__panel" id="${idPrefix}-${i}" data-open="${i === 0}"><div><div class="inner">${it.a}</div></div></div>
    </div>`
      )
      .join('')}
  </div>`;
}

function researchNotice(extra) {
  return `<div class="notice notice--warn">
    ${icons.flask}
    <div><strong>Research use only.</strong> ${esc(
      extra || 'This material is supplied for laboratory research and in-vitro use by qualified professionals. It is not for human or veterinary use, and no therapeutic claim is made or implied.'
    )}</div>
  </div>`;
}

module.exports = {
  crumbs, sectionHead, productCard, productRow, categoryPanel, researchCard, lotRow,
  trustBar, supportCards, verifyResultCard, pager, accordion, researchNotice,
  stockBadge, docBadge, catName,
};
