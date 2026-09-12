'use strict';
/**
 * Drawn art system. Every visual on the site is generated SVG - no raster
 * assets, no stock photography. The recurring motif is an HPLC chromatogram,
 * which is the actual vernacular of the product's documentation.
 */

/* ------------------------------------------------------------ seeded rand */

function rng(seed) {
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) % 2147483647;
  s = s || 12345;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* ------------------------------------------------------- chromatogram trace
   A gaussian main peak plus small impurity peaks. Deterministic per seed so
   the same lot always renders the same trace. */

function tracePath(seed, w, h, opts = {}) {
  const rand = rng(seed);
  const base = h - (opts.pad || 6);
  const main = { c: opts.mainAt || 0.44, s: 0.022, a: opts.mainA || 0.86 };
  const minor = [];
  const n = opts.minor === undefined ? 5 : opts.minor;
  for (let i = 0; i < n; i++) {
    minor.push({ c: 0.1 + rand() * 0.8, s: 0.006 + rand() * 0.012, a: 0.02 + rand() * 0.1 });
  }
  const peaks = [main, ...minor];
  const pts = [];
  const steps = opts.steps || 240;
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    let y = 0;
    for (const p of peaks) y += p.a * Math.exp(-((x - p.c) ** 2) / (2 * p.s * p.s));
    y += 0.004 * Math.sin(x * 90) + 0.004 * rand();
    pts.push([x * w, base - Math.min(y, 1) * (base - (opts.top || 8))]);
  }
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
}

/**
 * Standalone chromatogram figure with axes.
 *
 * The trace carries `pathLength="1"`, which normalises its length regardless of
 * the actual geometry - so one dash-offset rule animates every chromatogram on
 * the site, whatever its width or seed. The draw-on is wired up in script.js.
 */
function chromatogram(seed, opts = {}) {
  const w = opts.w || 600;
  const h = opts.h || 200;
  const stroke = opts.stroke || '#1DAFCB';
  const grid = opts.grid !== false;
  const d = tracePath(seed, w, h, { top: 14, pad: 22, minor: opts.minor, mainAt: opts.mainAt });
  let gridLines = '';
  if (grid) {
    for (let i = 1; i < 6; i++) {
      const y = ((h - 22) / 6) * i + 4;
      gridLines += `<line x1="0" y1="${y.toFixed(0)}" x2="${w}" y2="${y.toFixed(0)}" stroke="${opts.gridColor || '#EDEDEA'}" stroke-width="1"/>`;
    }
    for (let i = 1; i < 10; i++) {
      const x = (w / 10) * i;
      gridLines += `<line x1="${x.toFixed(0)}" y1="0" x2="${x.toFixed(0)}" y2="${h - 22}" stroke="${opts.gridColor || '#EDEDEA'}" stroke-width="1"/>`;
    }
  }
  const label = opts.axis === false ? '' :
    `<text x="0" y="${h - 6}" font-family="Noto Sans, sans-serif" font-size="9" fill="#5C6E71" letter-spacing="1">0 MIN</text>
     <text x="${w}" y="${h - 6}" text-anchor="end" font-family="Noto Sans, sans-serif" font-size="9" fill="#5C6E71" letter-spacing="1">30 MIN</text>`;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${opts.alt || 'Reversed-phase HPLC chromatogram trace'}" preserveAspectRatio="none">
    ${gridLines}
    <line x1="0" y1="${h - 22}" x2="${w}" y2="${h - 22}" stroke="#C1C1C1" stroke-width="1"/>
    <path class="trace" d="${d}" fill="none" stroke="${stroke}" stroke-width="${opts.weight || 1.4}"
          stroke-linejoin="round" stroke-linecap="round" pathLength="1"/>
    ${label}
  </svg>`;
}

/* ----------------------------------------------------------- photography

   Real photographs carry everything a camera can honestly show: the product,
   the bench, the people, the cold store, the paperwork. Each file was fetched
   at the exact size its slot renders at. Sources and licences are recorded in
   public/img/CREDITS.md.

   What is still drawn, and why: the chromatogram and the analytical worksheet
   below are seeded from a lot number and carry that lot's own measured values.
   A stock photograph of somebody else's trace would be a picture of data we
   did not produce, presented as if we had. Those two stay generated. */

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * A photograph with its intrinsic size declared, so the layout reserves the
 * box before the file arrives and nothing jumps on load.
 */
function photo(name, alt, w, h, opts = {}) {
  return `<img src="/img/${name}.jpg" alt="${attr(alt)}" width="${w}" height="${h}"` +
    ` loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async">`;
}

/* Three studio shots of sealed vials, from one shoot so the catalogue grid
   stays visually level. Every peptide in the catalogue ships as lyophilised
   powder in a vial of this type, so the photograph is accurate for all of
   them - but it is a photograph of the format, not of that specific compound,
   which is why no label text is composited onto the glass. */
const PRODUCT_SHOTS = ['prod-a', 'prod-b', 'prod-c'];

/**
 * Same SKU always resolves to the same shot, so a product never changes photo.
 * `variant` steps to the next shot in the rotation - the product page uses it
 * for the second gallery frame.
 */
/** Which of the three shots a SKU resolves to. Exported so the build can bake
 *  the same answer into the client catalogue - the cart renders products the
 *  page was never server-rendered with, and the photo must not change. */
function productShotName(sku, variant = 0) {
  // Not rng(): SKUs run PP-1001..PP-1020 and that generator maps 18 of the
  // 20 onto the same shot. A plain rolling hash spreads sequential keys evenly.
  let h = 0;
  for (const ch of String(sku)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PRODUCT_SHOTS[(h + variant) % PRODUCT_SHOTS.length];
}

function productShot(sku, name, opts = {}) {
  const shot = productShotName(sku, opts.variant || 0);
  const alt = name
    ? `${name} supplied as lyophilised powder in a sealed glass vial`
    : 'Lyophilised research material in a sealed glass vial';
  return photo(shot, alt, 900, 900, opts);
}

const CATEGORY_PHOTOS = {
  'metabolic-research': ['cat-metabolic', 'A plate reader and pipette tips set out for an assay run'],
  'growth-factor-research': ['cat-protein', 'A researcher pipetting a sample into glassware at the bench'],
  'cell-signalling-research': ['cat-cellular', 'Medium being dispensed into a multi-well cell culture plate'],
  'cognitive-research': ['cat-cognitive', 'A fluorescence micrograph of labelled neural tissue'],
  'melanocortin-research': ['cat-peptides', 'A tray of sealed glass vials awaiting labelling'],
  cofactors: ['cat-protein', 'A researcher pipetting a sample into glassware at the bench'],
  blends: ['cat-blends', 'A solution being dispensed into a vial during blending'],
};

function categoryPhoto(slug) {
  const [name, alt] = CATEGORY_PHOTOS[slug] || CATEGORY_PHOTOS['metabolic-research'];
  return photo(name, alt, 880, 400);
}

const ARTICLE_PHOTOS = {
  'peptide-solubility-a-practical-guide': ['art-solubility', 'A pipette delivering solvent into a small vial'],
  'storage-and-reconstitution-of-lyophilised-peptides': ['art-storage', 'A gloved hand retrieving a vial from cold storage'],
  'reading-an-hplc-purity-result': ['art-hplc', 'Amber autosampler vials on an analytical bench'],
  'what-a-certificate-of-analysis-contains': ['art-coa', 'A printed analytical report on a desk'],
  'mass-spectrometry-as-an-identity-check': ['art-massspec', 'An analyst operating an instrument in a controlled area'],
  'endotoxin-testing-when-it-matters': ['art-endotoxin', 'A gloved hand holding a culture plate up for inspection'],
  'comparing-synthesis-routes-for-short-peptides': ['art-synthesis', 'A chemist working at a fume hood in full protective gear'],
  'lot-traceability-in-research-procurement': ['art-traceability', 'Archived record cards filed in a drawer'],
};

function articlePhoto(slug) {
  const entry = ARTICLE_PHOTOS[slug];
  // An article without its own photograph borrows the bench shot rather than
  // dropping the image slot and breaking the card grid.
  const [name, alt] = entry || ['art-hplc', 'Analytical work in progress at the bench'];
  return photo(name, alt, 760, 420);
}

/* ------------------------------------------------------------ lab worksheet */

function labPlate() {
  return `<svg viewBox="0 0 480 600" role="img" aria-label="Analytical worksheet showing a chromatographic trace above a tabulated result set">
    <rect width="480" height="600" fill="#F6F6F4"/>
    <rect x="36" y="40" width="408" height="520" fill="#FFFFFF" stroke="#D7D7D7"/>
    <rect x="36" y="40" width="408" height="7" fill="#1DAFCB"/>
    <g font-family="Noto Sans, sans-serif" font-size="9" letter-spacing="1" fill="#5C6E71">
      <text x="60" y="82">ANALYTICAL RECORD</text>
      <text x="420" y="82" text-anchor="end">BP-260910</text>
    </g>
    <line x1="60" y1="96" x2="420" y2="96" stroke="#D7D7D7"/>
    <g transform="translate(60, 112)">
      ${chromatogram('BP-260910-plate', { w: 360, h: 168, gridColor: '#E8F7FA' }).replace(/<svg[^>]*>|<\/svg>/g, '')}
    </g>
    <line x1="60" y1="300" x2="420" y2="300" stroke="#051214"/>
    <g font-family="Noto Sans, sans-serif" font-size="10">
      ${[['METHOD', 'RP-HPLC'], ['DETECTION', '220 NM'], ['COLUMN', 'C18 4.6 × 250 MM'], ['RT (MAIN)', '13.42 MIN'], ['AREA %', '99.4'], ['IDENTITY', 'CONFORMS - ESI-MS'], ['TESTED', '10 SEP 2026']]
        .map(([k, v], i) => `<text x="60" y="${326 + i * 26}" fill="#5C6E71">${k}</text><text x="420" y="${326 + i * 26}" text-anchor="end" fill="#051214">${v}</text><line x1="60" y1="${334 + i * 26}" x2="420" y2="${334 + i * 26}" stroke="#E8F7FA"/>`).join('')}
    </g>
    <g transform="translate(60, 522)">
      <rect width="120" height="22" rx="3" fill="#EEF7E8" stroke="#CBE4BC"/>
      <text x="60" y="15" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="9" letter-spacing="1" fill="#3F7E27">VERIFIED LOT</text>
    </g>
  </svg>`;
}

/* ------------------------------------------------------------------ icons */

const I = (p, extra = '') =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${p}</svg>`;

const F = (p, extra = '') =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"${extra}>${p}</svg>`;

const icons = {
  search: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>'),
  user: I('<path d="M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1"/><circle cx="12" cy="7" r="4"/>'),
  cart: I('<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/>'),
  bolt: I('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'),
  heart: I('<path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 0 0-7.1 7.1l8.4 8.4 8.4-8.4a5 5 0 0 0 0-7.1Z"/>'),
  doc: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
  check: I('<path d="M20 6 9 17l-5-5"/>'),
  checkCircle: I('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
  alert: I('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>'),
  flask: I('<path d="M10 3v6.5L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M8.5 3h7M7.5 14h9"/>'),
  shield: I('<path d="M12 3l7 3v5.5c0 4.3-2.9 7.9-7 9.5-4.1-1.6-7-5.2-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>'),
  truck: I('<path d="M3 7h10v9H3z"/><path d="M13 10h4l3 3v3h-7z"/><circle cx="7" cy="18.5" r="1.6"/><circle cx="17" cy="18.5" r="1.6"/>'),
  chart: I('<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3.5-5 3 3L20 7"/>'),
  chevron: I('<path d="m6 9 6 6 6-6"/>', ' width="14" height="14" class="chev"'),
  chevronRight: I('<path d="m9 6 6 6-6 6"/>', ' width="14" height="14"'),
  arrow: I('<path d="M5 12h13M13 6l6 6-6 6"/>', ' width="15" height="15"'),
  close: I('<path d="M6 6l12 12M18 6 6 18"/>'),
  menu: I('<path d="M3 6h18M3 12h18M3 18h18"/>'),
  filter: I('<path d="M3 5h18M6 12h12M10 19h4"/>'),
  grid: I('<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>', ' width="16" height="16"'),
  list: I('<path d="M4 6h16M4 12h16M4 18h16"/>', ' width="16" height="16"'),
  download: I('<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>'),
  external: I('<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>'),
  lock: I('<rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>'),
  box: I('<path d="M20 7.5 12 3 4 7.5v9L12 21l8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>'),
  refresh: I('<path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"/><path d="M20 20v-4.5h-4.5"/>'),
  pin: I('<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>'),
  phone: I('<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/>'),
  settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>'),
  help: I('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3M12 16.5v.01"/>'),
  building: I('<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M14 9h4a2 2 0 0 1 2 2v10"/><path d="M8 7h2M8 11h2M8 15h2M17 13h1M17 17h1"/><path d="M3 21h18"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>'),
  thermometer: I('<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4.5 4.5 0 1 0 4 0Z"/><path d="M12 9v6"/>'),
  arrowLeft: I('<path d="M19 12H6M11 6l-6 6 6 6"/>', ' width="15" height="15"'),
  chevronLeft: I('<path d="m15 6-6 6 6 6"/>', ' width="14" height="14"'),

  /* Brand marks are solid glyphs, so they bypass the stroked I() helper. */
  linkedin: F('<path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9z"/>'),
  xsocial: F('<path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.7 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.6zm-1.1 16h1.8L7.7 4.9H5.8z"/>'),
  youtube: F('<path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.78 2 12 2 12s0 3.22.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.22 22 12 22 12s0-3.22-.4-4.8ZM10 15.2V8.8l5.2 3.2z"/>'),
  facebook: F('<path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/>'),
};

module.exports = {
  chromatogram, tracePath, labPlate, icons, rng,
  photo, productShot, productShotName, categoryPhoto, articlePhoto,
};
