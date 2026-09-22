# Progress log — static site → WordPress

**Purpose:** the resume document. If a conversation, a session or a laptop dies, this file plus
`CONVERSION-PLAN.md` is enough to pick the work up cold.

**Last updated:** 16 September 2026 (sixth pass — root-caused and fixed the real bug behind BOTH the
add-then-revert badge and the empty-cart-on-navigation symptoms: the custom `/pph/v1/cart*` REST API was
being LiteSpeed-cached publicly for a week, confirmed with an actual Network tab capture; also fixed a
cart.js race condition, the region-compliance gate, dead account/orders/login links, added the wishlist
page and a real "Save this order", and resolved the "bundles" question with no code needed. See Done so
far for the full write-up. Awaiting live re-test after this pass's `inc/cart-api.php` deploy + purge.)
**Current phase:** Phase 5 complete (search page built) and phase 8 built — real cart (drawer, badge,
`/cart/`, replacing localStorage), real checkout compliance (account required, research field,
timestamped acknowledgements, real order creation), all through WooCommerce's own engine rather than
a client-side demo. **Not yet deployed or tested live** — this is the largest single addition of the
build; see "Next actions" for the deploy sequence and what to check first.
**Host confirmed:** Hostinger, running **LiteSpeed Cache** with HTML minification and image lazy-load
active by default — see Gotchas, this affects every later phase, not just these two.
**Blocking launch:** prices (see `CONVERSION-PLAN.md` §15). It does **not** block the build — see the
note under Phase status.
**⚠ Site was taken out of Coming Soon mode on 16 Sep 2026, publicly live now**, with placeholder
prices, placeholder contact details, no reviewed legal pages and no real payment method behind the
BACS placeholder. Flagged to the client directly - their call, not reversed here. If it goes back to
Coming Soon, remove this line.

---

## Read in this order

1. `CONVERSION-PLAN.md` — the plan. Route, URL map, content model, plugin stack, phase order.
2. This file — what is actually done, what broke, what is next.
3. `STATUS.md` — the static build's own status, and the full client-blocked list.
4. `README.md` — how the static build works and where every value came from.

---

## Phase status

Phases are from `CONVERSION-PLAN.md` §13.

| # | Phase | State |
|---|---|---|
| 0 | Staging server, WP, Hello Elementor + Pro | **done** (WooCommerce not installed yet) |
| 1 | `pph-child`: CSS/JS, Elementor neutralised, chrome | **done and verified** |
| 2 | Static prose pages | **done — 13 pages imported, 404 in the theme** |
| 3 | `pph-core`: CPTs, meta boxes, templates, settings | **done and deployed** — PPH Settings confirmed live in the admin sidebar |
| 4 | Product import from `src/data.js` | **done and deployed** — 25 products, 7 categories confirmed live, one image-attachment bug found and fixed |
| 5 | Product / category / search templates | **done** — shop, category and single-product deployed and confirmed matching the static design; search page built this pass. Not yet deployed. |
| 6 | Certificates (12) | **done — 12 imported, live, diff-checked against the static build** |
| 7 | Research articles (8) | **done — 8 imported, live, diff-checked; one real bug found and fixed (see below)** |
| 8 | Cart, checkout, compliance layer | **built this pass, not yet deployed or tested live.** Real cart (drawer, badge, `/cart/`), account-required checkout with research field + timestamped acknowledgements, real order creation. Payment is a placeholder (WooCommerce's own BACS gateway, relabelled) until AllayPay integrates (phase 15). My Account / order-view pages left as WooCommerce defaults for now. |
| 9 | Volume ladder + subscription engine | **Volume ladder done** (`inc/pricing.php`, real at checkout, reads PPH Settings). Subscription engine still blocked — AllayPay tokenisation. Subscribe & Save renders disabled on the product page until it exists. |
| 10 | Wholesale | not started |
| 11 | Shipping + tax | blocked — weights, nexus |
| 12 | Forms, SMTP, branded email | blocked — sender domain |
| 13 | SEO, schema, coming-soon | not started |
| 14 | Performance, caching, security, backups | not started |
| 15 | Gateway + live test transactions | blocked — AllayPay approval |
| 16 | Migration to his hosting | blocked — hosting credentials |
| 17 | Verification, handover docs, ownership transfer | not started |

**On prices and phase 4:** `PRICING` in `src/data.js` already holds placeholder values for all 41
size-SKUs, and the build refuses to run if any size is unpriced. So products can be imported and
every template built now; only the final price table waits on the client. Re-importing prices later
is one script against one table. Prices block **launch**, not the build — the earlier
"blocked — prices" reading of this row was wrong.

---

## Done so far

**14 Sept 2026**

- Audited the static build: 83 pages, 25 products, 41 size-SKUs, 12 COAs, 8 SDS, one 2,594-line
  tokenised stylesheet, four scripts, all commerce in `localStorage`.
- Read the client chat (`mdnjuan.pdf`, 17 pages) end to end. Scope = the accepted **Scale Plan**,
  9 Sept 2026, 25-day delivery, 3 months support.
- Wrote `CONVERSION-PLAN.md`.
- Settled the stack (see decisions below).
- Built `tools/export-wp-pages.js` — exports the 14 static prose page bodies to
  `wordpress/pages/` with a manifest. **Runs clean: 14 bodies, 115 KB.**
- Built `tools/import-wp-pages.php` — WP-CLI importer, idempotent, kses-safe.
- Built `tools/export-wp-theme.js` — generates the `pph-child` chrome from `src/layout.js`
  (`header.php`, `footer.php`, `front-page.php`, `404.php`) and copies assets. **Runs clean.**
- Hand-wrote `pph-child/style.css`, `functions.php`, `page.php`, `index.php`.
  Theme is complete enough to stand the site up statically, with no WooCommerce.
- PHP tag balance checked on all seven theme files. **PHP is not on PATH on this machine**, so
  nothing was lint-checked locally — the theme was first executed on staging.
- **Deployed to staging.** Theme uploaded and activated, uploads copied, permalinks set to Post name,
  Elementor default colours/fonts/Google Fonts disabled, Improved CSS Loading on, 13 prose pages
  imported.
- **Fixed the parent-theme style collision** (see Gotchas). Three reported symptoms — header and
  footer not full-bleed, pink hover on buttons and links, mega menu closing before you reach the
  sub-items — all traced to one cause and all cleared with one change to `functions.php`.
- **Verified on staging by the client-side developer:** header and footer full-bleed, brand colours
  correct on hover, mega menu holds open across the gap, prose pages rendering.
- **Built `pph-core`** (phase 3): `pph_coa` and `pph_article` post types, hand-rolled meta boxes over
  one field table per type, admin columns, lot/product/status filtering, and four templates ported
  from `src/pages/certificates.js` and `src/pages/research.js`.
- **Built `tools/export-wp-content.js`** — 12 certificates, 8 articles + prose bodies, and a
  generated `inc/icons.php` (42 SVGs, generated rather than transcribed). **Runs clean.**
- **Built `tools/import-wp-content.php`** — WP-CLI, idempotent by slug, kses-safe, flushes rewrites.
- **Built `tools/diff-wp.js`** — fetches a live WordPress page and diffs its `<main>` against the
  static build's, with asset paths and origin normalised away. This is the check that the hand-ported
  PHP is faithful; PHP still is not on PATH locally, so nothing here has been executed.
- All PHP brace/paren/tag balance checked; all JS passes `node --check`. That is not the same as
  running, and is not claimed to be.
- **Deployed phases 3, 6, 7 to staging.** `pph-core` uploaded and activated, content imported via the
  Tools → Import PPH Content zip uploader (no WP-CLI available on this host). 12 certificates and
  8 articles live at `/certificates/` and `/research/`.
- **Confirmed host: Hostinger** (`lightseagreen-reindeer-736443.hostingersite.com`), running
  **LiteSpeed Cache** with HTML minification and image lazy-load on by default.
- **Fixed `tools/diff-wp.js`** — its tag-splitter used `>\s+<` (one or more spaces), which never
  matches on minified HTML with zero space between tags, so the whole rest of a minified page
  collapsed onto one unreadable line. Changed to `>\s*<`. Not yet re-run against staging with the fix.
- **Verified in a real browser** (not just fetched HTML): certificate preview images and article lead
  images render correctly despite LiteSpeed's lazy-load placeholder swap. Logged-out click-through of
  the mega menu, age gate and certificate search done informally — nothing misbehaved. Full formal
  re-check deferred to when cart/checkout exist and there is more surface for a `data-*` binding to
  break on.
- **Re-ran the fixed diff tool on an article page and found a real bug.** `single-pph_article.php`
  was calling the full `the_content` filter chain on the stored prose, which includes `wpautop()`.
  wpautop auto-inserts `<p>`/`<br>` around blank-line-separated text — correct for typed prose, wrong
  for the pre-rendered HTML (headings, `<figure>` blocks, inline `<svg>` charts) these bodies actually
  are. **Fixed:** `remove_filter( 'the_content', 'wpautop' )` around just this one render, restored
  immediately after so nothing else on the page is affected. Same underlying lesson as the page
  importer's `<!-- wp:html -->` wrapper — fully-formed markup must not go through the prose pipeline.
- **Fixed two more issues the diff run surfaced, both pre-existing in the static source, not
  introduced by the port:**
  - The age-gate "I am under 21 - exit" link pointed to `https://www.nih.gov/`. Changed to
    `https://www.google.com/` per the client-side steer, at the source (`src/layout.js`), then
    regenerated the theme so `footer.php` picked it up. One occurrence, confirmed by grep.
  - `diff-wp.js` had two normalisation gaps: it mapped the homepage's `index.html` to `/index/`
    instead of `/`, and it didn't know `article-`, `product-`, `certificate-`, `category-` and
    `order-` prefixed static filenames map to `/research/`, `/products/`, `/certificates/`,
    `/products/category/` and `/orders/` respectively — so every cross-page link (related articles,
    related products) showed as a false-positive diff. Both fixed; matters more from here on, since
    WooCommerce is about to add dozens of product/category cross-links the tool needs to read.
- **Built the phase 3 settings screen** (`inc/settings.php`) — contact details, research field
  dropdown options, restricted states, and the pricing thresholds (free shipping, volume discount at
  5/10, subscription discount), all in one `PPH Settings` admin page, stored as one option with
  sensible defaults. The two AllayPay disclaimer strings are shown **read-only** for reference.
  **Not yet wired to the theme** — header.php/footer.php still show the literal placeholder contact
  info baked in when the theme was generated. Small follow-up, deliberately not done in this pass.
- **Built phase 4: the category + product import layer.** Same three-piece pattern as certificates
  and articles:
  - `tools/export-wp-products.js` — reads `src/data.js` directly, exports `categories.json` (7) and
    `products.json` (25 products, 41 size-variations, prices/stock/lot per size). Verifies category
    references resolve, variation SKUs are unique, every size has a price and a valid stock state, and
    every product's image file actually exists. **Runs clean.**
  - `inc/product-meta.php` — a meta box on the native WooCommerce product screen for the fields Woo
    has no field for (CAS, formula, MW, sequence, purity method, storage, SDS link, the "identity
    unverified" flag), same field-table pattern as the certificate/article meta boxes.
  - `inc/product-importer.php` — `pph_run_product_import()`, built on WooCommerce's own CRUD objects
    (`WC_Product_Variable`, `WC_Product_Attribute`, `WC_Product_Variation`) rather than raw meta
    writes, so Woo's price-range and stock caches stay correct. Idempotent by SKU. Attaches each
    product's photo by pointing a new Media Library entry at the file already sitting in the theme's
    assets folder, rather than duplicating ~9 MB of images into uploads.
  - `tools/import-wp-products.php` (CLI) and `inc/admin-import-products.php` (Tools → Import PPH
    Products, zip upload) both call that same function — identical to the certificate/article pattern.
  - Generalised `pph_find_content_dir()` into `pph_find_dir_with_files()` so both content-import
    screens share one directory-finder instead of two near-identical copies.
  - **Not yet run against a real WordPress** — WooCommerce is not installed on staging yet. All PHP
    brace/paren/tag balance checked; the WooCommerce CRUD calls are written against a stable,
    well-documented API but have not been executed anywhere.
  - **Deliberately deferred to phase 5, not done here:** the actual product/category/search
    templates. Once imported, products will render through WooCommerce's own default templates —
    plain, but enough to verify prices, SKUs, stock and images actually came in correctly before
    spending effort matching the static design pixel-for-pixel.
- **Built phase 5's shop and category templates.** Confirmed via a real side-by-side comparison
  (Netlify static build vs. live WordPress) that WooCommerce's default templates looked nothing like
  the design - expected, but the gap was worth closing immediately rather than leaving it. Key finding
  while reading `public/js/catalog.js`: it needed **zero changes**. It already filters/sorts/searches
  by hiding and reordering server-rendered `.pcard`/`.prow` elements using their own `data-*`
  attributes - "the catalogue page already ships every product in the DOM" per its own comment - so
  the whole job was emitting that same markup from live WooCommerce data, not touching any JS.
  - `inc/wc-helpers.php` — ported `productCard()`, `productRow()`, `categoryPanel()`,
    `stockBadge()`/`docBadge()` and the facets/filters/toolbar/results markup from
    `src/components.js` and `src/pages/catalog.js`. `pph_render_catalog_body()` is shared between the
    shop landing page and every category archive, the same sharing the static build itself uses.
  - `woocommerce/archive-product.php` and `woocommerce/taxonomy-product_cat.php` in `pph-child` — the
    two page shells, following WooCommerce's own template-override convention (theme's `woocommerce/`
    folder), not the plugin's `template_include` filter used for the CPTs - Woo has its own loader.
  - Forced `posts_per_page => -1` on both archives via `pre_get_posts`. Client-side filtering only
    works over products that are actually in the DOM, and the static build's own pager was decorative
    anyway (it linked to a `?page=2` build.js never generated). Fine at 25 products; would need
    `catalog.js` to grow a real fetch-more story if the catalogue ever gets much bigger.
  - **Three filter groups ported as decorative, matching the original exactly:** Available size,
    Documentation, Product type never had a `data-filter` attribute in the static build either, so
    checking them did nothing there. Only Category, Research area, Form and Availability are wired to
    real counts. Not a limitation introduced by the port - inherited, and cheap to make real later
    (the "Documentation" one especially, since `pph_product_has_coa()` already exists).
  - **Also dropped:** the two hardcoded "Applied: In stock / Certificate available" chips from the
    static design. They were never wired to real state there either - always shown regardless of
    what was actually filtered. Decided real state (or no chips) beats fake state.
  - **Not yet run against a real WordPress** — same caveat as always. PHP brace/paren/tag balance
    checked; a `function_exists('is_shop')` guard added to the one hook that would fatal-error if
    WooCommerce were ever deactivated, matching the plugin's own "leave the fallback in" principle.
  - **First live check surfaced two real bugs, both fixed immediately:**
    (1) Category tile images 404'd - `pph_asset_uri()` needs its `assets/` prefix included by the
    caller (that's how every other call site in the codebase uses it); the new category-image calls
    left it off. (2) WooCommerce's own auto-created "Uncategorized" term was showing up as an empty
    8th tile on the shop page - filtered out via `pph_get_real_categories()`, used everywhere the
    category list is built so it can't reappear in one spot and not another.
  - **Moved the single-product page up into this same pass**, after the client saw the shop/category
    pages live and pointed out the product detail page still looked unstyled. Built
    `woocommerce/content-single-product.php` (overrides WooCommerce's content template specifically,
    not the wrapping `single-product.php`, so `get_header()`/`get_footer()` still come from
    WooCommerce's own wrapper calling into our theme - one less thing to get wrong) - gallery, spec
    table, documentation panel, related research, storage/shipping, FAQ accordion, related products.
  - **One real design decision, not just a port:** the static build's purchase box had a custom
    pill-button size selector plus a Subscribe & Save toggle and volume-discount calculator - all
    cosmetic in the original, since no backend ever computed those numbers. Porting that UI verbatim
    onto a real store would let a customer select "Subscribe & Save" and have it silently do nothing
    at checkout, which is worse than not offering it - the same principle already applied to the
    certificate library's filter bar. Replaced with WooCommerce's own native variation add-to-cart
    form (`woocommerce_template_single_add_to_cart()`) - plainer, but genuinely adds the right
    variation and price to a real cart today. Restyle once phases 8 (checkout) and 9 (the real
    subscription/volume engine) exist; that is the honest order to build it in.
  - Added `pph_product_current_lot_post()` (picks the documented lot with the most recent test date
    among the product's variations - same reasoning as the static build's own comment on this), and
    `pph_product_pending_lots()` (lot codes in inventory with no certificate yet - shown honestly,
    not hidden or invented).
  - The decorative chromatogram trace is one fixed schematic SVG shared across every product, not a
    per-lot generator port - it is labelled "Schematic, not the measured trace" in both versions, so
    porting the static build's seeded-random squiggle generator for a label that already says "this
    isn't the real data" was not worth the code.
  - **First deploy of the single-product page rendered nothing - real bug, found and fixed.**
    `content-single-product.php` called `the_post()` at its own top. WooCommerce's own
    `single-product.php` wrapper had *already* called `the_post()` once, in its own
    `while ( have_posts() )` loop, before handing off to this file. A singular query holds exactly
    one post; calling `the_post()` a second time advances the loop pointer past it, so
    `get_the_ID()` returned nothing, `wc_get_product()` returned `false`, and the template hit its
    own `if ( ! $product ) return;` guard - printing nothing. Header and footer still rendered
    (those come from the outer wrapper, untouched by this), which is why the page looked like an
    empty content area rather than a broken one. **Fixed**: dropped the redundant `the_post()` call
    and switched every `get_the_ID()` to `get_queried_object_id()`, which is correct on a singular
    template regardless of loop-pointer state. Also changed the `if ( ! $product )` branch from a
    silent `return` to a visible notice, so a future instance of this class of bug shows up as a
    message instead of a blank page.
  - Confirmed via full re-read (not just brace-balance) that this was the only site-wide-risk bug:
    the shop archive already proved every other helper function used on the product page works,
    since it calls several of the same ones (`pph_m`, `pph_icon`, `wc_get_product`,
    `pph_product_lead_variation`, etc.) successfully already. The archive templates' own
    `the_post()` calls are safe because they are the first and only loop for a full page template
    they wrote themselves, not a content-only override nested inside someone else's loop - the
    specific shape that caused this bug does not recur elsewhere in this plugin.
  - **Second deploy surfaced a double breadcrumb.** WooCommerce's own default `single-product.php`
    wrapper was still running (only `content-single-product.php` had been overridden), and it fires
    `woocommerce_before_main_content` before handing off to our content template - WooCommerce hooks
    its own default breadcrumb onto exactly that action. **Fixed** by adding
    `woocommerce/single-product.php`, taking over the whole page the same way
    `archive-product.php` / `taxonomy-product_cat.php` already do, so none of WooCommerce's default
    hooks (breadcrumb, sidebar) fire at all. `content-single-product.php` itself did not need to
    change - it already stopped calling `the_post()` from the earlier fix, so calling it once from
    this new wrapper is correct.
  - **Category archive 404 - found and fixed, confirmed working.** WooCommerce has two separate
    permalink settings: "Custom base" (`/products/`, already set) and a *separate* **"Product
    category base"** field further down the same Permalinks screen, defaulting to `product-category`
    - not `products/category`, which the whole build assumes (`CONVERSION-PLAN.md`'s URL map,
    `pph_category_panel()`'s links, the taxonomy template). Never explicitly set when permalinks were
    first configured. Fixed by setting **Product category base** → `products/category` and saving.
    Confirmed working - `/products/category/blends/` (and others) load correctly.
  - **Reversed the earlier purchase-box decision, at the client's direction.** The first pass used
    WooCommerce's plain native variation form and skipped the static design's size-picker grid,
    volume ladder and stacked-price panel, on the grounds that they were cosmetic-only. Shown the
    live-vs-WordPress comparison, the client asked for full parity. Built properly rather than
    painted on:
    - `pph_render_purchase_box()` emits the static build's own markup (`.optset` size buttons,
      `.qty` stepper, `.buymode`, `.volume`, `.pricecalc`), so `public/js/script.js` drives all of
      it with **no JS changes** - same reuse discovery as the catalogue filtering.
    - It is wrapped in a **real WooCommerce add-to-cart form**. The visible quantity field IS Woo's
      `quantity` field; `public/js/woo.js` (new, ~40 lines) syncs the chosen size into the hidden
      `variation_id` / `attribute_size` inputs. What the page shows is what lands in the cart.
    - `inc/pricing.php` applies the volume ladder **for real** at checkout, reading its rates from
      PPH Settings so the page and the cart cannot disagree, and adds a "Volume discount -8%" line
      to the cart item. Without this the page would quote a discount the cart ignores - a pricing
      misrepresentation, not a cosmetic gap, and exactly what an AllayPay underwriting review looks
      for.
    - **Subscribe & Save renders but is `disabled`**, with "Available at launch" in place of the
      original note. Its -10% cannot be honoured until phase 9's subscription engine exists (itself
      blocked on AllayPay tokenisation). Removing the `disabled` attribute and restoring the note is
      the entire change once it does. This is the one place parity was deliberately not taken all
      the way, and why.
    - Also restored the four-thumb gallery strip from the static design.
  - **Known inconsistency to fix next:** the "Add to order" buttons on the shop/category product
    *cards* still carry `data-add-to-order`, which `store.js` handles with the old localStorage demo
    cart - so cards add to a fake cart while the product page adds to the real one. Needs the same
    real-form treatment (or a redirect to the product page) before phase 8.
  - **Size-next-to-Quantity / Purchase-options-next-to-Volume - found for real, fixed, and confirmed
    matching the static design.** The
    client sent the page's actual rendered HTML rather than a screenshot, which made this
    conclusive instead of a guess. Root cause: the purchase box's `<form>` (added this pass, to make
    add-to-cart real) had `class="cart"` - **WooCommerce's own reserved class**, styled by its
    default CSS with floats and inline layout built for *its* compact dropdown+quantity+button
    markup. The static build never wrapped these controls in a `<form>` at all, so that styling had
    nothing to attach to before; naming ours "cart" pulled WooCommerce's own `form.cart` rules in
    over our layout, rearranging every direct child of the form - which is exactly Size, Quantity,
    Purchase options and the Volume ladder. **Fixed**: renamed the form's class to
    `pph-buybox-form`. The class had no functional purpose - WooCommerce's cart handling keys off
    the `add-to-cart` POST field, not the form's class, and its variation JS targets
    `form.variations_form`, which this page never used since variation selection is handled by our
    own `woo.js`.
  - The Elementor-plugin-CSS dequeue added while chasing this (`pph_drop_elementor_on_owned_pages()`
    in `functions.php`) was **not** the actual cause, but is left in place - it is still a real,
    previously-unaudited collision risk on the pages we fully own, and removing it costs nothing
    there.
  - **General lesson, worth remembering for the rest of this build**: WooCommerce reserves a set of
    class names for its own default styling - `cart`, `quantity`, `variations`,
    `variations_form`, `single_variation_wrap` among them. Reusing one of those names for custom
    markup inherits Woo's opinions about how it should look, even when the markup structure is
    completely different. Worth a quick check against this list before naming any new element in the
    remaining phases.
  - **Deliberately still out of scope:** the search page (`src/pages/catalog.js` `searchPage()`).
- **End of session: client confirmed the product page now matches the static design.** Phase 5 is
  done for shop, category and single-product. Two items surfaced during this work are carried forward
  rather than fixed now: the product-card "Add to order" buttons still use the old demo cart (see
  Next actions), and the Elementor-plugin-CSS dequeue added while chasing the `form.cart` bug is kept
  as a defensive measure even though it was not the actual cause.
- **Built phase 5's search page and all of phase 8 - the largest single addition of the build.**
  Prompted by the client pointing out the cart drawer showed stale/empty state, `/cart/` came up
  empty, and there was no order-viewing at all - correctly diagnosed as phase 8 (always "not started")
  becoming visible for the first time now that a real add-to-cart existed on the product page.
  - **Live catalogue feed** (`inc/catalogue.php`) - `window.PP_CATALOGUE` is no longer the static
    build's build-time file (which would go stale the moment a price changes in wp-admin); it is
    generated fresh per request from live WooCommerce data, registered as an inline script on an
    empty `false`-src handle rather than a file, wired into the existing `catalogue -> store -> ...`
    dependency chain in `functions.php` so nothing downstream needed to change. Carries real product/
    variation IDs and per-size stock, which nothing static ever needed but the real cart does.
  - **Wishlist and cart split apart.** `store.js` was one file doing both, sharing state and a render
    pass - rewritten to hold only the wishlist (a legitimate client-only feature with no server
    concept to wire it to). All cart logic moved to a new `public/js/cart.js` talking to a real
    WooCommerce cart through three REST routes (`inc/cart-api.php`): `GET /pph/v1/cart`,
    `POST .../add`, `.../update`, `.../remove`. The HTML those routes return is the static build's
    own `.cart-line` / `.cart-row` markup, unchanged - only the data source moved, same discipline as
    every template this session.
  - **A real caching bug caught and fixed before it shipped, not after.** The REST nonce
    `wp_localize_script` bakes into the page would be served stale to every visitor hitting a
    LiteSpeed-cached page - not just the one whose request built that cache entry - silently 403-ing
    their first add-to-cart. Fixed architecturally: every cart API response carries a fresh nonce,
    and `cart.js` takes its next nonce from the most recent response rather than trusting the one
    baked into HTML. The first call on every page load (`GET /cart`) needs no nonce at all, so a
    fresh one is always in hand before any user action is possible.
  - **A second real compatibility gap, found by reading the JS rather than assuming**: the shop
    page's "quick order" bulk-paste feature (`public/js/catalog.js`, untouched) still calls
    `window.PP.addToCart({slug, size, qty})` - the static build's original shape. Rather than edit
    that file, `cart.js`'s `addToCart()` resolves that shape into real product/variation IDs via the
    live catalogue lookup before calling the real API, so every existing caller keeps working
    unmodified. Also added per-size stock to the catalogue feed, which that same feature checks and
    which the live version was missing.
  - **`/cart/` page** (`woocommerce/cart/cart.php`) - real WooCommerce cart contents, server-rendered
    on load and re-rendered by `cart.js` after every change. The static design's client-side
    shipping/tax estimate box was **not** ported - real shipping and tax need a real rate table
    (phase 11, blocked on the client), and showing a fake estimate next to otherwise-real numbers
    would undercut the one thing the page is for.
  - **Checkout compliance** (`inc/checkout.php`) - added onto WooCommerce's own checkout engine via
    its real extension points rather than a custom template rewrite. See the file's own header for
    the full reasoning; short version: checkout is the one page where a from-scratch markup rewrite
    is genuinely risky without live testing (order creation, AJAX order-review, payment-method
    switching are all tightly coupled to WooCommerce's own DOM/JS), and every custom template this
    session needed at least one live round of fixes - acceptable for a product page, not for the page
    that creates real orders.
    - Guest checkout forced **off** via `admin_init` (not just plugin activation, which does not fire
      on a plain file upload to an already-active plugin) - a compliance-required setting should not
      depend on remembering that distinction.
    - Research field (required select, from PPH Settings) and three acknowledgement checkboxes
      (research-use, 21+, terms - unchecked by default) added via `woocommerce_checkout_fields`.
    - Each acknowledgement's timestamp - not just that it was ticked - saved to order meta, and shown
      on the admin order screen. A record beats an assertion if AllayPay or a chargeback ever asks.
    - **Payment is WooCommerce's own built-in Direct Bank Transfer (BACS) gateway, relabelled** "ACH /
      bank transfer" with an honest description that real processing is finalised at launch. No real
      gateway exists yet (AllayPay is phase 15, blocked on their approval); building a form that
      collects real customer bank account and routing numbers with no real processor behind it, on an
      unlaunched and unapproved site, is a genuine data-handling risk, not a cosmetic gap - the same
      reasoning already applied to Subscribe & Save. This lets an order complete end to end for
      testing and client review without storing anything sensitive. Swapping in the real AllayPay
      gateway at phase 15 does not require touching anything else on this page.
  - **Search page** (`page-search.php`) - same discovery as the shop page's filtering:
    `public/js/catalog.js`'s search logic already matches plain text against whatever is in the DOM,
    so this needed zero new JS, only server-rendering every product row, certificate row and article
    card once from live data. The WordPress Page it needs at `/search/` is created automatically if
    missing (`pph_ensure_search_page_exists()`), same "do not depend on a manual step" reasoning as
    the guest-checkout fix.
  - Factored `pph_research_card()` into `inc/helpers.php` - it was being written inline in three
    different templates by this point.
  - **Not yet deployed or run against a real WordPress.** All 34 plugin/theme PHP files balance-
    checked, all 107 function definitions confirmed unique, every `pph_*` call confirmed to resolve to
    a real definition, every `inc/` file confirmed required exactly once, all JS syntax-checked.
    That is the most verification possible without live PHP - the real test is the deploy below.
  - **Client testing surfaced two real bugs and one legitimate follow-up - all closed same pass.**
    - **`/cart/` had a real structural bug.** `cart/cart.php` called `get_header()`/`get_footer()`,
      treating itself as a full-page template. It is not one: the Cart page is an ordinary WordPress
      Page whose content is the `[woocommerce_cart]` shortcode, which runs during `the_content()` -
      already inside the theme's own header/footer call. Adding them again nested a second
      `<html>`/`<head>`/`<body>` mid-page, which is what actually broke the layout - not a missing
      stylesheet as it first looked. **Fixed**: removed both calls, matching
      `content-single-product.php`'s partial pattern. Same lesson as the earlier double-`the_post()`
      bug, different mechanism - worth checking any future Woo template override against "does this
      render as a full page, or as a shortcode-embedded partial" before assuming the full-page
      pattern.
    - **The header search-suggest dropdown was showing hardcoded sample data** - five products, two
      lots, two articles, written directly into `script.js`, and never real even on the static site
      (its SKUs read "PP-1001", not the real "PPH-1001"). Not something the port broke. **Fixed**:
      `inc/catalogue.php` gained `pph_suggest_data()` / `pph_suggest_js()`, generating
      `window.PP_SUGGEST` from every real product, certificate and article, attached as a second
      inline script on the same `pph-catalogue` handle; `script.js`'s hardcoded `SUGGEST` object
      replaced with `window.PP_SUGGEST`.
    - **Checkout's plain appearance was the disclosed trade-off, closed properly rather than left.**
      `inc/checkout.php` still does not rewrite WooCommerce's own checkout template (unchanged
      reasoning - see that file). What was missing was restyling Woo's own default markup to match
      the rest of the site. Added `public/css/woo-bridge.css` - every selector in it is WooCommerce's
      own default class name (`.form-row`, `.woocommerce-checkout-review-order-table`,
      `ul.wc_payment_methods`, `#place_order`, `.woocommerce-error`, the `.pph-ack` class the
      acknowledgement checkboxes already carry), restyled with this site's real tokens
      (colours/type/spacing/radii from `styles.css`). Pure CSS, no markup changes - the worst case if
      something looks slightly off is a visual miss, not a broken checkout. Enqueued only on
      `is_checkout() || is_account_page()`, since every other page already has a fully custom
      template and needs none of it.
  - **Cart page nested-header bug - fixed and confirmed.** `cart/cart.php` was calling
    `get_header()`/`get_footer()` as if it were a full-page template. It isn't - the Cart page is an
    ordinary WordPress Page whose content is the `[woocommerce_cart]` shortcode, rendered mid-`the_content()`,
    already inside the theme's own header/footer call (same category of bug as the earlier
    double-`the_post()` issue, different mechanism). Removed both calls. Client confirmed the cart
    page now matches the static design.
  - **Checkout still looked like plain WooCommerce even with the shortcode confirmed present and
    `woo-bridge.css` loaded - root cause was two things, both fixed:**
    1. **WooCommerce's own default frontend stylesheet was never dequeued.** It ships on every Woo
       page - cart, checkout, account - and was fighting `woo-bridge.css` for specificity the whole
       time; its own grey buttons, table borders and `col2-set` layout were still winning wherever
       `woo-bridge.css` didn't out-specify them. Fixed with `add_filter('woocommerce_enqueue_styles',
       '__return_empty_array')` in `functions.php` - WooCommerce's own documented opt-out.
    2. **Re-skinning Woo's default markup was never going to reach exact parity, because the real
       site's `.field` / `.fieldset` / `.checkout__summary` / `.trow` / `.cart-line` classes (already
       fully styled in `styles.css`, proven working on cart and every other page) are not the same
       shapes as Woo's own `.form-row` / `.woocommerce-billing-fields` / order-review table.**
       `woo-bridge.css` was approximating Woo's markup; it was never going to look identical to the
       real thing. Fixed by overriding the checkout template PARTS - markup only, engine untouched -
       so checkout emits the site's real markup instead: `woocommerce/checkout/form-checkout.php`
       (`.wrap.checkout` two-column layout), `form-billing.php` ("Your research account" fieldset:
       email, account password fields, name, company, the research-field dropdown), `form-shipping.php`
       ("Billing" fieldset, Woo's real ship-to-different-address toggle), `review-order.php` (reuses
       `pph_render_cart_lines_html()` for line items, `.trow` rows for totals), `payment.php` (gateway
       list + the three acknowledgement checkboxes + Place Order, all in a `.fieldset`), `terms.php`.
       All five/six share one new helper, `pph_render_checkout_field()` in `inc/checkout.php`, which
       draws a field as `.field`/`.check` markup from the same `$checkout->get_checkout_fields()` /
       `get_value()` data Woo's own renderer reads - no validation, order-creation or AJAX
       order-review logic touched, only how a field is drawn.
       Also fixed while rebuilding this: **`woocommerce_registration_generate_password` was never
       forced to `'no'`**, so WooCommerce was auto-generating the account password instead of asking
       for one - the missing "Create a password" / "Confirm password" fields the client reported were
       this setting, not a login-state issue. Now enforced alongside the other checkout options in
       `pph_enforce_no_guest_checkout()`.
       **Deliberate deviations from the static design, not oversights:** Payment method + Place Order
       render in the right-hand order-summary column below the totals, not the main column - moving
       WooCommerce's own `payment.php` out of `#order_review` risks its AJAX order-review refresh, and
       this keeps that risk at zero. Full name is two fields (first/last) since WooCommerce has no
       single-name field. No Country field is shown (single-country store; `WC_Customer` defaults it).
       **Live-tested 16 Sep 2026 - still not correct. Root-caused and fixed 16 Sep 2026.** The report
       was two things: checkout rendered whole sections twice, and it still did not match the design.
       Both came from the same place - the template overrides above broke WooCommerce's AJAX
       **fragment contract**, which nothing about the markup rewrite had accounted for.

       `WC_AJAX::update_order_review()` re-renders `checkout/review-order.php` and
       `checkout/payment.php` on every refresh - *including the one `checkout.js` fires on page load* -
       and returns each as a fragment keyed by a CSS selector: `.woocommerce-checkout-review-order-table`
       and `.woocommerce-checkout-payment`. `checkout.js` applies them with
       `$( selector ).replaceWith( html )`. So each template must emit exactly ONE root element, that
       element must carry the class the fragment is keyed by, and nothing it outputs may sit outside it.
       Woo's own templates satisfy that by accident of their shape; ours did not:
       - **`payment.php` put `.woocommerce-checkout-payment` on an inner `div`**, with the
         acknowledgements fieldset and the Place Order block *outside* it. First refresh - on load -
         replaced that inner div with the whole template. Payment, acknowledgements and Place Order all
         appeared twice. **That was "checkout shows the same things twice".**
       - **`review-order.php` carried the review class nowhere at all.** Its fragment selector matched
         nothing, `replaceWith` silently did nothing, and the order summary never updated when the
         address, shipping method or coupon changed. Silent, so nobody had reported it yet.

       Fixed: each template now emits a single root element carrying its fragment class with everything
       inside it. **`tools/check-checkout-fragments.js`** (`node tools/check-checkout-fragments.js`)
       asserts exactly that, textually - run it after touching either template; it fails on all three
       ways to break the contract (class absent, class on an inner element, markup left outside).

       **The deliberate deviation above is reverted - payment/acknowledgements/Place Order are back in
       the main column, matching the static design.** The reasoning for putting them in the summary
       aside ("moving `payment.php` out of `#order_review` risks its AJAX refresh") was wrong: that
       refresh is a *selector* swap, not a container re-render, so the element's position in the DOM is
       irrelevant to it. Woo's own `woocommerce_checkout_payment` callback is unhooked from
       `woocommerce_checkout_order_review` in `inc/checkout.php` (`pph_move_payment_to_main_column()`,
       on `init` - any earlier and `wc-template-hooks.php` has not registered it yet) and
       `form-checkout.php` calls `woocommerce_checkout_payment()` from the main column instead. AJAX is
       untouched: `WC_AJAX` calls that function directly, never through the action.

       Also this pass: the order summary regained the disclaimer notice and the three assurance rows the
       static design has; Place Order reads "Place order - $total" like the static button (`data-value`
       carries the same full label, since Woo's scripts restore a button's text from it); `#place_order`'s
       approximated button styling was **deleted** from `woo-bridge.css` now that the button carries the
       real `.btn.btn--primary.btn--lg.btn--block` classes - an id selector would have out-specified them;
       and every `.woocommerce-checkout-review-order-table` rule there is now prefixed `table.`, since
       that class lives on a `div` in our override and the card styling would have drawn a second box
       inside `.checkout__summary`.

       **Still deviating from the static design, deliberately:** full name is two fields (first/last -
       WooCommerce has no single-name field); no Country field (single-country store); no ACH bank-detail
       fields and no ACH debit authorisation fieldset, because there is no ACH gateway yet - that whole
       section arrives with AllayPay at phase 15, and collecting real routing/account numbers against the
       BACS placeholder is not something to ship early.

       **Live-tested 16 Sep 2026 (third pass) - client reported four more issues, all root-caused and
       fixed this pass:**
       1. **Toast doubling on every add-to-cart action** ("could be for other toasts as well" - correct,
          it was structural, not add-to-cart-specific). Every behaviour script
          (`cart.js`/`store.js`/`script.js`/`catalog.js`/`forms.js`/`woo.js`) is a plain
          `(function(){...})()` with no protection against running twice; WordPress's own
          `wp_enqueue_script` only prints each handle once, so this could only happen from something
          outside our PHP duplicating the `<script>` tag (LiteSpeed Cache's asset combination is the
          prime suspect, per the Gotchas section above, though it was not reproduced locally - no live
          server access this session). A second run of `cart.js` means a second
          `document.addEventListener('click', ...)`, so every add-to-cart, and by extension every toast
          those handlers fire, doubles. Fixed defensively rather than chasing the exact live cause:
          every one of the six files now guards itself with a `window.PPH_LOADED.<name>` flag and returns
          immediately on a second execution, so the page behaves correctly regardless of how many times
          its tag is printed. Source of truth is `public/js/*.js`; synced to
          `wordpress/themes/pph-child/assets/js/` via `node tools/export-wp-theme.js` as always.
       2. **Cart page "Remove" button did nothing.** `removeLine()` in `cart.js` had no `.catch` on its
          request promise, unlike every other mutation (`updateQty`, `addToCart`'s callers) - a failed
          request (stale nonce on a LiteSpeed-cached page, a network blip) rejected silently: nothing was
          removed, no error shown, the button looked broken. Fixed to match `updateQty`'s existing
          pattern: on failure, toast the error and `refresh()` to resync the visible cart with the server.
       3. **Checkout: no gap under the nav, and body text running edge-to-edge.** Root cause was
          `pph_drop_elementor_on_owned_pages()` in `functions.php` never including `is_cart()` /
          `is_checkout()` / `is_account_page()` - the same Elementor-CSS-bleed bug already fixed for
          shop/product pages (see the "site-header collision" entry, Decisions log), just never extended
          to cart/checkout/account. Both are ordinary WP Pages rendered through `page.php`, which calls
          `get_header()` like every other page, so Elementor's plugin frontend CSS was loading there the
          whole time, unopposed since `woo-bridge.css` only restyles WooCommerce's own class names.
          Fixed: extended that function's `$owned` check to the three missing page types.
       4. **No coupon field on checkout.** Real bug, not a missing feature request: WooCommerce hooks its
          own `woocommerce_checkout_coupon_form()` onto `woocommerce_before_checkout_form`, which our
          overridden `form-checkout.php` still calls (first line, unchanged) - so the coupon form *was*
          rendering, just with WooCommerce's own zero-styling default markup, positioned before our own
          page heading even prints, flush against the header. That is very likely also part of finding 3
          (an unstyled, unwrapped notice+form sitting above `.wrap`, full viewport width) - once Elementor
          stopped fighting it, it was still bare Woo markup in the wrong spot. Fixed properly rather than
          just restyled in place: `pph_move_coupon_form()` (new, `inc/checkout.php`) unhooks it from that
          early hook; `form-checkout.php` now calls `woocommerce_checkout_coupon_form()` itself, after our
          heading; new `woocommerce/checkout/form-coupon.php` overrides the template with `.fieldset`/
          `.field`/`.btn` markup. Shown open (no "Have a coupon? Click here" toggle) rather than
          replicating WooCommerce core's default collapsed-by-default behaviour, so it does not depend on
          WooCommerce's own jQuery still finding `.showcoupon`/`.checkout_coupon` after a markup rewrite.
          The submit target (`form.checkout_coupon`, fields named `coupon_code` / `apply_coupon`) is
          untouched, so WooCommerce's own AJAX apply-coupon handler still works with zero JS of ours.

       **Same session, a full site-wide WP-vs-static audit (agent-run, read-only) turned up four more
       real, previously-unflagged bugs, all fixed:**
       5. **Compliance region-gate not wired on the real cart page or the real checkout Place Order
          button.** `data-region-gated` (what `script.js`'s `applyRegion()` disables for a restricted
          destination state - CA/NY/LA) existed on exactly one control anywhere in the WP build: the
          cart-DRAWER's own "Proceed to checkout" link. A visitor who reached `/cart/` directly (never
          opened the drawer) or `/checkout/` by any other route hit no gate at all and could place a real
          order from a restricted state end to end - a genuine compliance gap, not a cosmetic one, given
          how carefully everything else on checkout treats AllayPay's conditions. Fixed: the attribute is
          now also on `woocommerce/cart/cart.php`'s "Proceed to checkout" link and
          `woocommerce/checkout/payment.php`'s real `#place_order` submit button. Both use the exact same
          client-side mechanism the drawer link already relied on - not a new, weaker one.
       6. **`/account/`, `/orders/`, `/login/`, `/account/#wishlist` almost certainly 404 on live
          WordPress.** These were real flat pages in the static build; ported as literal hrefs straight
          through into `src/layout.js`, which generates the WP theme's header/footer chrome unchanged.
          WooCommerce's My Account page is not guaranteed to sit at `/my-account/` even (the slug is
          whatever Pages > My Account is actually set to), login is a *tab* on that page rather than its
          own URL, and Orders is one of My Account's *endpoints*, not a top-level page -
          `form-checkout.php`'s own "Sign in" link already does this correctly
          (`wc_get_page_permalink('myaccount')`), the site-wide chrome just never adopted it. Fixed the
          same way as the Quick-order-link removal: `tools/export-wp-theme.js` gained a
          `fixAccountLinks()` post-process step (applied to the generated header/footer/mobile-nav output)
          that swaps each literal href for the right WooCommerce call
          (`wc_get_page_permalink('myaccount')` / `wc_get_account_endpoint_url('orders')`) baked into the
          generated PHP. `src/layout.js` itself is untouched - those paths are correct for the static
          build, which still has real files at them.
       7. **`woo.js`'s empty-variation submit fallback could double-add and bypass the AJAX cart.** Low
          reachability (the buybox form's variation input is always pre-populated server-side; this path
          needs it to somehow be empty), but a real latent bug: the fallback called `preventDefault()`
          then `form.submit()`. `HTMLFormElement.submit()` does not fire a `submit` event, so `cart.js`'s
          document-level listener (the REST add-to-cart call) never saw *that* call - it fell through to
          a real native POST/page-reload instead - while the *original* submit event, preventDefault or
          not, still bubbled up to that same listener afterwards with the now-synced variation value,
          adding the item a second time through the AJAX path. Fixed: sync the value and let the one
          event keep bubbling, like every normal submit does; the redundant `form.submit()` is gone.
       8. **Latent duplicate "accept terms" checkbox.** `checkout/terms.php` rendered WooCommerce's own
          optional terms checkbox whenever `wc_terms_and_conditions_checkbox_enabled()` is true (a Terms
          page set under WooCommerce > Settings > Advanced) - currently inert since no Terms page is
          configured, but this store's checkout already has its own `pph_ack_terms` acknowledgement
          covering identical ground with a timestamp captured on the order
          (`pph_add_acknowledgement_fields()`, `inc/checkout.php`). The day someone sets that WooCommerce
          setting, checkout would silently grow a second "accept terms" checkbox. Fixed at the root rather
          than left as a trap for whoever touches that setting later: `terms.php` no longer consults
          `wc_terms_and_conditions_checkbox_enabled()` at all and never renders Woo's own checkbox: only
          the (harmless, independent) Terms-page content passthrough remains.

       **Two more findings from the same audit were surfaced rather than silently built at the time -
       both were then asked for explicitly and built for real the same session:**
       - **Wishlist now has a real page to land on.** New `inc/account.php`, hooked onto
         `woocommerce_account_dashboard` (WooCommerce's own extension point for the account overview page
         - not an override of `myaccount/dashboard.php`, so WooCommerce's own "Hello X, view your orders"
         intro and its real links are untouched and cannot drift out of step with a WooCommerce update).
         Adds the `[data-wish-list]` / `[data-wish-empty]` section `store.js`'s existing, unchanged
         wishlist logic was always looking for - the toggle buttons on every product/catalogue card
         already saved to localStorage; this is the missing landing page, nothing more. My Account is
         still WooCommerce's default template/layout otherwise (still an explicit deferral, see below) -
         this is the one section that was an actual missing feature, not a restyle of the rest of the
         page.
       - **"Save this order" is real now, not a toast.** The static build's version
         (`src/pages/commerce.js`'s cart()) faked a toast with no account system behind it to save
         anything to; `woocommerce/cart/cart.php` correctly dropped it rather than port a fake feature.
         Built for real this session: three new REST routes in `inc/cart-api.php`
         (`/cart/save`, `/cart/saved/restore`, `/cart/saved/remove`, all `is_user_logged_in`-gated, unlike
         the guest-accessible add/update/remove routes) snapshot the current cart's product/variation/
         quantity lines into one user-meta value (`_pph_saved_orders`, capped at 20 entries). The button
         itself (`woocommerce/cart/cart.php`) only renders for a signed-in visitor - a guest sees "Sign in
         to save this order" instead of a button that would just 403. `inc/account.php` gained a second
         section, **Saved orders**, server-rendering each snapshot (skipping any line whose product has
         since been deleted/unpublished) with "Add to cart" / "Remove" actions; both go through `cart.js`'s
         existing REST plumbing (`[data-saved-restore]` / `[data-saved-remove]`), so restoring a saved
         order updates the drawer/badge immediately, the same way every other cart action already does.
         Not a WooCommerce order - no payment, no stock reservation - it is exactly what the button says,
         a saved cart to reorder from later.
       - **Not yet live-tested, either.** Both are new server-side code + new REST routes with no manual
         verification against a running WooCommerce install yet. Next session/deploy: sign in, add items,
         click "Save this order" on `/cart/`, confirm it appears under Saved orders on the account page,
         click "Add to cart" there and confirm the drawer updates, click "Remove" and confirm the row
         disappears. Separately: click the heart on a product card, then check the Wishlist section on the
         account page shows it (this exercises `store.js`, unchanged - the new part is only the landing
         page it renders into).

       **Live-tested after the above deploy, 16 Sep 2026 (fourth pass) - two bugs still reported, both
       traced to the same known, already-documented cause: LiteSpeed Cache page-caching /cart/ and
       /checkout/.** ("An item added from anywhere else works immediately [all AJAX - never touches page
       cache], but navigating to a fresh /cart/ or /checkout/ page load does not show it, unless the item
       was added from a control on the cart page itself [also AJAX].") That is exactly what a cached,
       stale HTML response for those two URLs looks like: the request never reaches WordPress at all,
       LiteSpeed serves whatever was cached from an earlier, likely-emptier visit. The Gotchas section
       above already documents the fix (Pages -> Cart/Checkout/My account -> LiteSpeed panel -> Disable
       Cache, must Save) - it is a manual, per-page, easy-to-miss-or-lose-on-a-resave toggle, evidently
       either never set or reset since. Toast doubling most likely shares the same root: if the page
       itself was cache-stale, LiteSpeed's separate CSS/JS optimisation cache serving a pre-fix bundle of
       `cart.js` (without this session's earlier `PPH_LOADED` guard) from before this pass's deploy is the
       likely explanation, rather than a new code bug - `assets/js/cart.js` on disk does carry the guard
       (confirmed by re-reading the deployed file this session).

       **Fixed at the code level rather than left resting on the manual toggle alone:**
       `pph_never_cache_dynamic_pages()` (new, `functions.php`) sends `nocache_headers()` (WordPress
       core's standard no-cache response headers) plus the `X-LiteSpeed-Cache-Control: no-cache` header -
       LiteSpeed's own documented origin-to-cache signal, read before LiteSpeed ever considers caching a
       response - on every `is_cart()` / `is_checkout()` / `is_account_page()` request. This does not
       replace checking the wp-admin toggle (still worth confirming it is set), but it means the bug can
       no longer depend on that toggle being remembered, including for pages added later (My Account's
       own sub-endpoints - orders, addresses).

       **Deploy checklist for this specifically, next time:** re-upload `functions.php`; in wp-admin,
       confirm (or re-set) the LiteSpeed "Disable Cache" toggle on Cart, Checkout and My account, **then
       Purge All** in LiteSpeed Cache (not just the general page cache - its CSS/JS optimisation cache is
       a separate store and should be cleared too); test in a private/incognito window first, to rule out
       a stale copy of the *page* sitting in the browser's own cache from an earlier visit before drawing
       any conclusion about the server. If toast doubling is still reproducible after a clean private-
       window test against a freshly-purged cache, that would point at something other than caching and
       is worth a fresh, specific repro (which exact button, which page) rather than assuming this
       diagnosis again.

       **Client reported both symptoms still present after this fix was described, 16 Sep 2026 - status
       unclear, not yet resolved as confirmed-fixed.** `pph_never_cache_dynamic_pages()` is real, deployed
       to `functions.php` as of this pass, and is a correct, unconditional fix for the page-cache half of
       the diagnosis regardless of any wp-admin toggle state - if it is live on the server and the
       LiteSpeed cache/CSS-JS-combine store was actually purged after it went up, the stale-cart-on-
       navigation symptom cannot still happen from THIS cause. What is not yet confirmed: whether
       `functions.php` actually made it to the server, whether Purge All was run afterward (a plain page-
       cache purge does not necessarily clear the CSS/JS combine store - see the checklist above), and
       whether the retest happened in a private window rather than a browser that already had the old
       page cached locally. **Next session: do not re-diagnose from scratch - first verify each of those
       three things actually happened, in order, before looking for a different cause.** If all three are
       confirmed done and the symptom is still reproducible in a clean private window, that is real new
       information (rules out caching entirely) and is worth a fresh, specific repro - which exact button,
       on which page, does the network tab show one request or two - rather than assuming this diagnosis
       still holds.

       **16 Sep 2026 (sixth pass) - client re-tested after deploying the cache fix and gave a sharper
       repro: "add a product, the count goes up then back down, only the original item stays" - which is
       NOT caching, it is a real client-side race condition in `cart.js`, found and fixed this pass.**
       `cart.js` called `refresh()` (a GET `/cart`) TWICE on every single page load - once immediately,
       once again on `DOMContentLoaded`. With `defer` (how this script loads), that event has not fired
       yet at the point the script runs its own top-level code, so the second call was not conditional or
       occasional - it fired on every page load, no exceptions. Two GET requests in flight is a race: if a
       user clicks "Add to order" while either one is still pending, and that GET's response happens to
       arrive AFTER the add's response, applying it (as the code unconditionally did) overwrites the
       correct, just-updated cart with the stale one that GET described - which reads exactly as reported:
       badge goes up (the real add lands), then back down (the stale refresh() response lands after it and
       wins). This did not need a user to click twice - one click, one slow background request left over
       from page load, was enough.

       **Fixed at the root**, not just by removing the duplicate call (that only shrinks the window, a fast
       click during the ONE remaining refresh() could still race): every cart action in `cart.js`
       (`refresh`, `addToCart`, `updateQty`, `removeLine`, `restoreSavedOrder`) now stamps a sequence
       number before it fires and only applies its response if no newer action has started since -
       "last request wins", not "last response to arrive wins". The redundant `DOMContentLoaded` call is
       also removed (one `refresh()` per page load, not two), both for the reason above and because it was
       always doing pointless duplicate work. `public/js/cart.js` is the only file changed; synced to
       `wordpress/themes/pph-child/assets/js/cart.js` via the usual `node tools/export-wp-theme.js`.

       **The separate "empty /cart/ on navigation" symptom is still open and NOT explained by the race
       condition above** - a `refresh()` is read-only (a GET), so even a stale one being applied client-side
       cannot make an item disappear from the server's actual session cart; whatever `/cart/`'s own PHP
       render sees on a fresh, uncached page load is the real, current WooCommerce cart, full stop. The
       client says the cache-header fix (`pph_never_cache_dynamic_pages()`) was deployed and the checklist
       above followed, and the symptom is STILL present - so either something in that checklist did not
       fully take effect (a re-upload or purge that silently did not do what it was supposed to is common),
       or this needs a different explanation entirely. **Next session: settle this with hard evidence
       before guessing further** - open DevTools → Network tab, load `/cart/` after adding an item from
       elsewhere, click the `/cart/` document request, check the **Response Headers**:
       - If `Cache-Control` shows something like `no-cache, no-store, must-revalidate` and/or
         `X-LiteSpeed-Cache-Control: no-cache` is present - the code fix IS live and this is NOT a caching
         problem; something else is making `/cart/`'s own PHP render see an empty cart (worth checking
         next: does the WooCommerce session cookie - `wp_woocommerce_session_*` - actually get set/sent
         back correctly on the REST add-to-cart response, and is it present on the subsequent `/cart/`
         page request; a session/cookie continuity gap between the REST API context and a normal page
         load is the next most likely real cause if caching is ruled out).
       - If those headers are absent, or an `X-LiteSpeed-Cache: hit` header is present - the fix never
         actually reached this response, which means the upload, the LiteSpeed toggle, or the purge did
         not fully take effect - re-do the three-step checklist above rather than looking for a new bug.

       **Settled with hard evidence the same day - client sent the actual Network tab response for
       `GET /wp-json/pph/v1/cart`. Root cause confirmed, real bug, fixed.** The response:
       `x-litespeed-cache: hit`, `cache-control: public, max-age=604800` (cached, publicly, for a week),
       body `{"count": 0, "isEmpty": true}` - a stale snapshot from whenever the cache first filled (an
       empty cart), served to every visitor's `cart.js` regardless of what their own real cart holds.

       **This was never the `/cart/` PAGE being cached - it is the custom REST API itself
       (`/wp-json/pph/v1/cart` and its five siblings) being cached, which `pph_never_cache_dynamic_pages()`
       (previous entry) never touched.** That function hooks `template_redirect`, which does not fire for
       REST API requests at all - it was correctly written for the page-cache half of the original theory,
       but a REST endpoint is a completely different WordPress code path, so it silently did nothing here.
       LiteSpeed's own WooCommerce integration auto-excludes WooCommerce's OWN REST namespaces
       (`wc/store`, `wc/v3`...) from caching; it has no way to know a *custom* namespace like `pph/v1` is
       cart data too, so it applied its default "cache any GET that doesn't say otherwise" behaviour to it.

       This single bug explains **both** remaining symptoms, not two separate ones: the page itself
       renders correctly server-side (assuming the cache-header fix on that half is live), then `cart.js`'s
       own `refresh()` call - which every add-to-cart and every page load fires - immediately overwrites
       that correct render with this same stale, shared, week-old "empty" snapshot. That is the "item
       added, but /cart/ or the drawer still shows empty" bug and very likely also what made the earlier
       add-then-revert race condition (previous entry, already fixed in `cart.js`) actually visible in the
       first place: even with the race fixed, if the *response itself* is wrong, correct sequencing just
       means every request reliably lands on the same wrong answer instead of a wrong answer that
       sometimes wins.

       **Fixed:** new `pph_cart_rest_never_cache()` in `inc/cart-api.php`, hooked on `rest_post_dispatch`
       (fires on every REST response right before WordPress sends it) and scoped to any route starting
       `/pph/v1/cart` - covers all six/seven cart endpoints (state/add/update/remove/save/saved-restore/
       saved-remove) from one place, including any added later, rather than needing the header added to
       each callback individually. Sets `Cache-Control`/`Pragma`/`Expires` (the same values WordPress
       core's own `nocache_headers()` sends) plus `X-LiteSpeed-Cache-Control: no-cache` - via
       `$response->header()` on the `WP_REST_Response` object, not a raw PHP `header()` call, so it goes
       through WordPress's own REST header pipeline rather than racing it.

       **Deploy:** re-upload `inc/cart-api.php`. Then, in LiteSpeed Cache, **Purge All is not enough by
       itself here** - the existing cached REST response needs to actually be evicted, and per the exact
       tag on the response the client captured (`x-litespeed-tag: 146_default,146_URL...,146_REST,146_`)
       it is tagged and cached individually per URL, not swept by a page-level purge alone; Purge All
       should still clear it, but if a retest still shows `x-litespeed-cache: hit` on this specific
       request afterward, purge again and/or wait past its own cache TTL rather than assuming the code fix
       failed. Retest the same way: DevTools Network tab, `GET /wp-json/pph/v1/cart`, confirm
       `x-litespeed-cache` is **absent or `miss`**, not `hit`, before checking the actual cart behaviour.

       **Client's own call, same day: LiteSpeed Cache plugin removed entirely for the development phase**,
       to stop this whole class of bug from recurring while iterating. Sensible - nothing to cache means
       nothing for `pph_never_cache_dynamic_pages()` / `pph_cart_rest_never_cache()` to fight, so cart/
       checkout/account and the REST API should now behave correctly on every request, full stop. Both
       functions stay in the codebase regardless (harmless no-ops with the cache off) rather than being
       reverted - they are exactly what makes it safe to turn LiteSpeed back on later without this
       recurring, and removing them now would just mean re-discovering the same bug again at that point.
       **Must be re-enabled before launch** - phase 14 (performance/caching/security/backups) is still
       "not started" in the Phase status table above, and a live site serving every request through PHP
       with no page cache at all will be materially slower on real traffic. When it goes back on: no
       special steps needed beyond the normal LiteSpeed setup (the exclusions are code-level now, not a
       page-by-page toggle to remember) - but re-verify cart/checkout/the REST endpoint the same way once,
       just to confirm re-enabling it did not somehow reintroduce the gap this pass closed.

       **Separately, 16 Sep 2026: investigated a "product bundles" feature request** (a teammate's
       recollection of a client conversation about a quantity-based offer - "above 4 vials", "above 8
       vials"). Read the entire client record to check it against what is actually documented: all 17
       pages of `mdnjuan.pdf` (the full chat), `mdnjuan/Copy of Inventory of Peptides.xlsx` (stock/lot
       numbers only, no pricing), the `mdnjuan/Purely Peptides Hub/` folder (logo assets only), and all
       three `mdnjuan-attachments*/` folders (COAs, safety data sheets, AllayPay application screenshots
       only). **Finding: nothing in the client record mentions "bundles" or a 4/8-vial threshold at all.**
       The only volume-discount language anywhere in the client history is the chat's own "Volume break
       configured up to 16% at 10 vials" (27 Aug, confirmed by the client as stacking with Subscribe &
       Save) - which is exactly the volume ladder already built and live in `inc/pricing.php` (5+ vials
       -8%, 10+ vials -16%, hardcoded tier boundaries at `pph_volume_rate_for_qty()`, percentages editable
       in PPH Settings). **Conclusion: this is very likely the teammate recalling the same already-built
       5/10-vial ladder slightly off (as 4/8), not a request for a separate "WooCommerce Product Bundles"
       feature.** No code changed as a result - nothing to build. If the client explicitly confirms the
       breakpoints should be 4 and 8 rather than 5 and 10, that is a small, cheap fix (two numbers in
       `pph_volume_rate_for_qty()` plus the ladder text on the product page and the PPH Settings labels),
       but should not be changed without that confirmation, since 10-vials/16% is the one number actually
       in writing from the client.
       - **On WooCommerce Product Bundles as a paid extension:** discussed and **not purchased/installed
         this session.** It would conflict with the existing "No paid plugins" decision (Decisions log,
         14 Sep 2026) for the same reason the subscription engine was hand-built instead of bought. Its
         one clearly-justified use case on this store is **Wholesale (phase 10, not started)** - kits/
         packages for institutional buyers - and even there, WooCommerce's free core "Grouped product"
         type or a free third-party bundle plugin should be tried before spending money, per the same
         free-stack principle already applied everywhere else in this build. Revisit only if/when phase 10
         is actually scoped with the client and a real bundle-pricing need is confirmed.

       `node tools/check-checkout-fragments.js` still passes after all four fixes. **Still not
       live-tested against a running checkout** - next session: load `/checkout/` with items in the cart
       and confirm (a) nothing renders twice on load, (b) totals update on shipping/address change, (c)
       the coupon field visibly works, (d) the layout now has normal spacing under the nav.
  - **Products page (`/products/`), 16 Sep 2026: "Browse by category" hero grid and the "Quick order"
    bulk-paste section removed from the page body**, on request - the page now goes straight from the
    page heading into the catalogue (filters + results), matching a "just show the products" layout.
    **WordPress-only change** - `site/products.html` (the static build) and its source
    (`src/pages/catalog.js`) are untouched and still carry both sections; this was scoped to "the
    wordpress edition" in the request, not a change to the agreed static design. Neither feature is
    actually lost on WP: every category these tiles linked to is one click away in the header's mega menu
    (already existed) and is the first filter group in the catalogue body itself
    (`pph_render_catalog_body()`'s `data-facet="cat"` checkboxes, already existed) - category browsing
    now lives in the nav and as a filter, not as its own page section, exactly as requested. Quick order
    (`catalog.js`'s `data-bulk`/`data-bulk-add` handlers) has no remaining entry point on `/products/` and
    was not ported anywhere else - it stays a static-build-only feature. The header's "Quick order" icon
    link (which pointed at `/products/#quick-order`) is WP-only removed too: rather than hand-edit the
    generated `header.php` (which `tools/export-wp-theme.js` would silently overwrite on the next run,
    regressing this fix), `export-wp-theme.js` itself gained a small `stripQuickOrderLink()` post-process
    step - `src/layout.js` (shared with the static build) is untouched, so the static site keeps the icon.
  - **Explicitly deferred, not forgotten:** My Account and order-view pages still use WooCommerce's
    default templates, unstyled to match the design. The static build's account/orders pages were
    always presentation-only demos (`account.html`, `order-pph-*.html`), never wired to anything real -
    restyling Woo's real, working defaults is lower-risk than building fresh custom templates for a
    part of the site nobody has compared against the static design yet.
- **Built a no-CLI import path.** Client has no WP-CLI on staging yet. Factored the certificate/
  article import logic out of `tools/import-wp-content.php` into
  `pph-core/inc/importer.php::pph_run_content_import()`, so both the CLI script and a new admin
  screen (**Tools → Import PPH Content**, `inc/admin-import.php`) call the identical function —
  upload a zip of `wordpress/content/`, no SSH or WP-CLI needed. **Remove `inc/admin-import.php` and
  its require in `pph-core.php` before handover** — an unrestricted zip-upload-and-run screen has no
  reason to exist in the shipped plugin. Both importers accept a `PPH_CONTENT_DIR` /
  `PPH_PAGES_DIR` env override for when only `tools/` + the data folder are uploaded, not the whole
  repo.

---

## Decisions log

| Date | Decision | Why |
|---|---|---|
| 14 Sep 2026 | Hello Elementor + `pph-child` + Elementor Pro | Client already has the licences; Hello ships almost no CSS, so nothing to fight |
| 14 Sep 2026 | Elementor owns **prose pages only** | `script.js` binds by `data-*`; a builder does not emit those attributes, so shop/product/cart/checkout/home stay PHP templates |
| 14 Sep 2026 | Yoast free; **WooCommerce owns `Product` schema** | Yoast WooCommerce SEO ($99/yr) not approved. Woo emits valid Product JSON-LD natively. Delete the hand-written block, do not port it. |
| 14 Sep 2026 | Contact Form 7 | Free, and its form body is hand-written HTML so it can emit our exact `.field` / `data-validate` markup |
| 14 Sep 2026 | Staging on our own server; migrate at handover | Client hosting credentials not available |
| 14 Sep 2026 | Owner-editable baseline only | Products, COAs, articles, pages. Homepage furniture, mega menu, footer stay in the template. |
| 14 Sep 2026 | No paid plugins | Subscription engine becomes ours — `CONVERSION-PLAN.md` §5a |
| 14 Sep 2026 | Import prose pages as a Custom HTML block, not Elementor | Faithful markup now; convert the 5 marketing pages to Elementor later, when someone actually needs to edit them |

---

## Gotchas found (move to TROUBLESHOOTING.md once the WP build starts)

- **kses strips the markup on import.** `wp_insert_post` runs content through kses unless the current
  user has `unfiltered_html`. Under `wp eval-file` there is no current user, so `<svg>`, `<button>`
  and every `data-*` attribute get stripped silently — and `data-*` is how `public/js/script.js`
  finds anything. Fix: `kses_remove_filters()` at the top of the script, plus `--user=1`. Both are
  already in `tools/import-wp-pages.php`.
- **83 pages is really 14 pages and 6 templates.** Only the prose pages get imported. 25 products,
  7 categories, 12 certificates, 8 articles, 5 order pages and the whole commerce flow are
  template-driven. Converting them as pages would be thrown away at phase 4.
- **`wpautop` mangles the layout** if the body is imported as plain content. The importer wraps
  each body in `<!-- wp:html -->`, which bypasses it.
- **Titles come out HTML-escaped** from `<title>` (`Quality &amp; testing`). The exporter decodes
  them; WordPress escapes again on output.
- **`mobileNav()` and `overlays()` are not exported from `src/layout.js`** — they are only emitted
  inside `page()`. The theme generator takes them out of a rendered page rather than widening the
  static build's public surface.
- **Class-name collision with the parent theme — the big one. FIXED and verified 14 Sep.** `assets/css/styles.css` styles
  `.site-header`, `.site-footer` and `.site-main`; those are Hello Elementor's own class names too.
  Hello's stylesheet lands on our markup and produces three symptoms at once: header and footer
  constrained to Hello's container width instead of full-bleed, Hello's pink link/button colour on
  hover, and a dead gap between the nav bar and the mega-menu panel (Hello's padding on
  `.site-header` pushes `.mega`'s `top: 100%` below the nav, and crossing the gap fires
  `mouseleave` on `.primary-nav`, which closes the menu).
  **Fix:** `pph_drop_parent_styles()` in `functions.php` dequeues *and deregisters* every
  `hello-elementor*` style handle. `styles.css` carries its own reset and needs no parent stylesheet.
  Do not name a Hello handle as a dependency of `pph-styles` — that re-enqueues what was just
  removed. (That was the original bug: the first `functions.php` did exactly that.)
- **The certificate library's filter bar was presentation only** in the static build. In WordPress
  the search, product and status controls actually filter; the two date inputs were dropped, because
  test dates are stored as printed ("3 Apr 2026") and cannot be range-queried. A control that does
  nothing is worse than no control. Deliberate deviation from the static design — flag it if the
  client notices.
- **The research library's featured article** was `articles[0]` in the static build. In WordPress it
  is whichever article is flagged Featured, falling back to the newest — otherwise it goes stale the
  first time the owner publishes something.
- **Certificates have no editor body.** `pph_coa` supports `title` only. Every value must match the
  issued document; a free-text body is somewhere to contradict it.
- **Rewrite rules need flushing** after registering a post type, or `/certificates/bp10-0318/` 404s
  until somebody re-saves the permalinks screen. Handled in the activation hook and again at the end
  of the content importer.
- **LiteSpeed Cache (Hostinger's default) minifies HTML.** Any tool or check that assumes whitespace
  between tags - including `tools/diff-wp.js` before the fix below - breaks silently on this host.
  More importantly: LiteSpeed's optimizer features (minify, defer JS, lazy load) are the specific
  mechanism CONVERSION-PLAN.md §11 warned about - they can break `data-*`-bound JS **for logged-out
  visitors only**, since admins usually view the site logged in, past the cache. Exclude cart,
  checkout, My Account and any age-gate/geo-restriction script from LiteSpeed's optimisation once
  those pages exist, and re-check logged-out after every LiteSpeed setting change.
- **`diff-wp.js`'s own tag-splitter broke on minified HTML.** It used `>\s+<` (one or more spaces) to
  find tag boundaries; with zero spaces between tags - exactly what LiteSpeed's minifier produces -
  it never matched, so the entire rest of a page collapsed onto one unreadable "line" and the tool
  reported huge, meaningless diffs (98 lines, 69 lines). Changed `\s+` to `\s*`. Two more
  normalisation gaps found and fixed in the same pass: `index.html` was mapped to `/index/` instead
  of `/`, and `article-`/`product-`/`certificate-`/`category-`/`order-` prefixed static filenames
  weren't mapped back to their real route prefixes, so every cross-page link produced a false-positive
  diff line. Always read the tool's actual output before trusting a line-count delta - a broken
  comparator and a broken site look identical from the summary line alone.
- **The age gate lives inside `overlays()`**, so it ships in `footer.php`. The theme generator fails
  the build if `data-agegate` is missing from the output — it is an AllayPay condition, not
  decoration.
- **First real import surfaced a real bug: product images 404'd.** `pph_attach_theme_image()`
  originally registered a Media Library entry pointing straight at the file in
  `wp-content/themes/pph-child/assets/img/`, to avoid duplicating ~9 MB of images already shipped with
  the theme. That was wrong, not just unconventional: WordPress stores an attachment's file as a path
  *relative to the uploads directory* (`_wp_attached_file`) and rebuilds the front-end URL from that
  plus the uploads base URL. A file outside uploads entirely has no such relative path, so the
  reconstructed URL was wrong on every product. **Fixed** by actually copying the file into
  `wp-content/uploads/pph-products/` — the boring, standard way — and made the importer self-healing:
  on re-run, an attachment left over from the broken version (detected by its `_wp_attached_file` not
  living under the uploads directory) is deleted and recreated correctly, so nobody has to manually
  clean up the Media Library. Re-running the product import after this fix repairs it.
- **WooCommerce's "Custom base" permalink setting only rewrites individual product URLs, not the shop
  archive itself.** The shop landing page is a separate WordPress page (titled "Shop" by default,
  created during setup), with its own slug - `/shop/` unless changed. Setting Custom base to
  `/products/` alone still 404s at `/products/` because the Shop page's slug is untouched. Fix: rename
  the Shop page's own slug to `products` (Pages → Shop → Quick Edit), then select the **"Shop base"**
  radio on Settings → Permalinks instead of "Custom base" - that ties the archive and every product
  URL to the one page slug, so they cannot drift apart later.
- **WooCommerce also has a *separate* "Product category base" field**, further down the same
  Permalinks screen, independent of the product-URL setting above and defaulting to
  `product-category` rather than the `products/category` the whole build assumes. Missing this
  produced a real 404 on every category URL. Fixed once identified - set explicitly.
- **A custom `<form>` should never be named `class="cart"`.** WooCommerce reserves that class (and
  `quantity`, `variations`, `variations_form`, `single_variation_wrap`) for its own default styling,
  built for a totally different markup shape than ours. Naming our real add-to-cart form "cart"
  pulled WooCommerce's own floats/inline-layout CSS in over every direct child of it - Size,
  Quantity, Purchase options and the Volume ladder all landed side by side instead of stacked. Check
  any new markup against this list before reusing a name that sounds generic but is not.
- **LiteSpeed Cache's per-page exclusion is a "Disable Cache" toggle in a LiteSpeed metabox on the
  page's own edit screen** (Pages → Cart/Checkout/My account → LiteSpeed panel in the editor sidebar),
  not something configured centrally via page IDs. Used this instead of hunting for numeric IDs in
  the central Excludes screen - simpler, and it's the same outcome. Must click the page's own **Save**
  after toggling; the toggle alone does not persist.
- **WooCommerce's onboarding is a checklist now, not a full-screen wizard.** Newer WooCommerce shows
  "Let's get you started" on WooCommerce → Home instead of the old multi-screen setup flow this doc
  originally described. Functionally the same 6 things (add products, payments, customize store,
  tax, shipping) - all optional, none block anything. Skip the whole checklist; go straight to
  Settings → General (store address/currency), the LiteSpeed exclusion, and Permalinks.
- **The product/category import does not prune removed variations.** If a size is ever deleted from
  `src/data.js`, its WooCommerce variation stays behind and needs removing by hand in wp-admin. Not
  worth the extra code for something that has not happened once in this catalogue's history — add it
  if it ever does.

---

## Phases A–D — done

Everything through installing WooCommerce, importing products, and building/deploying the shop,
category and single-product templates is complete and confirmed live by the client, including the
real add-to-cart form and real volume pricing. Full detail of what each step involved is in "Done so
far" and "Gotchas" above - not repeated here now that it is finished. Two things surfaced along the
way still need action; both are in "Known open items" below.

## Next actions, in order

### F. Deploy phase 5's search page and all of phase 8

This is the largest deploy of the build so far - go through it in order, and check each step before
moving to the next rather than uploading everything and testing at the end, so a problem is easy to
isolate.

1. Re-upload `wordpress/plugins/pph-core/` in full (five new files: `inc/catalogue.php`,
   `inc/cart-api.php`, `inc/checkout.php`, plus updated `inc/helpers.php`, `pph-core.php`).
2. Re-upload `wordpress/themes/pph-child/` in full (updated `functions.php`, new
   `woocommerce/cart/cart.php`, new `page-search.php`, updated `woocommerce/content-single-product.php`).
   `node tools/export-wp-theme.js` has already been re-run this pass, so the new `assets/js/cart.js`
   and the rewritten `assets/js/store.js` are already staged in the folder - confirmed present before
   writing this.
3. **Check WooCommerce → Settings → Accounts & Privacy → guest checkout is now off**, and that a
   "Search" page exists under Pages (both happen automatically the moment `admin_init` runs, which is
   any admin page load - visiting wp-admin once after the upload is enough).
4. Visit `/search/` - should show all products, all certificates, all articles, with working scope
   tabs and live text filtering. No new JS to debug here if something looks off - the bug is in the
   server-rendered markup, not the search logic.
5. On a product page, add an item to the cart. **Check the drawer actually opens and shows the real
   item** - this is the core of what was broken before.
6. Visit `/cart/` - the same item should be there, with a working quantity stepper and remove button.
7. Click through to `/checkout/`. Confirm: an account section is required (no guest option), the
   research-field dropdown appears and is required, the three acknowledgement checkboxes appear
   unchecked and required, and "ACH / bank transfer" appears as the payment option with its
   launch-pending description.
8. Place a real test order end to end. Then open that order in **WooCommerce → Orders** and confirm
   the research field and all three acknowledgement timestamps appear on the admin screen.

If any step fails, stop there rather than continuing down the list - later steps depend on earlier
ones working (checkout depends on the cart being right, which depends on the catalogue feed being
right).

### Still open after that

9. **Delete the hand-written `Product` JSON-LD** if it is still emitted anywhere for products (check
   first - it may only ever have existed in the static build's own page module, in which case there
   is nothing to delete). WooCommerce emits its own `Product` structured data automatically; two
   `Product` entities on one URL is a Search Console error.
10. Restyle My Account and order-view to match the design - deferred this pass since they were
    always presentation-only demos in the static build (see Done so far).

Two things already built wire themselves back up now that real products exist: a certificate's "View
product" link, and the "Related materials" card on articles (the template already checks for
WooCommerce and was omitting the card until real products existed, rather than rendering it empty).

**Still outstanding from earlier, not yet scheduled**

- Wire the settings screen's contact details into `header.php` / `footer.php`, replacing the literal
  placeholder text - small, deliberately deferred
- Install and configure Yoast; meta descriptions are already sitting in `_yoast_wpseo_metadesc`
- Nav active state - `header.php` ships without it, becomes dynamic once the mega menu queries Woo
  category terms
- Commit. `CONVERSION-PLAN.md`, `PROGRESS.md`, `tools/` and `wordpress/` are all still untracked

---

## Commands

```bash
npm run build                                    # rebuild the static site into site/
npm start                                        # build + serve at http://localhost:4173
node tools/export-wp-theme.js                    # generate pph-child chrome + copy assets (incl. public/js/woo.js)
node tools/export-wp-pages.js                    # export the 14 prose page bodies
node tools/export-wp-content.js                  # export 12 certificates + 8 articles + icons.php
node tools/export-wp-products.js                 # export 7 categories + 25 products (41 variations)
wp eval-file tools/import-wp-pages.php --user=1     # import the pages (or Tools -> Import via zip)
wp eval-file tools/import-wp-content.php --user=1   # import certificates + articles (or zip)
wp eval-file tools/import-wp-products.php --user=1  # import categories + products (or zip) - needs WooCommerce active
node tools/diff-wp.js <url> <static-file>        # check a WP page against the static one
ONLY_DOCUMENTED=1 node build.js                  # fallback build: 10 documented products only
```

---

## Open questions we are waiting on

- **AllayPay integration path** — Woo plugin? NMI / Authorize.Net rails? Bespoke API? Sizes both the
  gateway (phase 15) and the subscription engine (phase 9).
- **AllayPay tokenisation for automatic rebilling** — raised with the client 27 Aug, never confirmed.
  If no, Subscribe & Save is a discount code plus a reminder email, and that needs saying in writing.
- **Prices** — never supplied, for any SKU. Nothing past phase 3 ships without them.
- Full client-blocked list: `CONVERSION-PLAN.md` §15.

---

## Outstanding, outside the build

`mdnjuan.pdf` is still tracked in git; the remote is
`github.com/varun-s20/purely-peptides-wordpress`. It carries the client's name and email, the
AllayPay correspondence, the pricing negotiation and the fact that payment had not cleared.
`.gitignore` does not untrack what is already committed. If that repo is public: make it private, or
purge the file from history and force-push. Both destructive — needs a decision, still open.
