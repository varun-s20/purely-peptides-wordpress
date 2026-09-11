'use strict';

const { page, esc, money } = require('../layout');
const C = require('../components');
const { icons, productShot, chromatogram } = require('../art');
const { products, lots, articles } = require('../data');

module.exports = function productPage(p) {
  const productLots = lots.filter((l) => l.slug === p.slug);
  const current = productLots[0];
  const related = products.filter((r) => r.slug !== p.slug && (r.area === p.area || r.category === p.category)).slice(0, 4);
  const size = p.sizes[0];
  const tint = p.slug === 'ghk-cu' ? '#D6E4EE' : '#F6F6F4';

  const faqs = [
    {
      q: 'What is included with the material?',
      a: `Each vial is supplied with the lot number printed on the label. The certificate of analysis for that lot is available in the certificate library and in your account after the order ships. ${p.form} is shipped sealed and desiccated.`,
    },
    {
      q: 'How should this material be stored on arrival?',
      a: `Store at ${esc(p.storage.toLowerCase())}. Short transit at ambient temperature is not expected to affect lyophilised material. Once reconstituted, storage life is substantially shorter and depends on the buffer used.`,
    },
    {
      q: 'Can I request documentation for a lot I already have?',
      a: 'Yes. Enter the lot number from the vial label into the <a class="link" href="/certificates/">certificate library</a>. Archived lots remain searchable after they are no longer in stock.',
    },
    {
      q: 'Do you supply larger quantities?',
      a: 'Gram-scale quantities and custom fills are quoted through the wholesale team. <a class="link" href="/wholesale/">Wholesale ordering</a> also covers purchase orders and consolidated invoicing.',
    },
  ];

  const specRows = [
    ['Product name', esc(p.name)],
    ['Purely Peptides SKU', `<span class="mono">${esc(p.sku)}</span>`],
    ['CAS number', `<span class="mono">${esc(p.cas)}</span>`],
    ['Molecular formula', `<span class="mono">${esc(p.formula)}</span>`],
    ['Molecular weight', `<span class="mono">${esc(p.mw)}</span>`],
    ['Sequence', `<span class="mono" style="font-size:var(--t-micro);line-height:1.7;word-break:break-word">${esc(p.sequence)}</span>`],
    ['Physical form', esc(p.form)],
    ['Purity (reported)', `<span class="mono">${esc(p.purity)}</span> - ${esc(p.method)}`],
    ['Available sizes', esc(p.sizes.map((s) => s.label).join(', '))],
    ['Storage', esc(p.storage)],
    ['Intended use', 'Laboratory research use only. Not for human or veterinary use.'],
  ];

  const body = `
${C.crumbs([
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products/' },
    { label: C.catName(p.category), href: `/products/category/${p.category}/` },
    { label: p.name },
  ])}

<div class="wrap pdp">
  <div class="pdp__gallery">
    <div class="pdp__main">${productShot(p.sku, p.name, { eager: true })}</div>
    <div class="pdp__thumbs">
      <button class="pdp__thumb" type="button" aria-pressed="true" aria-label="Vial, front">${productShot(p.sku, p.name)}</button>
      <button class="pdp__thumb" type="button" aria-label="Vial, second view">${productShot(p.sku, p.name, { variant: 1 })}</button>
      <button class="pdp__thumb" type="button" aria-label="Chromatogram for the current lot" style="display:grid;place-items:center;padding:8px" data-graph>${chromatogram(current ? current.lot : p.sku, { w: 120, h: 70, axis: false, grid: false })}</button>
      <button class="pdp__thumb" type="button" aria-label="Certificate preview" style="display:grid;place-items:center;color:var(--slate)">${icons.doc}</button>
    </div>
  </div>

  <div class="pdp__buybox">
    <span class="tag">${esc(C.catName(p.category))} · ${esc(p.area)}</span>
    <h1 class="pdp__title">${esc(p.name)}</h1>
    <p class="lede" style="font-size:var(--t-body)">${esc(p.summary)}</p>

    <div class="pdp__ids">
      <div class="pdp__id"><span class="label">SKU</span><span class="mono">${esc(p.sku)}</span></div>
      <div class="pdp__id"><span class="label">CAS</span><span class="mono">${esc(p.cas)}</span></div>
      <div class="pdp__id"><span class="label">Form</span><span class="mono">${esc(p.form.replace(' powder', ''))}</span></div>
      <div class="pdp__id"><span class="label">Purity</span><span class="mono">${esc(p.purity)}</span></div>
    </div>

    <div class="row" style="gap:8px;margin-bottom:20px">
      ${C.stockBadge(p.stock)}
      <span class="status status--flat">${icons.doc}Certificate available</span>
      ${current ? `<span class="status status--flat">${icons.box}Current lot ${esc(current.lot)}</span>` : ''}
    </div>

    <div class="pdp__price">
      <span class="amount" data-price>${money(size.price)}</span>
      <span class="per" data-per>per ${esc(size.label)} vial</span>
    </div>

    <div class="field">
      <span class="field__label" id="size-label">Size</span>
      <div class="optset" role="group" aria-labelledby="size-label">
        ${p.sizes
          .map(
            (s, i) => `<button class="opt" type="button" aria-pressed="${i === 0}" data-size data-value="${s.price}" data-label="${esc(s.label)}">
          <span class="opt__size">${esc(s.label)}</span>
          <span class="opt__price">${money(s.price)}</span>
        </button>`
          )
          .join('')}
      </div>
    </div>

    <div class="field">
      <label class="field__label" for="qty">Quantity</label>
      <div class="qty" data-qty>
        <button type="button" aria-label="Decrease quantity" data-step="-1">−</button>
        <input id="qty" type="number" value="1" min="1" max="999" aria-label="Quantity">
        <button type="button" aria-label="Increase quantity" data-step="1">+</button>
      </div>
    </div>

    <!-- Purchase mode. The two discounts stack, which is the whole point of
         the offer, so the summary below always shows the arithmetic rather
         than a single blended number the buyer has to take on trust. -->
    <div class="field">
      <span class="field__label" id="buy-mode-label">Purchase options</span>
      <div class="buymode" role="radiogroup" aria-labelledby="buy-mode-label">
        <label class="buymode__opt">
          <input type="radio" name="buy-mode" value="once" checked data-buymode>
          <span class="buymode__body">
            <span class="buymode__title">One-time purchase</span>
            <span class="buymode__note">Volume pricing still applies.</span>
          </span>
        </label>
        <label class="buymode__opt">
          <input type="radio" name="buy-mode" value="sub" data-buymode>
          <span class="buymode__body">
            <span class="buymode__title">Subscribe &amp; Save <span class="buymode__save">−10%</span></span>
            <span class="buymode__note">Stacks with volume pricing. Pause, skip or cancel any time.</span>
            <span class="buymode__freq">
              <label class="visually-hidden" for="sub-freq">Delivery frequency</label>
              <select class="select" id="sub-freq" data-sub-freq>
                <option value="4">Every 4 weeks</option>
                <option value="8" selected>Every 8 weeks</option>
                <option value="12">Every 12 weeks</option>
              </select>
            </span>
          </span>
        </label>
      </div>
    </div>

    <div class="volume" style="margin-bottom:14px" data-volume>
      <div class="volume__tier" data-active="true" data-tier="0">
        <div class="volume__qty">1–4 vials</div>
        <div class="volume__price">${money(size.price)}</div>
      </div>
      <div class="volume__tier" data-tier="1">
        <div class="volume__qty">5–9 vials · −8%</div>
        <div class="volume__price">${money(size.price * 0.92)}</div>
      </div>
      <div class="volume__tier" data-tier="2">
        <div class="volume__qty">10+ vials · −16%</div>
        <div class="volume__price">${money(size.price * 0.84)}</div>
      </div>
    </div>

    <div class="pricecalc" data-pricecalc hidden>
      <div class="pricecalc__row"><span>List price</span><span class="mono" data-calc-list>${money(size.price)}</span></div>
      <div class="pricecalc__row" data-calc-volrow hidden><span data-calc-vollabel>Volume discount</span><span class="mono" data-calc-vol>−$0.00</span></div>
      <div class="pricecalc__row" data-calc-subrow hidden><span>Subscribe &amp; Save −10%</span><span class="mono" data-calc-sub>−$0.00</span></div>
      <div class="pricecalc__row pricecalc__row--total"><span data-calc-totallabel>Total</span><span class="mono" data-calc-total>${money(size.price)}</span></div>
      <p class="pricecalc__note" data-calc-note hidden></p>
    </div>

    <div class="pdp__buy">
      <button class="btn btn--primary btn--lg" type="button" data-add-to-order data-slug="${esc(p.slug)}" data-name="${esc(p.name)}"
        ${p.stock === 'out-of-stock' ? 'disabled' : ''}>
        ${p.stock === 'out-of-stock' ? 'Notify me when available' : 'Add to order'}
      </button>
      <button class="btn btn--secondary btn--lg wishbtn" type="button" data-wish-toggle="${esc(p.slug)}" data-wish-label="${esc(p.name)}" aria-pressed="false">${icons.heart}</button>
    </div>

    <ul class="pdp__assur" style="list-style:none;padding:0">
      <li>${icons.doc}Lot documentation issued for the vial you receive</li>
      <li>${icons.lock}Secure checkout, purchase orders accepted on account</li>
      <li>${icons.truck}Tracked despatch from Massachusetts, next business day</li>
    </ul>

    <div class="pdp__wholesale">
      <span>Need bulk quantities or a purchase order?</span>
      <a class="link-arrow" href="/wholesale/"><span>Wholesale options</span>${icons.arrow}</a>
    </div>

    <div style="margin-top:20px">${C.researchNotice()}</div>
  </div>
</div>

<nav class="subnav" aria-label="Product sections">
  <div class="wrap subnav__inner">
    <div class="subnav__links" data-subnav>
      <a href="#overview" class="is-active">Overview</a>
      <a href="#specifications">Specifications</a>
      <a href="#documentation">Batch documentation</a>
      <a href="#research">Research</a>
      <a href="#storage">Storage</a>
      <a href="#shipping">Shipping</a>
      <a href="#faqs">FAQs</a>
    </div>
    <div class="subnav__buy">
      <span class="mono small nowrap">${money(size.price)} / ${esc(size.label)}</span>
      <button class="btn btn--primary btn--sm" type="button" data-add-to-order data-quick data-slug="${esc(p.slug)}" data-name="${esc(p.name)}">Add to order</button>
    </div>
  </div>
</nav>

<div class="wrap">
  <section class="pdp-section" id="overview" style="border-top:0">
    <h2>Overview</h2>
    <div class="split">
      <div>
        <p class="prose" style="max-width:64ch">${esc(p.overview)}</p>
        <p class="small muted" style="margin-top:20px;max-width:64ch">
          Descriptions summarise published literature for orientation only. They are not claims about
          the performance, safety or effect of this material in any system.
        </p>
      </div>
      <div>
        <div class="card" style="padding:24px">
          <span class="label">At a glance</span>
          <dl style="margin:14px 0 0;display:grid;gap:12px">
            ${[
              ['Research area', p.area],
              ['Molecular weight', p.mw],
              ['Reported purity', p.purity],
              ['Method', p.method],
            ]
              .map(
                ([k, v]) => `<div style="display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid var(--rule);padding-bottom:10px">
              <dt class="small muted">${esc(k)}</dt><dd class="mono small" style="margin:0;text-align:right">${esc(v)}</dd></div>`
              )
              .join('')}
          </dl>
        </div>
      </div>
    </div>
  </section>

  <section class="pdp-section" id="specifications">
    <h2>Specifications</h2>
    <table class="spec">
      <caption>Specification values apply to the current production lot unless stated otherwise.</caption>
      <tbody>
        ${specRows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${v}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>

  <section class="pdp-section" id="documentation">
    <h2>Batch documentation</h2>
    <p class="muted" style="max-width:64ch;margin-bottom:24px">
      Testing is recorded against the production lot. The lot currently shipping for this product is shown below.
    </p>

    ${current ? `<div class="lotpanel">
      <div class="lotpanel__data">
        <div class="row" style="justify-content:space-between;margin-bottom:20px">
          <div>
            <span class="label">Current lot</span>
            <strong class="mono" style="font-size:var(--t-h3)">${esc(current.lot)}</strong>
          </div>
          <span class="status status--ok">${icons.checkCircle}Verified</span>
        </div>
        <div class="lotpanel__grid">
          <div><span class="label">Method</span><div class="lotpanel__val">${esc(current.method)}</div></div>
          <div><span class="label">Reported purity</span><div class="lotpanel__val">${esc(current.purity)}</div></div>
          <div><span class="label">Identity</span><div class="lotpanel__val" style="font-size:var(--t-small)">${esc(current.identity)}</div></div>
          <div><span class="label">Test date</span><div class="lotpanel__val" style="font-size:var(--t-small)">${esc(current.date)}</div></div>
        </div>
        <div class="lotpanel__trace" data-graph>
          <span class="label" style="margin-bottom:8px">RP-HPLC · 220 nm · C18</span>
          ${chromatogram(current.lot, { w: 620, h: 110 })}
        </div>
      </div>
      <div class="lotpanel__aside">
        <span class="label">Certificate</span>
        <p class="small muted">Issued ${esc(current.date)} by ${esc(current.lab)}.</p>
        <a class="btn btn--primary btn--block" href="/certificates/${current.lot.toLowerCase()}/">View certificate</a>
        <a class="btn btn--secondary btn--block" href="/certificates/${current.lot.toLowerCase()}/">${icons.download} Download PDF</a>
        <a class="link-arrow" style="margin-top:8px" href="/certificates/?product=${p.slug}"><span>View all ${productLots.length} lots</span>${icons.arrow}</a>
      </div>
    </div>` : '<div class="empty"><h3>No documentation on file yet</h3><p>Testing for the current lot is in progress. Contact the documentation team for an expected date.</p></div>'}

    ${productLots.length > 1 ? `<h3 style="margin:40px 0 16px;font-size:var(--t-h4)">Lot history</h3>
    <table class="dtable dtable--zebra dtable--stack">
      <thead><tr><th>Product</th><th>Lot</th><th>Size</th><th>Test date</th><th>Purity</th><th>Status</th><th>Certificate</th></tr></thead>
      <tbody>${productLots.map(C.lotRow).join('')}</tbody>
    </table>` : ''}
  </section>

  <section class="pdp-section" id="research">
    <h2>Related research</h2>
    <div class="grid grid-3" style="margin-top:24px">${articles.slice(0, 3).map(C.researchCard).join('')}</div>
  </section>

  <section class="pdp-section" id="storage">
    <h2>Storage &amp; handling</h2>
    <div class="grid grid-3" style="margin-top:24px">
      <div class="icard"><div style="color:var(--verdigris)">${icons.thermometer}</div><h3>Long-term storage</h3><p>${esc(p.storage)}. Lyophilised material is stable under these conditions for the period stated on the certificate.</p></div>
      <div class="icard"><div style="color:var(--verdigris)">${icons.flask}</div><h3>After reconstitution</h3><p>Store the solution at 2–8 °C for short-term use, or in aliquots below −20 °C. Avoid repeated freeze-thaw cycles.</p></div>
      <div class="icard"><div style="color:var(--verdigris)">${icons.clock}</div><h3>On arrival</h3><p>Centrifuge briefly before opening. Allow sealed vials to reach room temperature before breaking the seal to limit condensation.</p></div>
    </div>
  </section>

  <section class="pdp-section" id="shipping">
    <h2>Shipping</h2>
    <div class="split split--even" style="margin-top:24px">
      <div class="stack-3">
        <p class="muted">Orders placed before 14:00 ET on a business day are despatched the same day from our Massachusetts facility. Tracking is issued on despatch and recorded against the order in your account.</p>
        <table class="spec">
          <tbody>
            <tr><th scope="row">Domestic (US)</th><td>1–3 business days, tracked</td></tr>
            <tr><th scope="row">International</th><td>3–7 business days, tracked, import documentation included</td></tr>
            <tr><th scope="row">Cold chain</th><td>Available on request at checkout</td></tr>
            <tr><th scope="row">Packaging</th><td>Sealed vial, desiccant, tamper-evident outer</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <div class="notice">${icons.info}<div>Some materials cannot be shipped to every destination. Restrictions are applied at checkout once a delivery address is entered. See <a class="link" href="/shipping/">shipping &amp; returns</a>.</div></div>
      </div>
    </div>
  </section>

  <section class="pdp-section" id="faqs">
    <h2>Frequently asked questions</h2>
    <div style="max-width:820px;margin-top:24px">${C.accordion(faqs, 'pdp-faq')}</div>
  </section>

  <section class="pdp-section">
    <h2>Related research materials</h2>
    <div class="grid grid-4" style="margin-top:24px">${related.map(C.productCard).join('')}</div>
  </section>
</div>

<div class="pdp-sticky">
  <div style="flex:1;min-width:0">
    <div class="pdp-sticky__price">${money(size.price)}</div>
    <div class="pdp-sticky__name">${esc(p.name)} · ${esc(size.label)}</div>
  </div>
  <button class="btn btn--primary" type="button" data-add-to-order data-slug="${esc(p.slug)}" data-name="${esc(p.name)}">Add to order</button>
</div>`;

  return page({
    title: `${p.name} - ${p.sku}`,
    description: `${p.name} (CAS ${p.cas}), ${p.form.toLowerCase()}, reported purity ${p.purity}. Supplied with lot-specific analytical documentation for laboratory research use.`,
    canonical: `/products/${p.slug}/`,
    active: 'Products',
    body,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      sku: p.sku,
      description: p.summary,
      category: C.catName(p.category),
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'CAS Number', value: p.cas },
        { '@type': 'PropertyValue', name: 'Molecular Formula', value: p.formula },
        { '@type': 'PropertyValue', name: 'Molecular Weight', value: p.mw },
        { '@type': 'PropertyValue', name: 'Purity', value: p.purity },
      ],
      offers: {
        '@type': 'Offer',
        price: size.price.toFixed(2),
        priceCurrency: 'USD',
        availability: p.stock === 'out-of-stock' ? 'https://schema.org/BackOrder' : 'https://schema.org/InStock',
        url: `https://purelypeptides.com/products/${p.slug}/`,
      },
    },
  });
};
