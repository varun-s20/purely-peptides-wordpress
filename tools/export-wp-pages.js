'use strict';
/**
 * Exports the STATIC PROSE pages of the build as WordPress-ready page bodies.
 *
 * These are the only pages that get pasted into WordPress. Everything else -
 * products, categories, certificates, articles, cart, checkout, account, home -
 * is template-driven and is rebuilt as a template, not imported as content.
 * See CONVERSION-PLAN.md section 2 for which layer owns which page.
 *
 *   node tools/export-wp-pages.js
 *
 * Output: wordpress/pages/<slug>.html  +  wordpress/pages/manifest.json
 * Then:   wp eval-file tools/import-wp-pages.php --user=1
 *
 * Bodies are taken from `<main id="main">` (there is exactly one per page) and
 * keep their clean internal URLs - /terms/, /products/ - because WordPress is
 * configured to serve exactly those paths. Only asset paths are rewritten.
 */

const fs = require('fs');
const path = require('path');

const S = require('../src/pages/static');
const wholesale = require('../src/pages/wholesale');

/* Where the assets land in WordPress. Decorative and brand artwork ships
   inside the child theme; the client's own documents and the product shots go
   to the Media Library so he can replace them without us. */
const THEME_ASSETS = '/wp-content/themes/pph-child/assets';
const UPLOADS = '/wp-content/uploads/pph';

/* slug -> WordPress page. Order is the order they are created in. */
const PAGES = [
  ['about', S.about],
  ['quality', S.quality],
  ['applications', S.applications],
  ['faq', S.faq],
  ['contact', S.contact],
  ['wholesale', wholesale.wholesale],
  ['wholesale/apply', wholesale.apply],
  ['shipping', S.shipping],
  ['refunds', S.refunds],
  ['chargebacks', S.chargebacks],
  ['terms', S.terms],
  ['privacy', S.privacy],
  ['research-use-policy', S.researchUsePolicy],
  ['404', S.notFound],
];

const OUT = path.join(__dirname, '..', 'wordpress', 'pages');

/* ----------------------------------------------------------------- extract */

function between(html, open, close) {
  const a = html.indexOf(open);
  if (a === -1) throw new Error(`missing ${open}`);
  const b = html.lastIndexOf(close);
  if (b === -1 || b < a) throw new Error(`missing ${close}`);
  return html.slice(a + open.length, b);
}

/* <title> and <meta description> are HTML-escaped in the source. WordPress
   wants the plain text - it escapes again on output. */
function unesc(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function tag(html, re, label) {
  const m = html.match(re);
  if (!m) throw new Error(`no ${label}`);
  return unesc(m[1]);
}

/* Asset paths only. Page links are already the paths WordPress will serve. */
function rewriteAssets(html) {
  return html
    .replace(/(["'(])\/img\//g, `$1${THEME_ASSETS}/img/`)
    .replace(/(["'(])\/doc\//g, `$1${UPLOADS}/doc/`)
    .replace(/(["'(])\/video\//g, `$1${UPLOADS}/video/`);
}

/* -------------------------------------------------------------------- run */

fs.mkdirSync(OUT, { recursive: true });

const manifest = [];
for (const [slug, fn] of PAGES) {
  const full = fn();
  const title = tag(full, /<title>([^<]*)<\/title>/, `title in ${slug}`).split(' | ')[0].trim();
  const description = tag(full, /<meta name="description" content="([^"]*)"/, `description in ${slug}`);
  const body = rewriteAssets(between(full, '<main id="main">', '</main>')).trim();

  const file = slug.replace(/\//g, '--') + '.html';
  fs.writeFileSync(path.join(OUT, file), body + '\n', 'utf8');
  manifest.push({ slug, title, description, file, bytes: Buffer.byteLength(body) });
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

/* A body that still points at a dev path, an unrewritten asset, or a flat
   .html link would import silently and break later. Fail here instead. */
const bad = [];
for (const entry of manifest) {
  const body = fs.readFileSync(path.join(OUT, entry.file), 'utf8');
  if (/href="[a-z0-9-]+\.html"/i.test(body)) bad.push(`${entry.slug}: flat .html link`);
  if (/(["'(])\/(img|doc|video)\//.test(body)) bad.push(`${entry.slug}: unrewritten asset path`);
  if (/localhost|127\.0\.0\.1|file:\/\//.test(body)) bad.push(`${entry.slug}: dev URL`);
}
if (bad.length) {
  console.error('Export failed:\n  ' + bad.join('\n  '));
  process.exit(1);
}

const total = manifest.reduce((n, e) => n + e.bytes, 0);
console.log(
  `Exported ${manifest.length} page bodies (${(total / 1024).toFixed(0)} KB) to wordpress/pages/\n` +
    `Import with: wp eval-file tools/import-wp-pages.php --user=1`
);
