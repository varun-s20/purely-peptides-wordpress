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
        <h2>No records match that search</h2>
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
    ${C.sectionHead({ title: 'Reading the documentation', body: 'What each field on a Purely Peptides Hub certificate records, and how to interpret it.' })}
    <div class="grid grid-3">
      <div class="icard"><h3>Purity is method-specific</h3><p>The reported figure is area percent under stated chromatographic conditions. Different methods can return different numbers for the same material.</p><a class="link-arrow" href="/research/reading-an-hplc-purity-result/"><span>How to read a result</span>${icons.arrow}</a></div>
      <div class="icard"><h3>Identity is a separate test</h3><p>Purity says how much of one component is present. Mass spectrometry confirms that component is the sequence on the label.</p><a class="link-arrow" href="/research/mass-spectrometry-as-an-identity-check/"><span>Identity testing</span>${icons.arrow}</a></div>
      <div class="icard"><h3>Lots are the unit of record</h3><p>A certificate applies to one production run. Two lots of the same product carry separate documents and separate results.</p><a class="link-arrow" href="/quality/"><span>Our quality process</span>${icons.arrow}</a></div>
    </div>
  </div>
</section>`;

  return page({
    title: 'Certificates & batch documentation',
    description: 'Search Purely Peptides Hub certificates of analysis by product or lot number. Purity, identity and testing dates for every documented production lot.',
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
          <a class="btn btn--primary btn--sm" href="${lot.doc}" target="_blank" rel="noopener">${icons.download} Download ${esc(lot.docType)}</a>
        </div>
      </div>

      <div class="coa-doc__page">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div>
            <span class="label">Analysis performed by</span>
            <strong style="font-size:var(--t-h4);display:block;margin-top:4px">${esc(lot.lab)}</strong>
            <p class="small muted" style="margin-top:6px">
              Independent analytical laboratory.${lot.vendor ? ` Material supplied by ${esc(lot.vendor)}.` : ''}
              ${lot.verifyUrl ? `<br><a class="link" href="${lot.verifyUrl}" target="_blank" rel="noopener">Verify this certificate with the laboratory</a>` : ''}
            </p>
          </div>
          <div style="text-align:right">
            <span class="label">Issued</span>
            <span class="mono">${esc(lot.date)}</span>
            ${lot.received ? `<div style="margin-top:8px"><span class="label">Sample received</span><span class="mono">${esc(lot.received)}</span></div>` : ''}
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
          <thead><tr><th>Test</th><th>Method</th><th>Result</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td data-label="Test">Identity</td><td data-label="Method" class="mono">${esc(lot.identity.includes('LC-MS') ? 'LC-MS/MS' : 'MALDI-MS')}</td><td data-label="Result"><strong>${esc(lot.product)}</strong></td><td data-label="Status"><span class="status status--ok">${icons.check}Conforms</span></td></tr>
            <tr><td data-label="Test">Overall purity</td><td data-label="Method" class="mono">${esc(lot.method)}</td><td data-label="Result"><strong class="mono">${esc(lot.purity)}</strong></td><td data-label="Status"><span class="status status--ok">${icons.check}Conforms</span></td></tr>
            ${lot.content ? `<tr><td data-label="Test">Net peptide content</td><td data-label="Method" class="mono">HPLC quantitation</td><td data-label="Result"><strong class="mono">${esc(lot.content)}</strong></td><td data-label="Status"><span class="status status--ok">${icons.check}Conforms</span></td></tr>` : ''}
            ${lot.endotoxin ? `<tr><td data-label="Test">Endotoxin</td><td data-label="Method" class="mono">USP &lt;85&gt;</td><td data-label="Result"><strong class="mono">${esc(lot.endotoxin)}</strong></td><td data-label="Status"><span class="status status--ok">${icons.check}Pass</span></td></tr>` : ''}
            ${lot.heavyMetals ? `<tr><td data-label="Test">Heavy metals</td><td data-label="Method" class="mono">USP &lt;232&gt;</td><td data-label="Result"><strong class="mono">${esc(lot.heavyMetals)}</strong></td><td data-label="Status"><span class="status status--ok">${icons.check}Conforms</span></td></tr>` : ''}
            ${lot.sterility ? `<tr><td data-label="Test">Sterility</td><td data-label="Method" class="mono">USP &lt;71&gt;</td><td data-label="Result"><strong class="mono">${esc(lot.sterility)}</strong></td><td data-label="Status"><span class="status status--ok">${icons.check}Conforms</span></td></tr>` : ''}
            ${lot.retention ? `<tr><td data-label="Test">Retention time</td><td data-label="Method" class="mono">${esc(lot.method)}</td><td data-label="Result"><strong class="mono">${esc(lot.retention)}</strong></td><td data-label="Status"><span class="muted small">Recorded</span></td></tr>` : ''}
          </tbody>
        </table>

        ${lot.note ? `<div class="notice notice--warn" style="margin-bottom:24px">${icons.info}<div>${esc(lot.note)}</div></div>` : ''}

        <span class="label" style="margin-bottom:10px">Issued document</span>
        <p class="small muted" style="margin-bottom:12px">
          The values above are transcribed from the document issued by ${esc(lot.lab)}. That document,
          including the chromatogram and mass spectrum, is the record of testing - open it below.
        </p>
        <figure class="coa-doc__embed">
          <a href="${lot.doc}" target="_blank" rel="noopener" aria-label="Open the full certificate for lot ${esc(lot.lot)}">
            <img src="/doc/coa/preview/${lot.lot.toLowerCase()}.jpg"
                 alt="Certificate of analysis for lot ${esc(lot.lot)}, issued by ${esc(lot.lab)}"
                 loading="lazy" width="1020" height="1320">
          </a>
          <figcaption>
            <span>Page 1 of the certificate issued by ${esc(lot.lab)}.</span>
            <a class="link-arrow" href="${lot.doc}" target="_blank" rel="noopener"><span>Open the full ${esc(lot.docType === 'Image' ? 'certificate' : 'PDF')}</span>${icons.arrow}</a>
          </figcaption>
        </figure>

        <div class="coa-doc__rule"></div>

        <div class="row" style="justify-content:space-between;align-items:flex-end;gap:24px">
          <div>
            <span class="label">Testing laboratory</span>
            <p class="small" style="margin-top:6px">${esc(lot.lab)}${lot.vendor ? `<br><span class="muted">Material vendor: ${esc(lot.vendor)}</span>` : ''}</p>
          </div>
          <div style="text-align:right">
            <span class="label">Document reference</span>
            <span class="mono small">${esc(lot.accession ? 'COA ' + lot.accession : 'COA-' + lot.lot)}</span>
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
          ['Identity', lot.identity],
          ['Tested', lot.date],
          ['Laboratory', lot.lab],
          ...(lot.vendor ? [['Vendor', lot.vendor]] : []),
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
          .filter((l) => l.slug === lot.slug && l.doc)
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
