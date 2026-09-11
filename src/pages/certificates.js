'use strict';

const { page, esc } = require('../layout');
const C = require('../components');
const { icons, chromatogram } = require('../art');
const { brand, products, lots } = require('../data');

/* ---------------------------------------------------------- COA library */

function coaLibrary() {
  const available = lots.filter((l) => l.status === 'available');
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Certificates' }])}

<section class="coa-hero" id="verify">
  <div class="wrap">
    <span class="eyebrow">Documentation</span>
    <h1>Certificates &amp; batch documentation</h1>
    <p>
      Search available documentation by product or by the lot number printed on your vial label.
      Records for archived lots stay retrievable after a lot is no longer in stock.
    </p>
    <form class="coa-search" action="/certificates/" method="get" role="search">
      <div class="searchbar searchbar--lg">
        <span class="searchbar__icon">${icons.doc}</span>
        <label class="visually-hidden" for="coa-q">Product name or lot number</label>
        <input id="coa-q" class="input--mono" name="lot" type="search" placeholder="BP-260910 or BPC-157" spellcheck="false">
        <button class="btn btn--onDark" type="submit">Search documentation</button>
      </div>
      <p class="verify__hint">${lots.length} lots on file · ${available.length} currently shipping</p>
    </form>
  </div>
</section>

<div class="wrap">
  <div class="coa-filters">
    <div>
      <label class="visually-hidden" for="f-product">Product</label>
      <select class="select" id="f-product">
        <option>All products</option>
        ${products.map((p) => `<option>${esc(p.name)}</option>`).join('')}
      </select>
    </div>
    <div>
      <label class="visually-hidden" for="f-status">Status</label>
      <select class="select" id="f-status">
        <option>All lots</option><option>Currently shipping</option><option>Archived</option>
      </select>
    </div>
    <div>
      <label class="visually-hidden" for="f-from">Tested after</label>
      <input class="input" id="f-from" type="date" value="2025-09-01">
    </div>
    <div>
      <label class="visually-hidden" for="f-to">Tested before</label>
      <input class="input" id="f-to" type="date" value="2026-09-10">
    </div>
    <button class="btn btn--secondary" type="button">Apply</button>
    <button class="btn-text" type="button" style="margin-left:auto">Reset</button>
  </div>

  <div class="section--tight">
    <div class="row" style="justify-content:space-between;margin-bottom:16px">
      <span class="results-count">${lots.length} documents</span>
      <button class="btn btn--secondary btn--sm" type="button" data-toast="Preparing a CSV of ${lots.length} records">${icons.download} Export list</button>
    </div>

    <p class="small muted" data-coa-count hidden style="margin-bottom:12px"></p>
      <div class="empty" data-coa-empty hidden style="margin:24px 0">
        ${icons.doc}
        <h3>No records match that search</h3>
        <p>Check the lot number printed on the vial label, or search by product name instead.</p>
      </div>
      <table class="dtable dtable--zebra dtable--stack">
      <caption>Certificates are issued per production lot. Purity is reported as chromatographic area percent.</caption>
      <thead>
        <tr><th>Product</th><th>Lot</th><th>Size</th><th>Test date</th><th>Purity</th><th>Status</th><th>Certificate</th></tr>
      </thead>
      <tbody>${lots.map(C.lotRow).join('')}</tbody>
    </table>

    ${C.pager(1, 2, '/certificates/')}
  </div>
</div>

<section class="section section--mist">
  <div class="wrap">
    ${C.sectionHead({ title: 'Reading the documentation', body: 'What each field on a Purely Peptides certificate records, and how to interpret it.' })}
    <div class="grid grid-3">
      <div class="icard"><h3>Purity is method-specific</h3><p>The reported figure is area percent under stated chromatographic conditions. Different methods can return different numbers for the same material.</p><a class="link-arrow" href="/research/reading-an-hplc-purity-result/"><span>How to read a result</span>${icons.arrow}</a></div>
      <div class="icard"><h3>Identity is a separate test</h3><p>Purity says how much of one component is present. Mass spectrometry confirms that component is the sequence on the label.</p><a class="link-arrow" href="/research/mass-spectrometry-as-an-identity-check/"><span>Identity testing</span>${icons.arrow}</a></div>
      <div class="icard"><h3>Lots are the unit of record</h3><p>A certificate applies to one production run. Two lots of the same product carry separate documents and separate results.</p><a class="link-arrow" href="/quality/"><span>Our quality process</span>${icons.arrow}</a></div>
    </div>
  </div>
</section>`;

  return page({
    title: 'Certificates & batch documentation',
    description: 'Search Purely Peptides certificates of analysis by product or lot number. Purity, identity and testing dates for every documented production lot.',
    canonical: '/certificates/',
    active: 'Resources',
    body,
  });
}

/* ----------------------------------------------------------- COA detail */

function coaDetail(lot) {
  const product = products.find((p) => p.slug === lot.slug);
  const body = `
${C.crumbs([
    { label: 'Home', href: '/' },
    { label: 'Certificates', href: '/certificates/' },
    { label: lot.product, href: `/certificates/?product=${lot.slug}` },
    { label: lot.lot },
  ])}

<div class="wrap coa-detail">
  <div>
    <div class="row" style="justify-content:space-between;margin-bottom:20px">
      <div>
        <span class="eyebrow">Certificate of analysis</span>
        <h1 style="font-size:var(--t-h2)">${esc(lot.product)}</h1>
        <p class="mono muted" style="margin-top:8px">Lot ${esc(lot.lot)} · ${esc(lot.size)}</p>
      </div>
      <span class="status status--ok">${icons.checkCircle}${lot.status === 'available' ? 'Currently shipping' : 'Archived lot'}</span>
    </div>

    <div class="coa-doc">
      <div class="coa-doc__head">
        <div>
          <span class="label">Document</span>
          <strong class="mono">COA-${esc(lot.lot)}</strong>
        </div>
        <div class="row" style="gap:8px">
          <button class="btn btn--secondary btn--sm" type="button" onclick="window.print()">Print</button>
          <button class="btn btn--primary btn--sm" type="button" data-toast="Certificate COA-${esc(lot.lot)}.pdf downloaded">${icons.download} Download PDF</button>
        </div>
      </div>

      <div class="coa-doc__page">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div>
            <strong style="font-size:var(--t-h4)">${esc(brand.legal)}</strong>
            <p class="small muted" style="margin-top:6px">${esc(brand.address.join(', '))}</p>
          </div>
          <div style="text-align:right">
            <span class="label">Issued</span>
            <span class="mono">${esc(lot.date)}</span>
          </div>
        </div>

        <div class="coa-doc__rule"></div>

        <table class="spec">
          <tbody>
            <tr><th scope="row">Product</th><td>${esc(lot.product)}</td></tr>
            <tr><th scope="row">Batch / lot number</th><td class="mono">${esc(lot.lot)}</td></tr>
            <tr><th scope="row">Fill size</th><td class="mono">${esc(lot.size)}</td></tr>
            ${product ? `<tr><th scope="row">CAS number</th><td class="mono">${esc(product.cas)}</td></tr>
            <tr><th scope="row">Molecular formula</th><td class="mono">${esc(product.formula)}</td></tr>
            <tr><th scope="row">Molecular weight</th><td class="mono">${esc(product.mw)}</td></tr>
            <tr><th scope="row">Appearance</th><td>White to off-white lyophilised powder</td></tr>` : ''}
            <tr><th scope="row">Testing laboratory</th><td>${esc(lot.lab)}</td></tr>
            <tr><th scope="row">Test date</th><td class="mono">${esc(lot.date)}</td></tr>
          </tbody>
        </table>

        <div class="coa-doc__rule"></div>

        <h2 style="font-size:var(--t-h4);margin-bottom:16px">Analytical results</h2>
        <table class="dtable dtable--stack" style="margin-bottom:24px">
          <thead><tr><th>Test</th><th>Method</th><th>Specification</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td data-label="Test">Purity</td><td data-label="Method" class="mono">RP-HPLC, 220 nm</td><td data-label="Specification" class="mono">≥ 98.0%</td><td data-label="Result"><strong class="mono">${esc(lot.purity)}</strong></td></tr>
            <tr><td data-label="Test">Identity</td><td data-label="Method" class="mono">ESI-MS</td><td data-label="Specification">Conforms to structure</td><td data-label="Result"><strong>${esc(lot.identity)}</strong></td></tr>
            <tr><td data-label="Test">Appearance</td><td data-label="Method">Visual</td><td data-label="Specification">White to off-white powder</td><td data-label="Result"><strong>Conforms</strong></td></tr>
          </tbody>
        </table>

        <span class="label" style="margin-bottom:10px">Chromatogram - C18, 4.6 × 250 mm, 0.1% TFA gradient</span>
        <div class="coa-doc__trace" data-graph>${chromatogram(lot.lot, { w: 720, h: 220 })}</div>

        <div class="coa-doc__rule"></div>

        <div class="row" style="justify-content:space-between;align-items:flex-end;gap:24px">
          <div>
            <span class="label">Released by</span>
            <p class="small" style="margin-top:6px">Dr. Ines Karlsson<br><span class="muted">Head of Analytical Services</span></p>
          </div>
          <div style="text-align:right">
            <span class="label">Document reference</span>
            <span class="mono small">COA-${esc(lot.lot)}-R1</span>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top:24px">${C.researchNotice('This certificate records analytical testing performed on the stated lot. It is not a certificate of suitability for any application, and the material is supplied for laboratory research use only.')}</div>
  </div>

  <aside class="coa-aside">
    <div class="card" style="padding:24px">
      <span class="label">Summary</span>
      <dl style="margin:14px 0 0;display:grid;gap:12px">
        ${[
          ['Lot', lot.lot],
          ['Purity', lot.purity],
          ['Method', lot.method],
          ['Identity', 'Conforms'],
          ['Tested', lot.date],
          ['Laboratory', lot.lab],
        ]
          .map(
            ([k, v]) => `<div style="display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid var(--rule);padding-bottom:10px">
          <dt class="small muted">${esc(k)}</dt><dd class="mono small" style="margin:0;text-align:right">${esc(v)}</dd></div>`
          )
          .join('')}
      </dl>
      <a class="btn btn--primary btn--block" style="margin-top:20px" href="/products/${lot.slug}/">View product</a>
    </div>

    <div class="card" style="padding:24px">
      <span class="label">Other lots of this product</span>
      <ul style="list-style:none;padding:0;margin:14px 0 0;display:grid;gap:2px">
        ${lots
          .filter((l) => l.slug === lot.slug)
          .map(
            (l) => `<li><a href="/certificates/${l.lot.toLowerCase()}/" style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;text-decoration:none;border-bottom:1px solid var(--rule)">
          <span class="mono small"${l.lot === lot.lot ? ' style="color:var(--verdigris);font-weight:500"' : ''}>${esc(l.lot)}</span>
          <span class="mono small muted">${esc(l.date)}</span></a></li>`
          )
          .join('')}
      </ul>
    </div>

    <div class="notice">
      ${icons.help}
      <div>Documentation query about this lot? <a class="link" href="/contact/?topic=documentation">Contact the documentation team</a>.</div>
    </div>
  </aside>
</div>`;

  return page({
    title: `COA ${lot.lot} - ${lot.product}`,
    description: `Certificate of analysis for ${lot.product}, lot ${lot.lot}. Purity ${lot.purity} by RP-HPLC, identity confirmed by mass spectrometry, tested ${lot.date}.`,
    canonical: `/certificates/${lot.lot.toLowerCase()}/`,
    active: 'Resources',
    body,
  });
}

module.exports = { coaLibrary, coaDetail };
