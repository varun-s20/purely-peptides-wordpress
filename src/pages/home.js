'use strict';

const { page, esc } = require('../layout');
const C = require('../components');
const { icons, labPlate, photo } = require('../art');
const { brand, categories, products, articles, lots } = require('../data');

/* The homepage lead rotates through the campaigns worth leading on. Each slide
   is a complete statement - headline, one paragraph, one link - so a reader
   who only ever sees slide one has still been told something whole. */
const heroSlides = [
  {
    eyebrow: 'Batch verification',
    title: 'Every lot carries its own analytical record.',
    body:
      'Enter the lot number printed on a vial you already hold and the certificate issued for that ' +
      'exact production run opens. No account, no request form.',
    cta: { label: 'Verify a batch', href: '/certificates/' },
    art: () => photo('hero-verify', 'A gloved hand lifting a labelled vial from a row of sealed vials', 1400, 875, { eager: true }),
  },
  {
    eyebrow: 'Analytical method',
    title: 'Purity by reversed-phase HPLC, identity by mass spectrometry.',
    body:
      'Material from the finished lot is assessed before release. The chromatogram is published ' +
      'alongside the number, because a purity figure is a summary of a trace, not a substitute for it.',
    cta: { label: 'Read the testing standards', href: '/quality/#testing' },
    art: () => photo('hero-method', 'Sample vials loaded into the carousel of an analytical instrument', 1400, 875),
  },
  {
    eyebrow: 'Catalogue',
    title: 'Twenty characterised materials, documented end to end.',
    body:
      'Research peptides, blends and related compounds, each with a specification sheet, a current ' +
      'shipping lot and the certificate that lot was released against.',
    cta: { label: 'Explore the catalogue', href: '/products/' },
    art: () => photo('hero-catalogue', 'Racked glass vials on a laboratory bench', 1400, 875),
  },
  {
    eyebrow: 'Wholesale',
    title: 'Procurement at scale, without losing the paperwork.',
    body:
      'Approved research organisations order on account with tiered pricing, consolidated invoicing ' +
      'and a full documentation history retained against the organisation, not the individual buyer.',
    cta: { label: 'Apply for an account', href: '/wholesale/' },
    art: () => photo('hero-wholesale', 'Laboratory shelving stocked with glassware and reagents', 1400, 875),
  },
  {
    eyebrow: 'Research library',
    title: 'Method notes from the people who run the testing.',
    body:
      'Solubility, reconstitution, storage, endotoxin limits and how to read the results you are ' +
      'sent - written for the bench, not for a search engine.',
    cta: { label: 'Browse the library', href: '/research/' },
    art: () => photo('hero-library', 'Two researchers reviewing written records at the bench', 1400, 875),
  },
];

/* The one fixed statement on the page, over footage of the work itself. It
   does not rotate: a visitor who reads nothing else should still get this. */
function videoHero() {
  return `
<section class="vhero" data-vhero>
  <video class="vhero__media" autoplay muted loop playsinline preload="metadata"
         poster="/img/hero-poster.jpg" aria-hidden="true" tabindex="-1" data-hero-video>
    <source src="/video/hero-lab.mp4" type="video/mp4">
  </video>
  <div class="vhero__scrim" aria-hidden="true"></div>
  <div class="wrap vhero__inner">
    <div class="vhero__copy">
      <span class="vhero__eyebrow">Research materials, documented</span>
      <h1 class="vhero__title">The analytical record ships with the vial.</h1>
      <p class="vhero__lede">
        Every eligible production lot is tested before release and published against its own
        certificate - so you can read the evidence for the exact material you are about to order.
      </p>
      <div class="vhero__cta">
        <a class="btn btn--accent btn--lg" href="/products/">Explore the catalogue</a>
        <a class="btn btn--onDark btn--lg" href="/certificates/">Verify a batch</a>
      </div>
    </div>

    <dl class="vhero__stats">
      <div><dt>Materials</dt><dd>20</dd></div>
      <div><dt>Lots documented</dt><dd>100%</dd></div>
      <div><dt>Analytical data types</dt><dd>3</dd></div>
      <div><dt>Document access</dt><dd>24 / 7</dd></div>
    </dl>
  </div>
</section>`;
}

function heroCarousel() {
  // Every slide is an h2 - the page's single h1 belongs to the video hero
  // above, which does not rotate.
  const slide = (s, i) => `
    <div class="hcar__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${heroSlides.length}"
         data-slide aria-hidden="${i === 0 ? 'false' : 'true'}">
      <div class="hcar__copy">
        <span class="hcar__eyebrow">${esc(s.eyebrow)}</span>
        <h2 class="hcar__title">${esc(s.title)}</h2>
        <p class="hcar__body">${esc(s.body)}</p>
        <a class="link-arrow hcar__cta" href="${s.cta.href}"><span>${esc(s.cta.label)}</span>${icons.arrow}</a>
      </div>
      <div class="hcar__figure">${s.art()}</div>
    </div>`;

  return `
<section class="hcar" data-carousel aria-roledescription="carousel" aria-label="Featured">
  <div class="wrap">
    <div class="hcar__viewport">
      <div class="hcar__track" data-track>${heroSlides.map(slide).join('')}</div>
    </div>
    <div class="hcar__controls">
      <button class="hcar__btn" type="button" data-carousel-prev aria-label="Previous slide">${icons.chevronLeft}</button>
      <button class="hcar__btn" type="button" data-carousel-next aria-label="Next slide">${icons.chevronRight}</button>
      <span class="hcar__count" data-carousel-count aria-hidden="true">1 / ${heroSlides.length}</span>
      <div class="hcar__dots" role="tablist" aria-label="Choose slide">
        ${heroSlides
          .map(
            (s, i) =>
              `<button class="hcar__dot" type="button" role="tab" data-carousel-dot aria-current="${i === 0}" aria-label="${esc(s.eyebrow)}"></button>`
          )
          .join('')}
      </div>
    </div>
  </div>
</section>`;
}

/* Four reasons to buy here rather than anywhere else, each illustrated. */
const valueProps = [
  {
    title: 'Documented at the lot level',
    body: 'The certificate is issued against a production run, not against a product name. Lot numbers link straight into the library.',
    art: () => photo('vp-lot', 'A handwritten production log sheet on a clipboard', 800, 600),
  },
  {
    title: 'The trace, not just the number',
    body: 'Every purity figure is published next to the chromatogram it was read from, so you can judge the peak yourself.',
    art: () => photo('vp-trace', 'An analyst reading instrument output on screen', 800, 600),
  },
  {
    title: 'Specification before price',
    body: 'Molecular weight, sequence, storage and handling reach you on the product page before the buy box does.',
    art: () => photo('vp-spec', 'A printed specification sheet', 800, 600),
  },
  {
    title: 'Answers from the analytical team',
    body: 'Technical questions route to the people who ran the assay. ' + brand.hours + '.',
    art: () => photo('vp-team', 'Two scientists discussing a result over a clipboard', 800, 600),
  },
];

module.exports = function home() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const posts = articles.filter((a) => a.featured).slice(0, 3);
  const demoLot = lots.find((l) => l.lot === 'BP-260910');

  const body = `
<!-- 1 ─ VIDEO HERO ──────────────────────────────────────────────────── -->
${videoHero()}

<!-- 2 ─ HERO CAROUSEL ───────────────────────────────────────────────── -->
${heroCarousel()}

<!-- 3 ─ VALUE PROPS ─────────────────────────────────────────────────── -->
<section class="section section--tight">
  <div class="wrap">
    <div class="vprops" data-reveal-stagger>
      ${valueProps
        .map(
          (v) => `<div class="vprop">
        <div class="vprop__media">${v.art()}</div>
        <h3>${esc(v.title)}</h3>
        <p>${esc(v.body)}</p>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>

<!-- 4 ─ TRUST BAR ───────────────────────────────────────────────────── -->
${C.trustBar()}

<!-- 5 ─ PRODUCT HIGHLIGHTS ──────────────────────────────────────────── -->
<section class="section">
  <div class="wrap">
    ${C.sectionHead({
      title: 'Product highlights',
      body: 'The materials most often ordered and referenced by laboratories this quarter.',
      action: { label: 'View catalogue', href: '/products/' },
    })}
    <div class="grid grid-4" data-reveal-stagger>
      ${featured.map(C.productCard).join('')}
    </div>
  </div>
</section>

<!-- 6 ─ FEATURED CATEGORIES ─────────────────────────────────────────── -->
<section class="section section--mist">
  <div class="wrap">
    ${C.sectionHead({
      title: 'Featured product categories',
      body: 'Catalogue organised by material class and by the research area it is most often cited in.',
      action: { label: 'All products', href: '/products/' },
    })}
    <div class="grid grid-3" data-reveal-stagger>
      ${categories.map(C.categoryPanel).join('')}
    </div>
  </div>
</section>

<!-- 7 ─ IDENTIFIER SEARCH ───────────────────────────────────────────── -->
<section class="finder" id="quick-find">
  <div class="wrap finder__inner">
    <div>
      <h2>Know what you are looking for?</h2>
      <p class="muted" style="margin-top:12px;max-width:44ch">
        Search the catalogue by product name, CAS registry number, Purely Peptides SKU or a lot number
        printed on a vial you already hold.
      </p>
    </div>
    <div>
      <div class="finder__types" role="group" aria-label="Search scope">
        <button class="finder__type" type="button" aria-pressed="true" data-scope>Everything</button>
        <button class="finder__type" type="button" aria-pressed="false" data-scope>Product</button>
        <button class="finder__type" type="button" aria-pressed="false" data-scope>CAS</button>
        <button class="finder__type" type="button" aria-pressed="false" data-scope>SKU</button>
        <button class="finder__type" type="button" aria-pressed="false" data-scope>Lot</button>
      </div>
      <form class="searchbar searchbar--lg" action="/search/" method="get" role="search">
        <span class="searchbar__icon">${icons.search}</span>
        <label class="visually-hidden" for="finder-q">Search products, CAS, SKU or lot number</label>
        <input id="finder-q" name="q" type="search" placeholder="e.g. BPC-157, 137525-51-0, PP-1001 or BP-260910">
        <button class="btn btn--primary" type="submit">Search</button>
      </form>
      <div class="finder__examples">
        <span class="label" style="display:inline;margin-right:4px">Try</span>
        <a href="/products/bpc-157/">BPC-157</a>
        <a href="/products/tb-500/">TB-500</a>
        <a href="/products/ghk-cu/">GHK-Cu</a>
        <a href="/certificates/bp-260910/">BP-260910</a>
        <a href="/products/category/blends/">Blends</a>
      </div>
    </div>
  </div>
</section>

<!-- 8 ─ QUALITY STORY ───────────────────────────────────────────────── -->
<section class="section">
  <div class="wrap">
    <div class="qsplit" data-reveal>
      <div class="qsplit__art" data-graph>${labPlate()}</div>
      <div>
        <span class="eyebrow">Quality &amp; traceability</span>
        <p class="qsplit__pull">
          Documentation should be part of the product, not an afterthought.
        </p>
        <p class="muted" style="margin-top:20px;max-width:52ch">
          Each eligible production lot is connected to its own testing record. The certificate is
          generated against that lot, filed against the products it was used to fill, and stays
          retrievable long after the order has shipped.
        </p>

        <div class="steps">
          <div class="step">
            <span class="step__n">01</span>
            <div><h3>Test</h3><p>Material from the finished lot is submitted for analytical evaluation before release.</p></div>
          </div>
          <div class="step">
            <span class="step__n">02</span>
            <div><h3>Document</h3><p>Results are recorded against that lot number and published to the certificate library.</p></div>
          </div>
          <div class="step">
            <span class="step__n">03</span>
            <div><h3>Trace</h3><p>Order records carry the lot, so the documentation stays connected to the vial you received.</p></div>
          </div>
        </div>

        <a class="btn btn--secondary" href="/quality/" style="margin-top:28px">Explore our quality process</a>
      </div>
    </div>
  </div>
</section>

<!-- 9 ─ BATCH VERIFICATION ──────────────────────────────────────────── -->
<section class="verify on-dark" id="verify">
  <div class="wrap verify__inner">
    <div>
      <span class="eyebrow">Batch verification</span>
      <h2>Verify your batch</h2>
      <p style="margin-top:14px;max-width:44ch">
        Enter the lot number printed on the vial label to open the analytical documentation issued
        for that production run.
      </p>
      <form class="verify__form" action="/certificates/" method="get" role="search">
        <div class="searchbar">
          <span class="searchbar__icon">${icons.doc}</span>
          <label class="visually-hidden" for="verify-lot">Lot number</label>
          <input id="verify-lot" class="input--mono" name="lot" type="text" placeholder="BP-260910" spellcheck="false">
          <button class="btn btn--onDark" type="submit">Verify</button>
        </div>
        <p class="verify__hint">Lot numbers appear on the vial label and on your order confirmation.</p>
      </form>
    </div>
    <div>${C.verifyResultCard(demoLot)}</div>
  </div>
</section>

<!-- 10 ─ METRICS ────────────────────────────────────────────────────── -->
<section class="section section--tight">
  <div class="wrap">
    <div class="metrics" data-reveal-stagger>
      <div class="metric">
        <div class="metric__val" data-count="20" data-suffix="+">20+</div>
        <div class="metric__label">Research materials</div>
        <p class="metric__note">Catalogue of characterised compounds, expanded on laboratory request.</p>
      </div>
      <div class="metric">
        <div class="metric__val" data-count="100" data-suffix="%">100%</div>
        <div class="metric__label">Lot-level traceability</div>
        <p class="metric__note">Every shipped vial maps to a recorded production lot.</p>
      </div>
      <div class="metric">
        <div class="metric__val">24 / 7</div>
        <div class="metric__label">Document access</div>
        <p class="metric__note">Certificates remain retrievable from your account after delivery.</p>
      </div>
      <div class="metric">
        <div class="metric__val" data-count="3">3</div>
        <div class="metric__label">Analytical data types</div>
        <p class="metric__note">Purity, identity and appearance reported on each certificate.</p>
      </div>
    </div>
  </div>
</section>

<!-- 11 ─ RESEARCH LIBRARY ───────────────────────────────────────────── -->
<section class="section section--mist">
  <div class="wrap">
    ${C.sectionHead({
      title: 'Research &amp; technical resources',
      body: 'Method notes and quality writing from the people who run our analytical programme.',
      action: { label: 'View all resources', href: '/research/' },
    })}
    <div class="grid grid-3" data-reveal-stagger>
      ${posts.map(C.researchCard).join('')}
    </div>
  </div>
</section>

<!-- 12 ─ WHOLESALE ──────────────────────────────────────────────────── -->
<section class="section on-dark">
  <div class="wrap">
    <div class="whole" data-reveal>
      <div>
        <span class="eyebrow">For labs &amp; procurement teams</span>
        <h2>Research procurement at scale.</h2>
        <p style="margin-top:14px;max-width:48ch">
          Approved research organisations order on account, with bulk quantities, consolidated
          invoicing and a named contact who knows your standing catalogue.
        </p>
        <div class="row" style="gap:12px;margin-top:28px">
          <a class="btn btn--onDark btn--lg" href="/wholesale/apply/">Apply for a wholesale account</a>
          <a class="btn btn--outlineDark btn--lg" href="/contact/?topic=wholesale">Contact procurement support</a>
        </div>
      </div>
      <div class="whole__benefits">
        ${[
          ['Account pricing', 'Tiered rates applied automatically at checkout.'],
          ['Bulk quantities', 'Gram-scale and custom fills quoted on request.'],
          ['Account ordering', 'Purchase orders, net terms and consolidated invoicing.'],
          ['Order history', 'Full reorder history retained against your organisation.'],
          ['Documentation access', 'Certificates for every lot your organisation has received.'],
          ['Priority support', 'A named contact for specification and supply questions.'],
        ]
          .map(([t, b]) => `<div class="whole__benefit"><h3>${esc(t)}</h3><p>${esc(b)}</p></div>`)
          .join('')}
      </div>
    </div>
  </div>
</section>

<!-- 13 ─ SUPPORT ────────────────────────────────────────────────────── -->
<section class="section">
  <div class="wrap">
    ${C.sectionHead({
      title: 'Need help finding the right material?',
      body: 'Technical questions reach the analytical team, not a general inbox. ' + esc(brand.hours) + '.',
      action: { label: 'All contact routes', href: '/contact/' },
    })}
    ${C.supportCards()}
  </div>
</section>

<!-- 14 ─ SUPPORT BAND ───────────────────────────────────────────────── -->
<section class="supportband">
  <div class="wrap supportband__inner">
    <div>
      <h2>Looking for on-demand scientific support?</h2>
      <p>
        Specification, handling and documentation questions go to the analytical team that released
        the lot - not to a general inbox. ${esc(brand.hours)}.
      </p>
    </div>
    <a class="btn btn--onDark btn--lg" href="/contact/?topic=technical">Contact technical support</a>
  </div>
</section>`;

  return page({
    title: 'Research materials with lot-level documentation',
    description:
      'Purely Peptides supplies research peptides and related materials with lot-specific analytical documentation, transparent specifications and streamlined ordering for laboratories.',
    canonical: '/',
    active: null,
    body,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: brand.legal,
      url: 'https://purelypeptides.com',
      email: brand.email,
      telephone: brand.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: brand.address[0],
        addressLocality: 'Cambridge',
        addressRegion: 'MA',
        postalCode: '02142',
        addressCountry: 'US',
      },
    },
  });
};
