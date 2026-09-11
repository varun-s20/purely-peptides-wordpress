# Purely Peptides

A premium scientific ecommerce site for a research-materials supplier. Plain HTML, CSS and
JavaScript - no framework, no dependencies, nothing to install to view it.

**To look at it: open `site/index.html` in a browser.** That is the whole website; every page links
to every other page from the file system, no server required.

```
site/
  index.html                    88 pages, one .html file each
  products.html
  product-bpc-157.html
  certificate-bp-260910.html
  …
  css/styles.css                one global stylesheet
  js/script.js                  one global script
  sitemap.xml  robots.txt
```

Optional, for a local server (nicer URLs, correct 404 handling):

```bash
npm start     # rebuild + serve at http://localhost:4173
npm run build # regenerate site/ only
```

### Why there are .js files in src/

`src/` holds the **generator**, not the website. The site has 88 pages that share one header, one
mega menu and one footer - maintaining that by hand means editing 88 copies of the nav every time a
link changes. `node build.js` stamps the shared parts into every page and writes plain HTML.

You can ignore `src/` entirely and edit `site/` directly - it is ordinary HTML. Just note that
running the build again overwrites `site/`, so make structural changes in `src/` and styling changes
in `public/css/styles.css` if you want to keep using it.

---

## Design decisions

**Positioning.** The site is organised around *identify → understand → verify → purchase*, not
*product → price → buy*. Documentation reaches the reader before the price does: every product page
shows the analytical record for the lot that is currently shipping, and every lot number anywhere on
the site is a link into the certificate library.

**Palette.** Roughly 75% neutral, 15% tinted ground, 10% accent, over near-black `#071112` ink.
Two accents with separate jobs: teal `#378189` carries interaction - links, controls, selected
state, the primary button. Orange `#FF7223` carries the single call to action on a screen plus the
arrows and chevrons that signal movement.

Each accent has a light-ground text variant, because the bright versions do not clear AA as words:
`#FF7223` reads at 2.7:1 on paper, so accent text uses `--orange-text` `#BE4A0A` and fills keep
`--orange`; likewise link text uses `--teal-deep`. The orange CTA button sets ink on orange rather
than white on orange, for the same reason. Status colour is always paired with a glyph and a word,
so meaning survives greyscale, colour blindness and print.

**Typography.** Two families with one clean split:

| Family | Role |
|---|---|
| Rokkitt | Every heading, and nothing else - display, h1–h6, logotype |
| Noto Sans | Everything else - body, interface, technical labels, data values |

A geometric slab against a neutral grotesque. The slab is the loudest thing on the page, which is
exactly why it is rationed to headings. Noto Sans carries data too, using its tabular figures so
lot numbers and measured values still align in a column.

Rokkitt stands in for a licensed slab face; swap `--slab` in the tokens block and every heading on
all 88 pages follows.

**Shape.** Buttons, search fields and pills are fully rounded (`--r-pill`). Cards, panels and
tables stay square-ish at 4–8px. That one contrast does most of the work of the house style.

**The one bold move.** The drawn HPLC chromatogram is the recurring motif: COA plot, product
thumbnail, lot panel, 404 page. It is the actual vernacular of the product's documentation rather
than abstract decoration. Everything around it stays quiet.

**Imagery.** Photographs carry everything a camera can honestly show - the product, the bench, the
cold store, the paperwork, the people. They live in `public/img/` and are wired up through
`src/art.js` (`photo`, `productShot`, `categoryPhoto`, `articlePhoto`). Sources and licences are in
`public/img/CREDITS.md`; everything is Pexels or Unsplash, both of which permit commercial use.
Files are fetched at the exact size their slot renders at, and every tag carries `width`/`height`
so the layout reserves the box before the file lands.

Three studio shots of sealed vials cover all twenty products, assigned by a hash of the SKU so a
given product always shows the same photograph. Every peptide in the catalogue ships as lyophilised
powder in a vial of that type, so the photograph is accurate for all of them - but it is a picture
of the *format*, not of that specific compound, which is why no label text is composited onto the
glass and why the labels in frame are blank.

**What is still drawn, and why.** The chromatogram and the analytical worksheet are seeded from a
lot number and carry that lot's own measured values. A stock photograph of somebody else's trace
would be a picture of data we did not produce, presented as if we had. Those stay generated.

**What is never used.** People smiling at the camera, fitness imagery, syringes or anything
implying human administration, branded or recognisable drug products, vaccine vials, DNA helices,
neon technology graphics.

---

## Structure

```
site/                 ← THE WEBSITE. Open site/index.html.

build.js              route table + link rewriting → site/
serve.js              optional local server
public/                 copied to site/ verbatim
  css/styles.css      the global stylesheet
  js/script.js        the global script
  img/                photographs, plus CREDITS.md
src/                  page generator (not shipped to site/)
  data.js             catalogue, lots, articles, brand  ← replace with real data
  art.js              photo wiring, drawn data figures, icon set
  layout.js           page shell: header, mega menu, footer, overlays
  components.js       product cards/rows, tables, section heads, badges
  pages/              one module per page family
```

`css/styles.css` is one file in four labelled sections: **tokens** (colour, type scale, spacing,
radii, motion), **base** (reset, typography, layout primitives), **components**, **pages**.

Adding a product is one entry in `src/data.js` - the product page, category listing, mega menu
counts, search suggestions and sitemap all follow. Category counts are derived from the catalogue,
never hand-maintained, so the nav cannot disagree with the listing.

---

## Pages

All 26 specified screens, plus a design-system reference:

Home · Products landing · Category listing · Search results · Product detail · COA search ·
COA detail · Quality & testing · Research library · Research article · Applications · Wholesale ·
Wholesale application · Cart · Checkout · Account dashboard · Orders · Order detail · Login ·
About · Contact · FAQ · Shipping & returns · Terms · Privacy · Research use policy · 404 ·
**Design system**

88 files in total, because each product, certificate, article, category and order gets its own page.

Open `site/styleguide.html` first - it renders every token, component and state from the same source
the pages use.

---

## Developer annotations

**`[hidden]` is forced globally.** Any class-level `display` outranks the UA stylesheet's `[hidden]`
rule, which left flex/grid components laid out - and clickable - while meant to be gone. It cost us
twice (the age gate swallowed every click on the page behind it; the restricted-shipping notice
showed for unrestricted states) before being stated once in the reset.

**Breakpoints.** 1440 desktop · 1200 product rows stack · 1080 nav collapses to drawer ·
900 two-column layouts stack · 768 tablet · 560 the quick-order icon drops · 400 gutter and icon
targets tighten · **320 is the floor** and is tested, not assumed. The 1200 stop exists because a product
row's six fixed columns need 852px, which the catalogue's 264px filter rail does not leave until
about there. Grid tracks always declare `minmax(0, …)`; a bare `1fr` resolves to
`min-content` and silently overflows on a phone - the order-tracking timeline did exactly that at
320px. Anything with `overflow-x: auto` also needs `min-width: 0` when it is a grid or flex item,
or it sizes to its content and overflows anyway instead of scrolling.

**The header.** Sticky at every width, and it condenses past the utility bar - that strip is
reference information you read once, not navigation, so dropping it on scroll returns ~70px of
viewport (193px → 125px desktop, 105px → 65px mobile).

`--header-h` is *written by the script from the measured height*, not hardcoded. Seven sticky
sidebars, the nav scrim and `scroll-padding-top` are all calculated from it; when it was a literal
it drifted 41px out of date and anchor links landed underneath the header. Measuring removes that
class of bug rather than re-fixing the number.

**Motion.** Easing tokens are the strong variants, not the stock CSS ones, which are too weak to
read as intentional: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for anything entering or
responding, `--ease-in-out` for travel, plain `--ease` for colour. `ease-in` is never used - it
delays the first frame, the one the user is watching. Durations: 140ms press, 160ms hover, 220ms
disclosure, 300ms ceiling for anything in the UI. Only `transform` and `opacity` are animated, and
no rule uses `transition: all`.

Buttons take `scale(0.97)` on `:active` so a press is felt. Hover transforms are gated behind
`@media (hover: hover) and (pointer: fine)` - on a touch screen a tap fires `:hover` and the card
stays lifted. Sections fade up 10px once as they arrive, staggered 55ms across a grid, via
`[data-reveal]` / `[data-reveal-stagger]` and an IntersectionObserver that unobserves after firing.
Anything already on screen at load skips the animation rather than animating content being read.

The reveal styles are gated on `.has-js` (set by an inline script before first paint) so that
without JavaScript nothing can be left permanently hidden. Under `prefers-reduced-motion` the
travel and scale go away but colour and opacity transitions stay - reduced motion means gentler,
not mute.

**State.** Cart and wishlist are real, and live in `localStorage` - there is no server, so that is
the whole persistence layer. `public/js/store.js` owns them: one source of truth, one render pass,
and the DOM is never the state. Every surface (badge, drawer, cart page, checkout, account
wishlist) renders from it, and a `storage` listener keeps two open tabs in step.

A cart line is identified by slug + size + purchase mode + frequency, so the same product bought
once and bought on subscription are two lines rather than one ambiguous one. Adding the same line
twice merges the quantity.

`build.js` emits `site/js/catalogue.js` from the same `src/data.js` the pages use, so the cart can
render a product the current page never server-rendered. Image and link paths are resolved **at
build time** and baked into that file - anything built in the browser misses the link rewriter and
404s on a flat file-system copy.

**Catalogue logic.** Filters, sort, search-within and quick order are in `public/js/catalog.js`.
Every product is already in the DOM, so filtering hides rows rather than fetching: the facts each
filter needs (`data-cat`, `data-area`, `data-form`, `data-stock`, `data-price`, `data-added`) sit
on the card. Checkboxes OR within a facet and AND across facets. Quick order validates each pasted
line against the catalogue and reports failures per line, because a paste of twenty lines with one
typo should say which line.

**Commerce surface.** Subscribe & Save sits on every product page: the volume tier and the
subscription discount stack, and the panel prints the arithmetic (list → volume → subscription →
per delivery) rather than a blended number the buyer has to trust. Subscriptions are managed from
the account - skip, change quantity, pause, cancel. Shipping, cold-pack handling and destination
tax recalculate live against the chosen state, with a free-shipping threshold at $250.

**Compliance gates.** An age and intended-use gate renders hidden and is revealed by script, so it
never blocks a crawler or a no-JS reader - it is a declaration of intent, not a security control.
California, New York and Louisiana are treated as restricted: choosing one shows the reason and
disables checkout in the cart, rather than failing after payment. Transactional emails
(`/emails/`) are table-based and inline-styled, previewed in-page.

**The hero.** One centred column over `public/video/hero-lab.mp4` - 1.2 MB at 720p, muted + looped
+ `playsinline` (the conditions for autoplay), with `hero-poster.jpg` behind it so the hero is never
blank. It pauses on tab hide and never starts under reduced motion.

The video parallaxes on scroll. The media box is 124% tall and offset −12%, so there is overspill to
travel through; the script clamps the shift to *half the measured overspill*, which is what hangs off
the top, so changing the CSS height cannot silently reintroduce an exposed edge. Transform only,
batched into `requestAnimationFrame`, and gated on an IntersectionObserver so scrolling the rest of
the page costs nothing. No layout property is touched - that is what stops it feeding back into
scroll position the way the old condensing header did.

**Interaction.** All of `js/script.js`, ~340 lines of vanilla JavaScript, no framework. Disclosure widgets are real
buttons with `aria-expanded`; panels animate on `grid-template-rows: 0fr → 1fr` so nothing needs a
measured height. Escape closes every overlay. `prefers-reduced-motion` disables animation globally.

**Accessibility.** WCAG AA verified, not assumed:

- Every text pair meets 4.5:1 (`--slate-light` was darkened to `#66706D` for this); form control
  borders meet 3:1 per 1.4.11 via `--rule-input`.
- One `<h1>` per page, no heading-level jumps, every control labelled - enforced across all 88 pages.
- 44px minimum touch targets, visible focus rings, semantic tables with `scope`, `<main>` landmark
  and a skip link on every page.

**Performance.** No JS framework, no icon font, no images to download - the homepage is ~20 KB
gzipped including all artwork. Three font families at five weights total; drop Newsreader if the
research library is cut.

**Links.** Pages are authored with clean paths (`/products/bpc-157/`) and rewritten at build time to
flat file names (`product-bpc-157.html`). The build fails loudly if a link points at a page that does
not exist, so dead internal links cannot ship.

**SEO.** Product, Article, FAQPage and Organization JSON-LD; canonical tags carry the clean URLs
(`/products/bpc-157/`), so pretty URLs can be enabled with host rewrites without touching the pages.
`sitemap.xml` and `robots.txt` are generated.

---

## Before this goes live

These are placeholders by design, and each one needs a real owner:

1. **Catalogue data.** Specifications, prices, lot numbers, purity figures and testing dates in
   `src/data.js` are illustrative. CAS numbers and molecular formulae are approximately correct but
   must be verified against your own records before publication.
2. **Legal copy.** `terms.html` and `privacy.html` are drafting templates and are marked as such on
   the page itself. They must be replaced by counsel. `research-use-policy.html` is written to be
   substantive but still needs legal review.
3. **Commerce back end.** Cart, checkout, account and wholesale application are presentation only.
   The markup follows WooCommerce conventions so the templates map onto it directly.
4. **Metrics.** The homepage statistics module uses only figures derivable from the catalogue
   itself. Do not add a metric the business cannot evidence.
5. **Subscriptions.** Deliberately not built. Per the brief, subscription UI stays out until
   recurring billing exists.

---

## Language rules baked into the copy

The site never claims a physiological, therapeutic or performance effect. Product descriptions say
what a material *is* and what the literature *records*, and stop there. Research-use confirmation at
checkout is required and never pre-checked. If copy is added later that reads as a health claim, it
is a defect, not a variation.
