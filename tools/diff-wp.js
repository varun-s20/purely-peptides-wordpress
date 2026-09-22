'use strict';
/**
 * Diffs a rendered WordPress page against the static build's version of it.
 *
 *   node tools/diff-wp.js <url> <static-file>
 *   node tools/diff-wp.js https://staging.example/certificates/bp10-0318/ certificate-bp10-0318
 *
 * The PHP templates are hand-ported from the JS ones. "It looks about right" is
 * not a check - this compares the <main> of both, with the asset-path rewrites
 * and the site origin normalised away, and prints where they part company.
 *
 * Some differences are expected and fine:
 *   - WordPress's paginate_links() markup differs from the static pager
 *   - the certificate library's filter bar changed on purpose (see the template)
 *   - absolute vs relative URLs inside srcset
 * Read the output, do not just count it.
 */

const fs = require('fs');
const path = require('path');

const [url, staticName] = process.argv.slice(2);

if (!url || !staticName) {
  console.error('Usage: node tools/diff-wp.js <url> <static-file-basename>');
  process.exit(2);
}

const staticFile = path.join(__dirname, '..', 'site', staticName.replace(/\.html$/, '') + '.html');
if (!fs.existsSync(staticFile)) {
  console.error(`No static page at ${staticFile} - run \`npm run build\` first.`);
  process.exit(2);
}

function mainOf(html, label) {
  const open = '<main id="main">';
  const a = html.indexOf(open);
  const b = html.lastIndexOf('</main>');
  if (a === -1 || b === -1) throw new Error(`no <main id="main"> in ${label}`);
  return html.slice(a + open.length, b);
}

function normalise(html, origin) {
  let s = html;

  if (origin) s = s.split(origin).join('');

  s = s
    .replace(/\/wp-content\/themes\/pph-child\/assets\/img\//g, '/img/')
    .replace(/\/wp-content\/uploads\/pph\/doc\//g, '/doc/')
    .replace(/\/wp-content\/uploads\/pph\/video\//g, '/video/')
    /* The static build rewrites clean paths to flat files for local viewing -
       build.js's own linkMap. Undo it the same way, route by route, so both
       sides speak in real URLs. Order matters: the prefixed routes must run
       before the generic fallback, or e.g. article-foo.html falls through to
       /article-foo/ instead of /research/foo/. index.html is a special case -
       it is the one route whose real URL isn't derived from its filename. */
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="article-([a-z0-9-]+)\.html"/g, 'href="/research/$1/"')
    .replace(/href="product-([a-z0-9-]+)\.html"/g, 'href="/products/$1/"')
    .replace(/href="certificate-([a-z0-9-]+)\.html"/g, 'href="/certificates/$1/"')
    .replace(/href="category-([a-z0-9-]+)\.html"/g, 'href="/products/category/$1/"')
    .replace(/href="order-([a-z0-9-]+)\.html"/g, 'href="/orders/$1/"')
    .replace(/href="([a-z0-9-]+)\.html"/g, 'href="/$1/"')
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

  /* One tag or one text run per line. \s* (not \s+): a host running HTML
     minification (LiteSpeed Cache, WP Rocket, etc.) strips whitespace between
     tags entirely, and \s+ would never split there - collapsing the whole
     rest of the page onto one line and making the diff meaningless. */
  return s
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

(async () => {
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'pph-diff' } });
  } catch (e) {
    console.error(`Could not fetch ${url}: ${e.message}`);
    process.exit(2);
  }
  if (!res.ok) {
    console.error(`${url} returned HTTP ${res.status}`);
    process.exit(2);
  }

  const live = await res.text();
  const origin = new URL(url).origin;

  const a = normalise(mainOf(fs.readFileSync(staticFile, 'utf8'), staticFile), null);
  const b = normalise(mainOf(live, url), origin);

  const diffs = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) {
      diffs.push({ i, want: a[i], got: b[i] });
      if (diffs.length >= 40) break;
    }
  }

  console.log(`static ${a.length} lines   wordpress ${b.length} lines`);

  if (!diffs.length) {
    console.log('Identical after normalisation.');
    return;
  }

  console.log(`\nFirst ${diffs.length} difference${diffs.length === 1 ? '' : 's'}:\n`);
  for (const d of diffs) {
    console.log(`line ${d.i + 1}`);
    console.log(`  static  ${d.want === undefined ? '(nothing)' : d.want.slice(0, 160)}`);
    console.log(`  wp      ${d.got === undefined ? '(nothing)' : d.got.slice(0, 160)}`);
    console.log('');
  }

  /* Once the two sides line up, the lengths match. A length gap on its own is
     the clearest signal that a block is missing entirely. */
  if (a.length !== b.length) {
    console.log(`Line count differs by ${Math.abs(a.length - b.length)} - a block is probably missing or duplicated.`);
  }
  process.exitCode = 1;
})();
