'use strict';
/**
 * Exports the product categories and products (one variation per size) for
 * import into WooCommerce. Counts are whatever src/data.js holds - 8
 * categories, 51 products, 82 sizes as of the 21 Sep 2026 inventory sheet.
 *
 *   node tools/export-wp-products.js
 *
 * Output:
 *   wordpress/content/categories.json   categories
 *   wordpress/content/products.json     products, each with its sizes[]
 *
 * `cas` / `formula` / `mw` / `purity` are exported exactly as `src/data.js`
 * already resolves them - including the literal "On request" string for the
 * products with no supporting document (`verify: true`). There is no null to
 * handle on the WordPress side; the static build already did that
 * normalisation, and this export reads the same finished objects it reads.
 *
 * Image and SDS files are NOT copied here - they already live in
 * wordpress/themes/pph-child/assets/img/ and wordpress/uploads/pph/doc/sds/
 * from tools/export-wp-theme.js. This export only points at them by filename.
 */

const fs = require('fs');
const path = require('path');

const { categories, products, sdsFor } = require('../src/data');
const { productShotName } = require('../src/art');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'wordpress', 'content');

fs.mkdirSync(CONTENT, { recursive: true });

/* -------------------------------------------------------------- categories */

const cats = categories.map((c) => ({
  slug: c.slug,
  name: c.name,
  description: c.blurb,
}));

fs.writeFileSync(path.join(CONTENT, 'categories.json'), JSON.stringify(cats, null, 2) + '\n', 'utf8');

/* ----------------------------------------------------------------- products */

/* Same slug rule build.js's catalogue.js uses for a variation's image, so a
   product's photo matches what the static build already showed for it. */
const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const prods = products.map((p) => {
  const sds = sdsFor(p.slug);

  return {
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    category_slug: p.category,
    area: p.area,
    cas: p.cas,
    formula: p.formula,
    mw: p.mw,
    sequence: p.sequence,
    form: p.form,
    purity: p.purity,
    method: p.method,
    storage: p.storage,
    verify: !!p.verify,
    featured: !!p.featured,
    date: p.added,
    summary: p.summary,
    overview: p.overview,
    image: 'img/' + productShotName(p.sku) + '.jpg',
    /* Every other size photograph, for the product gallery. */
    gallery: p.sizes.filter((s) => s.img).map((s) => 'img/' + s.img + '.jpg')
      .filter((img) => img !== 'img/' + productShotName(p.sku) + '.jpg'),
    sds_url: sds ? sds.doc.replace(/^\/doc\//, '/wp-content/uploads/pph/doc/') : '',
    sds_ref: sds ? sds.ref : '',
    sizes: p.sizes.map((s) => ({
      label: s.label,
      /* PPH-1001-5MG, PPH-7001-50-10-10MG - unique across the whole catalogue
         because it is built from the already-unique parent SKU. */
      sku: p.sku + '-' + slug(s.label).toUpperCase(),
      price: s.price,
      wholesale: s.wholesale, // null = no wholesale price, account pays retail
      stock: s.stock, // 'in-stock' | 'backorder'
      qty: s.qty, // units on hand for in-stock sizes, else null
      lot: s.lot || '',
      image: s.img ? 'img/' + s.img + '.jpg' : '',
    })),
  };
});

fs.writeFileSync(path.join(CONTENT, 'products.json'), JSON.stringify(prods, null, 2) + '\n', 'utf8');

/* ------------------------------------------------------------------ check */

const bad = [];
const seenVariationSkus = new Set();


const catSlugs = new Set(cats.map((c) => c.slug));
let variationCount = 0;

for (const p of prods) {
  if (!catSlugs.has(p.category_slug)) bad.push(`product ${p.slug}: unknown category ${p.category_slug}`);
  if (!p.sizes.length) bad.push(`product ${p.slug}: no sizes`);

  for (const s of p.sizes) {
    variationCount++;
    if (seenVariationSkus.has(s.sku)) bad.push(`duplicate variation SKU ${s.sku}`);
    seenVariationSkus.add(s.sku);
    if (!s.price && s.price !== 0) bad.push(`${p.slug} ${s.label}: no price`);
    if (!['in-stock', 'backorder'].includes(s.stock)) bad.push(`${p.slug} ${s.label}: unknown stock state ${s.stock}`);
    if (s.stock === 'in-stock' && !(s.qty > 0)) bad.push(`${p.slug} ${s.label}: in stock with no quantity`);
    if (s.wholesale !== null && !(s.wholesale > 0 && s.wholesale <= s.price)) bad.push(`${p.slug} ${s.label}: wholesale ${s.wholesale} not between 0 and retail ${s.price}`);
    if (s.image && !fs.existsSync(path.join(ROOT, 'public', s.image))) bad.push(`${p.slug} ${s.label}: image not found at public/${s.image}`);
  }

  const imgFile = path.join(ROOT, 'public', p.image);
  if (!fs.existsSync(imgFile)) bad.push(`product ${p.slug}: image not found at public/${p.image}`);
}


if (bad.length) {
  console.error('Product export failed:\n  ' + bad.join('\n  '));
  process.exit(1);
}

console.log(
  `Exported ${cats.length} categories and ${prods.length} products (${variationCount} size-variations) ` +
    `to wordpress/content/\nImport with: wp eval-file tools/import-wp-products.php --user=1`
);
