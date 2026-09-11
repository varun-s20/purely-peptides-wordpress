'use strict';

const { brand, categories, researchAreas } = require('./data');
const { icons } = require('./art');

/* ------------------------------------------------------------------ utils */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n) => '$' + n.toFixed(2);

/* -------------------------------------------------------------------- nav */

const productMenu = {
  columns: [
    {
      title: 'Shop by category',
      links: [
        ...categories.map((c) => ({ label: c.name, href: `/products/category/${c.slug}/`, n: c.count })),
        { label: 'All products', href: '/products/', strong: true },
      ],
    },
    {
      title: 'Shop by research area',
      links: [
        ...researchAreas.map((a) => ({ label: a, href: `/products/?area=${encodeURIComponent(a)}` })),
        { label: 'Other areas', href: '/products/' },
      ],
    },
    {
      title: 'Quality & documentation',
      links: [
        { label: 'Certificates of analysis', href: '/certificates/' },
        { label: 'Batch verification', href: '/certificates/#verify' },
        { label: 'Testing standards', href: '/quality/#testing' },
        { label: 'Quality process', href: '/quality/' },
        { label: 'Research use policy', href: '/research-use-policy/' },
      ],
    },
    {
      title: 'Featured',
      links: [
        { label: 'New research materials', href: '/products/?sort=newest' },
        { label: 'Most viewed', href: '/products/?sort=featured' },
        { label: 'Research library', href: '/research/' },
        { label: 'Wholesale programme', href: '/wholesale/' },
      ],
    },
  ],
  feature: {
    eyebrow: 'New',
    title: 'Batch verification',
    body: 'Enter a lot number to open the analytical documentation issued for that exact production run.',
    cta: { label: 'Verify a batch', href: '/certificates/' },
  },
};

const qualityMenu = {
  columns: [
    {
      title: 'How we test',
      links: [
        { label: 'Quality process', href: '/quality/' },
        { label: 'Testing standards', href: '/quality/#testing' },
        { label: 'Analytical methods', href: '/quality/#methods' },
        { label: 'Third-party laboratories', href: '/quality/#labs' },
      ],
    },
    {
      title: 'Documentation',
      links: [
        { label: 'Certificate library', href: '/certificates/' },
        { label: 'Search by lot number', href: '/certificates/' },
        { label: 'How to read a COA', href: '/research/what-a-certificate-of-analysis-contains/' },
        { label: 'Reading an HPLC result', href: '/research/reading-an-hplc-purity-result/' },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Research use policy', href: '/research-use-policy/' },
        { label: 'Shipping & handling', href: '/shipping/' },
        { label: 'Returns', href: '/shipping/#returns' },
        { label: 'Terms of sale', href: '/terms/' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Documentation support', href: '/contact/?topic=documentation' },
        { label: 'Product specifications', href: '/contact/?topic=product' },
        { label: 'Frequently asked questions', href: '/faq/' },
        { label: 'Contact the team', href: '/contact/' },
      ],
    },
  ],
  feature: {
    eyebrow: 'Method',
    title: 'What we test for',
    body: 'Every eligible lot is assessed by reversed-phase HPLC for purity and by mass spectrometry for identity.',
    cta: { label: 'Read the process', href: '/quality/' },
  },
};

const navItems = [
  { label: 'Products', href: '/products/', menu: 'products' },
  { label: 'Research', href: '/research/' },
  { label: 'Quality & Testing', href: '/quality/', menu: 'quality' },
  { label: 'Applications', href: '/applications/' },
  { label: 'Wholesale', href: '/wholesale/' },
  { label: 'Resources', href: '/certificates/' },
  { label: 'Support', href: '/contact/' },
];

/* ----------------------------------------------------------------- header */

function megaMenu(id, menu) {
  const col = (c) => `
    <div class="mega__col">
      <h3>${esc(c.title)}</h3>
      <ul class="mega__list">
        ${c.links.map((l) => `<li><a href="${l.href}"${l.strong ? ' style="font-weight:600"' : ''}>${esc(l.label)}${l.n ? `<span class="n">${l.n}</span>` : ''}</a></li>`).join('')}
      </ul>
    </div>`;
  return `
  <div class="mega" id="mega-${id}" data-open="false" role="region" aria-label="${esc(menu.columns[0].title)}">
    <div class="wrap mega__inner">
      ${menu.columns.map(col).join('')}
      <div class="mega__feature">
        <span class="eyebrow">${esc(menu.feature.eyebrow)}</span>
        <h3>${esc(menu.feature.title)}</h3>
        <p>${esc(menu.feature.body)}</p>
        <a class="btn btn--onDark btn--sm" href="${menu.feature.cta.href}">${esc(menu.feature.cta.label)}</a>
      </div>
    </div>
  </div>`;
}

function header(active) {
  const navLink = (item) => {
    const cur = active === item.label ? ' aria-current="page"' : '';
    if (item.menu) {
      return `<li>
        <button class="primary-nav__link" type="button" data-mega="${item.menu}" aria-expanded="false" aria-controls="mega-${item.menu}"${cur}>
          ${esc(item.label)}${icons.chevron}
        </button>
      </li>`;
    }
    return `<li><a class="primary-nav__link" href="${item.href}"${cur}>${esc(item.label)}</a></li>`;
  };

  return `
<!-- The utility strip sits OUTSIDE the sticky header on purpose. Inside it, the
     header had to shrink on scroll to stay a reasonable size, and shrinking a
     sticky element changes document height, which nudges scrollY, which
     re-crosses the threshold - a visible flicker loop. Out here it just
     scrolls away once, for free, and the header below keeps a constant
     height. -->
<div class="utility">
    <div class="wrap utility__inner">
      <div class="utility__group">
        <button class="utility__note" type="button" data-modal-open="region" style="background:none;border:0;color:inherit;cursor:pointer;font:inherit;">
          ${icons.globe}<span>United States - <span data-region-label>MA</span> · USD</span>
        </button>
        <span class="utility__sep utility__group--mobilehide"></span>
        <span class="utility__note utility__group--mobilehide">${icons.flask}<span>For laboratory research use only</span></span>
      </div>
      <div class="utility__group utility__group--desk">
        <a href="/contact/">Support</a>
        <span class="utility__sep"></span>
        <a href="/orders/">Orders</a>
        <span class="utility__sep"></span>
        <a href="/account/#wishlist">Wishlist <span class="utility__badge" data-wish-count hidden>0</span></a>
        <span class="utility__sep"></span>
        <a href="/login/">Sign in</a>
      </div>
    </div>
  </div>
</div>

<header class="site-header" data-header>
  <div class="wrap masthead">
    <a class="logo" href="/">
      <span class="logo__mark" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <rect width="34" height="34" rx="9" fill="#378189"/>
          <path d="M11 8.5h12M12.5 8.5v5.4L9.2 22a2.4 2.4 0 0 0 2.2 3.5h11.2a2.4 2.4 0 0 0 2.2-3.5l-3.3-8.1V8.5"
                stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10.6 21.2h2.1l1.2-4.4 1.6 7 1.4-4.2 1 1.8 1-1.1h4.4"
                stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
        </svg>
      </span>
      <span class="logo__word">
        <span class="logo__name">Purely<span class="logo__name2">Peptides</span></span>
        <span class="logo__sub">Research materials</span>
      </span>
    </a>

    <div class="masthead__search searchwrap">
      <form class="searchbar" action="/search/" method="get" role="search" autocomplete="off">
        <span class="searchbar__icon">${icons.search}</span>
        <label class="visually-hidden" for="site-search">Search products, CAS numbers, SKU or lot number</label>
        <input id="site-search" name="q" type="search" placeholder="Search products, CAS, SKU, articles or lot numbers"
               data-suggest aria-expanded="false" aria-controls="suggest-panel" aria-autocomplete="list" role="combobox">
        <button class="btn btn--primary" type="submit">Search</button>
      </form>
      <div class="suggest" id="suggest-panel" data-open="false" role="listbox" aria-label="Search suggestions"></div>
    </div>

    <div class="masthead__actions">
      <button class="iconbtn mobile-toggle" type="button" data-mobile-open aria-label="Open menu" aria-expanded="false">
        ${icons.menu}<span>Menu</span>
      </button>
      <button class="iconbtn search-toggle" type="button" data-search-open aria-label="Search">
        ${icons.search}<span>Search</span>
      </button>
      <a class="iconbtn" href="/account/">${icons.user}<span>Account</span></a>
      <a class="iconbtn iconbtn--optional" href="/products/#quick-order">${icons.bolt}<span>Quick order</span></a>
      <button class="iconbtn" type="button" data-cart-open aria-label="Open your order">
        ${icons.cart}<span>Cart</span><span class="iconbtn__badge" data-cart-count hidden>0</span>
      </button>
    </div>
  </div>

  <nav class="primary-nav" aria-label="Primary">
    <div class="wrap">
      <ul class="primary-nav__list">
        ${navItems.map(navLink).join('')}
        <li class="primary-nav__right">
          <a class="link-arrow" href="/certificates/">${icons.doc}<span>Verify a batch</span></a>
        </li>
      </ul>
    </div>
    ${megaMenu('products', productMenu)}
    ${megaMenu('quality', qualityMenu)}
  </nav>
</header>
<div class="nav-scrim" data-scrim data-open="false"></div>`;
}

/* ------------------------------------------------------------ mobile nav */

function mobileNav() {
  const group = (label, href, links) => `
    <div class="mobile-nav__group">
      ${links
        ? `<button class="mobile-nav__trigger" type="button" data-mnav aria-expanded="false">${esc(label)}${icons.chevron}</button>
           <div class="mobile-nav__panel" data-open="false"><div>
             ${links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}
           </div></div>`
        : `<a class="mobile-nav__trigger" href="${href}">${esc(label)}${icons.chevronRight}</a>`}
    </div>`;

  return `
<div class="mobile-nav" data-mobile-nav data-open="false" role="dialog" aria-modal="true" aria-label="Site menu">
  <div class="mobile-nav__head">
    <span class="logo__name">Purely<span class="logo__name2">Peptides</span></span>
    <button class="iconbtn" type="button" data-mobile-close aria-label="Close menu">${icons.close}</button>
  </div>
  <div class="mobile-nav__body">
    <form class="searchbar" action="/search/" method="get" role="search" style="margin-bottom:16px">
      <span class="searchbar__icon">${icons.search}</span>
      <label class="visually-hidden" for="m-search">Search</label>
      <input id="m-search" name="q" type="search" placeholder="Search products, CAS, SKU or lot">
    </form>
    ${group('Products', null, [
      ...categories.map((c) => ({ label: c.name, href: `/products/category/${c.slug}/` })),
      { label: 'All products', href: '/products/' },
    ])}
    ${group('Research area', null, researchAreas.map((a) => ({ label: a, href: `/products/?area=${encodeURIComponent(a)}` })))}
    ${group('Quality & testing', null, [
      { label: 'Quality process', href: '/quality/' },
      { label: 'Certificate library', href: '/certificates/' },
      { label: 'Testing standards', href: '/quality/#testing' },
      { label: 'Research use policy', href: '/research-use-policy/' },
    ])}
    ${group('Research library', '/research/')}
    ${group('Applications', '/applications/')}
    ${group('Wholesale', '/wholesale/')}
    ${group('Support', '/contact/')}
  </div>
  <div class="mobile-nav__foot">
    <a class="btn btn--secondary btn--block" href="/login/">Sign in</a>
    <a class="btn btn--primary btn--block" href="/certificates/">Verify a batch</a>
  </div>
</div>`;
}

/* ----------------------------------------------------------------- footer */

const footerColumns = [
  {
    title: 'Products',
    links: [
      { label: 'All products', href: '/products/' },
      { label: 'Research peptides', href: '/products/category/research-peptides/' },
      { label: 'Blends', href: '/products/category/blends/' },
      { label: 'New materials', href: '/products/?sort=newest' },
    ],
  },
  {
    title: 'Quality',
    links: [
      { label: 'Certificates', href: '/certificates/' },
      { label: 'Batch verification', href: '/certificates/' },
      { label: 'Testing', href: '/quality/#testing' },
      { label: 'Quality process', href: '/quality/' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Research library', href: '/research/' },
      { label: 'Technical resources', href: '/research/?filter=Methods' },
      { label: 'Applications', href: '/applications/' },
      { label: 'FAQs', href: '/faq/' },
    ],
  },
  {
    title: 'Ordering',
    links: [
      { label: 'Shipping', href: '/shipping/' },
      { label: 'Returns', href: '/shipping/#returns' },
      { label: 'Wholesale', href: '/wholesale/' },
      { label: 'Order tracking', href: '/orders/' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about/' },
      { label: 'Contact', href: '/contact/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy', href: '/privacy/' },
      { label: 'Research use policy', href: '/research-use-policy/' },
    ],
  },
];

function footer() {
  const socials = [
    ['LinkedIn', 'https://www.linkedin.com/', icons.linkedin],
    ['X', 'https://x.com/', icons.xsocial],
    ['YouTube', 'https://www.youtube.com/', icons.youtube],
    ['Facebook', 'https://www.facebook.com/', icons.facebook],
  ];

  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer__signup">
      <div>
        <h2>Method notes, straight to your inbox</h2>
        <p>
          A short monthly note on analytical method, handling and storage, written by the team that
          runs our testing programme. No promotional mail, and one click to stop it.
        </p>
      </div>
      <a class="btn btn--accent btn--lg" href="/contact/?topic=newsletter">Sign up now</a>
    </div>

    <div class="footer__grid">
      <div class="footer__brand">
        <a class="logo" href="/">
          <span class="logo__mark" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <rect width="34" height="34" rx="9" fill="#6DB9C1"/>
              <path d="M11 8.5h12M12.5 8.5v5.4L9.2 22a2.4 2.4 0 0 0 2.2 3.5h11.2a2.4 2.4 0 0 0 2.2-3.5l-3.3-8.1V8.5"
                    stroke="#071112" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10.6 21.2h2.1l1.2-4.4 1.6 7 1.4-4.2 1 1.8 1-1.1h4.4"
                    stroke="#071112" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
            </svg>
          </span>
          <span class="logo__word">
            <span class="logo__name">Purely<span class="logo__name2">Peptides</span></span>
            <span class="logo__sub">Research materials</span>
          </span>
        </a>
        <address class="footer__addr">
          ${brand.address.map(esc).join('<br>')}<br>
          <a href="mailto:${brand.email}">${brand.email}</a><br>
          <a href="tel:${brand.phone.replace(/[^+\d]/g, '')}">${brand.phone}</a>
        </address>
        <div class="footer__social">
          ${socials.map(([label, href, svg]) => `<a href="${href}" rel="noopener" aria-label="${label}">${svg}</a>`).join('')}
        </div>
      </div>
      ${footerColumns
        .map(
          (c) => `<nav aria-labelledby="f-${c.title.toLowerCase()}">
        <h2 id="f-${c.title.toLowerCase()}">${esc(c.title)}</h2>
        <button class="footer__acc-toggle" type="button" data-facc aria-expanded="false">${esc(c.title)}${icons.chevron}</button>
        <ul class="footer__list">${c.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>
      </nav>`
        )
        .join('')}
    </div>

    <p class="footer__disclaimer">
      <strong>Research use only.</strong> All materials supplied by ${esc(brand.legal)} are intended exclusively for
      laboratory research and in-vitro investigation by qualified professionals. They are not drugs, foods, cosmetics
      or medical devices, and are not for human or veterinary use, diagnostic use, or any form of consumption.
      Nothing on this site is a claim of therapeutic effect. Purchasers are responsible for compliance with all
      applicable laws and institutional requirements governing the handling and disposal of research materials.
    </p>

    <div class="footer__legal">
      <span>© ${new Date().getFullYear()} ${esc(brand.legal)}. All rights reserved.</span>
      <span class="row" style="gap:20px">
        <a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><a href="/research-use-policy/">Research use policy</a>
      </span>
    </div>
  </div>
</footer>`;
}

/* ---------------------------------------------------------------- overlays */

function overlays() {
  return `
<aside class="cart-drawer" data-cart-drawer data-open="false" role="dialog" aria-modal="true" aria-label="Order summary">
  <div class="cart-drawer__head">
    <h2 style="font-size:var(--t-h4)">Your order <span class="mono muted small" data-cart-countword>(0 items)</span></h2>
    <button class="modal__close" type="button" data-cart-close aria-label="Close order summary">${icons.close}</button>
  </div>
  <div class="cart-drawer__body">
    <div data-cart-lines></div>

    <div class="empty" data-cart-empty hidden>
      ${icons.cart}
      <h3>Your order is empty</h3>
      <p>Materials you add will appear here, with the certificate for the lot that ships.</p>
      <a class="btn btn--secondary" href="/products/">Browse the catalogue</a>
    </div>

    <div class="notice notice--accent" data-cart-docnote hidden style="margin-top:24px">
      ${icons.doc}
      <div>Certificates for every lot in this order are attached and will be available in your account after checkout.</div>
    </div>
  </div>
  <div class="cart-drawer__foot">
    <div class="trow"><span>Subtotal</span><span class="num" data-cart-subtotal>$0.00</span></div>
    <div class="trow"><span>Shipping</span><span class="num muted">Calculated at checkout</span></div>
    <a class="btn btn--primary btn--block btn--lg" href="/checkout/" style="margin-top:12px" data-cart-checkout data-region-gated>Proceed to checkout</a>
    <a class="btn btn--secondary btn--block" href="/cart/" style="margin-top:8px">View full order</a>
  </div>
</aside>

<div class="modal-scrim" data-modal="region" data-open="false" role="dialog" aria-modal="true" aria-labelledby="region-title">
  <div class="modal">
    <div class="modal__head">
      <div>
        <h2 id="region-title" style="font-size:var(--t-h3)">Shipping destination</h2>
        <p class="small muted" style="margin-top:6px">Shipping rates, tax and availability follow the destination state.</p>
      </div>
      <button class="modal__close" type="button" data-modal-close aria-label="Close">${icons.close}</button>
    </div>
    <div class="modal__body">
      <div class="grid grid-2" style="gap:0 24px">
        ${[
          ['MA', 'Massachusetts', false],
          ['TX', 'Texas', false],
          ['FL', 'Florida', false],
          ['IL', 'Illinois', false],
          ['CA', 'California', true],
          ['NY', 'New York', true],
          ['LA', 'Louisiana', true],
          ['WA', 'Washington', false],
        ]
          .map(
            ([code, name, restricted]) => `<label class="check">
              <input type="radio" name="region" value="${code}" data-region-set>
              <span>${name}<span class="check__count">${restricted ? 'Restricted' : code}</span></span>
            </label>`
          )
          .join('')}
      </div>
      <div class="notice" style="margin-top:16px">
        ${icons.info}
        <div>Three states currently restrict shipment of these materials: <strong>California, New York and Louisiana</strong>. Selecting one of them blocks checkout rather than failing after payment.</div>
      </div>
    </div>
    <div class="modal__foot">
      <button class="btn btn--secondary" type="button" data-modal-close>Cancel</button>
      <button class="btn btn--primary" type="button" data-modal-close>Save region</button>
    </div>
  </div>
</div>

<div class="toast-region" data-toasts aria-live="polite" aria-atomic="false"></div>

<!-- Age + intended-use gate. Rendered hidden and revealed by script, so it
     never blocks a crawler or a no-JS reader from the content behind it -
     it is a declaration of intent, not a security control, and pretending
     otherwise would be the wrong kind of theatre. -->
<div class="agegate" data-agegate hidden role="dialog" aria-modal="true" aria-labelledby="agegate-title">
  <div class="agegate__card">
    <span class="agegate__mark" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
        <rect width="34" height="34" rx="9" fill="#378189"/>
        <path d="M11 8.5h12M12.5 8.5v5.4L9.2 22a2.4 2.4 0 0 0 2.2 3.5h11.2a2.4 2.4 0 0 0 2.2-3.5l-3.3-8.1V8.5"
              stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span class="eyebrow">Before you continue</span>
    <h2 id="agegate-title">Laboratory research use only</h2>
    <p>
      ${esc(brand.legal)} supplies materials for in-vitro laboratory research by qualified
      professionals. Nothing on this site is a drug, food, cosmetic or medical device, and nothing
      here is for human or veterinary use, diagnostic use, or consumption of any kind.
    </p>
    <ul class="agegate__list">
      <li>${icons.check}I am 18 years of age or older</li>
      <li>${icons.check}I am purchasing for laboratory research purposes</li>
      <li>${icons.check}I will not administer these materials to humans or animals</li>
    </ul>
    <div class="agegate__actions">
      <button class="btn btn--primary btn--lg" type="button" data-agegate-accept>I confirm - enter the site</button>
      <a class="btn btn--secondary btn--lg" href="https://www.nih.gov/" rel="noopener">I do not confirm</a>
    </div>
    <p class="agegate__fine">
      Your confirmation is stored in this browser so you are not asked again. See our
      <a class="link" href="/research-use-policy/">research use policy</a> and
      <a class="link" href="/terms/">terms</a>.
    </p>
  </div>
</div>`;
}

/* ------------------------------------------------------------------- page */

function page({ title, description, body, active, schema, canonical, bodyClass = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | ${esc(brand.name)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="https://purelypeptides.com${canonical || '/'}">
<meta property="og:title" content="${esc(title)} | ${esc(brand.name)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#378189">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34'%3E%3Crect width='34' height='34' rx='8' fill='%23378189'/%3E%3Cpath d='M11 8.5h12M12.5 8.5v5.4L9.2 22a2.4 2.4 0 0 0 2.2 3.5h11.2a2.4 2.4 0 0 0 2.2-3.5l-3.3-8.1V8.5' stroke='white' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rokkitt:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap">
<script>document.documentElement.classList.add('has-js')</script>
<link rel="stylesheet" href="/css/styles.css">
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to main content</a>
${header(active)}
<main id="main">
${body}
</main>
${footer()}
${mobileNav()}
${overlays()}
<script src="/js/catalogue.js" defer></script>
<script src="/js/store.js" defer></script>
<script src="/js/script.js" defer></script>
<script src="/js/catalog.js" defer></script>
<script src="/js/forms.js" defer></script>
</body>
</html>`;
}

module.exports = { page, esc, money, header, footer, navItems };
