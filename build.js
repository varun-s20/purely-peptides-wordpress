'use strict';
/**
 * Generates the website: one plain .html file per page, plus a single global
 * stylesheet and script. No dependencies - run with `node build.js`.
 *
 * Output (site/) is an ordinary static website. Open site/index.html directly
 * in a browser, drop the folder on any host, or run `npm start` to preview it.
 */

const fs = require('fs');
const path = require('path');

const { categories, products, lots, articles } = require('./src/data');
const home = require('./src/pages/home');
const catalog = require('./src/pages/catalog');
const productPage = require('./src/pages/product');
const certificates = require('./src/pages/certificates');
const research = require('./src/pages/research');
const commerce = require('./src/pages/commerce');
const account = require('./src/pages/account');
const wholesale = require('./src/pages/wholesale');
const S = require('./src/pages/static');
const styleguide = require('./src/pages/styleguide');
const emails = require('./src/pages/emails');

const OUT = path.join(__dirname, 'site');

/* ------------------------------------------------------------------ routes
   Each entry is [url, file, html]:
     url  - the clean path used for canonical tags and the sitemap
     file - the flat .html file actually written to site/
*/

const routes = [
  ['/', 'index.html', home()],
  ['/products/', 'products.html', catalog.productsLanding()],
  ['/search/', 'search.html', catalog.searchPage()],
  ['/certificates/', 'certificates.html', certificates.coaLibrary()],
  ['/research/', 'research.html', research.library()],
  ['/quality/', 'quality.html', S.quality()],
  ['/applications/', 'applications.html', S.applications()],
  ['/wholesale/', 'wholesale.html', wholesale.wholesale()],
  ['/wholesale/apply/', 'wholesale-apply.html', wholesale.apply()],
  ['/cart/', 'cart.html', commerce.cart()],
  ['/checkout/', 'checkout.html', commerce.checkout()],
  ['/account/', 'account.html', account.dashboard()],
  ['/orders/', 'orders.html', account.orders()],
  ['/login/', 'login.html', account.login()],
  ['/about/', 'about.html', S.about()],
  ['/contact/', 'contact.html', S.contact()],
  ['/faq/', 'faq.html', S.faq()],
  ['/shipping/', 'shipping.html', S.shipping()],
  ['/refunds/', 'refunds.html', S.refunds()],
  ['/chargebacks/', 'chargebacks.html', S.chargebacks()],
  ['/terms/', 'terms.html', S.terms()],
  ['/privacy/', 'privacy.html', S.privacy()],
  ['/research-use-policy/', 'research-use-policy.html', S.researchUsePolicy()],
  ['/styleguide/', 'styleguide.html', styleguide()],
  ['/emails/', 'emails.html', emails()],
  ['/404/', '404.html', S.notFound()],
];

categories.forEach((c) =>
  routes.push([`/products/category/${c.slug}/`, `category-${c.slug}.html`, catalog.categoryPage(c)])
);
products.forEach((p) => routes.push([`/products/${p.slug}/`, `product-${p.slug}.html`, productPage(p)]));
// Only lots we actually hold a certificate for get a certificate page. A page
// for a lot with no document would be a certificate that certifies nothing.
lots.filter((l) => l.doc).forEach((l) => {
  const id = l.lot.toLowerCase();
  routes.push([`/certificates/${id}/`, `certificate-${id}.html`, certificates.coaDetail(l)]);
});
articles.forEach((a) => routes.push([`/research/${a.slug}/`, `article-${a.slug}.html`, research.articlePage(a)]));
account.ORDERS.forEach((o) => {
  const id = o.id.toLowerCase();
  routes.push([`/orders/${id}/`, `order-${id}.html`, account.orderDetail(o)]);
});

/* ------------------------------------------------------------------- links
   Page modules author links as clean paths (/products/bpc-157/). Here they are
   rewritten to the flat file names, so every link works from the file system
   as well as from a server. Query strings and #fragments are preserved.
*/

const linkMap = new Map(routes.map(([url, file]) => [url, file]));
const unresolved = new Set();

function rewriteLinks(html) {
  return html.replace(/\b(href|src|action|poster)="\/([^"]*)"/g, (whole, attr, value) => {
    const [, pathPart, suffix = ''] = ('/' + value).match(/^([^?#]*)([?#].*)?$/);

    // Assets keep their folder, just lose the leading slash.
    if (/\.(css|js|xml|txt|png|svg|jpg|jpeg|webp|avif|ico|pdf|mp4|webm)$/i.test(pathPart)) {
      return `${attr}="${pathPart.slice(1)}${suffix}"`;
    }
    const file = linkMap.get(pathPart.endsWith('/') ? pathPart : pathPart + '/');
    if (!file) {
      unresolved.add(pathPart);
      return whole;
    }
    return `${attr}="${file}${suffix}"`;
  });
}

/* -------------------------------------------------------------------- fs */

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

/* ------------------------------------------------------------------ extras */

function sitemap() {
  const urls = routes
    .filter(([url]) => url !== '/404/')
    .map(([url]) => `  <url><loc>https://purelypeptideshub.com${url}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/* -------------------------------------------------------------------- run */

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(__dirname, 'public'), OUT);

/* ------------------------------------------------------------- catalogue
   The cart, wishlist and quick-order all render products the current page was
   never server-rendered with, so they need the catalogue client-side. Emitted
   from the same src/data.js the pages use, so the two cannot drift. */
{
  const { productShotName } = require('./src/art');
  // Only a lot with a certificate on file counts as the current lot, so the
  // cart never links a COA page that was never generated.
  const currentLot = (slug) => {
    const l = lots.find((x) => x.slug === slug && x.doc);
    return l ? l.lot : null;
  };
  const catalogue = products.map((p) => ({
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    category: p.category,
    stock: p.stock,
    lot: currentLot(p.slug),
    shot: productShotName(p.sku),
    img: 'img/' + productShotName(p.sku) + '.jpg',
    href: 'product-' + p.slug + '.html',
    coa: currentLot(p.slug) ? 'certificate-' + String(currentLot(p.slug)).toLowerCase() + '.html' : null,
    sizes: p.sizes.map((s) => ({ label: s.label, price: s.price })),
  }));
  const NL = String.fromCharCode(10);
  const header = '/* Generated by build.js - do not edit. Source: src/data.js */';
  fs.writeFileSync(
    path.join(OUT, 'js', 'catalogue.js'),
    [header, 'window.PP_CATALOGUE = ' + JSON.stringify(catalogue) + ';', ''].join(NL)
  );
}

let bytes = 0;
for (const [, file, html] of routes) {
  const out = rewriteLinks(html);
  fs.writeFileSync(path.join(OUT, file), out, 'utf8');
  bytes += Buffer.byteLength(out);
}

fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap(), 'utf8');
fs.writeFileSync(
  path.join(OUT, 'robots.txt'),
  'User-agent: *\nAllow: /\nSitemap: https://purelypeptideshub.com/sitemap.xml\n',
  'utf8'
);

if (unresolved.size) {
  console.error('Unresolved internal links:', [...unresolved].join(', '));
  process.exitCode = 1;
}

console.log(
  `Built ${routes.length} HTML pages (${(bytes / 1024).toFixed(0)} KB) + css/styles.css + js/script.js into site/\n` +
    `Open site/index.html in a browser, or run: npm start`
);
