# Purely Peptides Hub — static site → WordPress + WooCommerce

**Project:** purelypeptideshub.com (Digital Heroes × Juan Medina / mdnjuan)
**Written:** 14 September 2026
**Source of truth for scope:** the Fiverr chat (`mdnjuan.pdf`, Scale Plan accepted 9 Sept 2026),
the AllayPay merchant-account requirements, and the finished static build in `site/`.
**Contract dates:** started 9 Sept 2026 · 25-day delivery · 3 months post-launch support.

---

## 0. The short answer to "is it just converting HTML pages?"

No. The HTML is the smallest part.

| Layer | Effort | Why it is not "paste the HTML" |
|---|---|---|
| Design / markup port | ~15% | Design is settled and already one global stylesheet. Mechanical. |
| WooCommerce store | ~30% | 25 products, 41 size variations, 12 custom spec fields per product, stock + lot per variation |
| Compliance layer | ~15% | Age gate, no-guest-checkout, research-field capture, 3 acknowledgements, ACH web-auth, geo blocking, timestamped consent on the order |
| COA / lot plugin | ~15% | CPT, searchable batch archive, lot written onto every order line, lot→customer traceability, client-managed |
| Subscriptions + stacked discounts | ~10% | Volume ladder + subscription discount, both stacking, customer-managed. Not native Woo, and with the free-stack decision we write the engine ourselves — see §5a. |
| Wholesale (Scale Plan) | ~5% | Role, tier pricing, application + approval, PO checkout |
| Shipping, tax, SMTP, SEO, perf, security | ~10% | Each fails silently if skipped |

Everything in the table was sold. None of it is optional.

---

## 1. What exists today (audited, not assumed)

A static-site generator, not a hand-built folder of pages:

```
src/data.js        877 lines — THE catalogue. products, lots, SDS, pricing, brand, research fields
src/layout.js      555 lines — page shell: header, mega menu, footer, age gate
src/pages/*.js    2900 lines — one module per page family
build.js           188 lines — route table → site/*.html, rewrites clean URLs to flat files
public/css/styles.css   2594 lines — ONE global stylesheet, fully tokenised
public/js/*.js     1894 lines — script.js, store.js, catalog.js, forms.js
site/               83 generated pages + 12 COA PDFs + 8 SDS PDFs + images + hero video
```

Facts that shape the port:

- **No CSS collision problem.** One stylesheet, generated markup, `:root` design tokens. The usual
  "three pages all define `.card`" mess does not exist here. Phase 4 of the conversion is therefore
  about stopping the *WordPress theme* bleeding into our CSS, not about merging our own.
- **Commerce is presentation only.** `public/js/store.js` keeps cart, wishlist and the whole order
  flow in `localStorage`. There is no back end. All of it is replaced by WooCommerce.
- **Clean URLs already designed** (`/products/<slug>/`, `/certificates/<lot>/`, `/research/<slug>/`)
  and emitted in canonicals and the sitemap. WooCommerce can be configured to match — see §3.
- **JS binds by `data-*` attribute**, not by structure: `[data-cart-lines]`, `[data-add-to-order]`,
  `[data-size]`, `[data-buymode]`, `[data-validate]`. Every PHP template must emit those attributes
  verbatim or the behaviour dies silently.
- **External origins:** Google Fonts only (Rokkitt + Noto Sans), plus social links and one outbound
  verification link to `bioviridians.com`. No CDN JS, no third-party embeds. Fonts get self-hosted.
- **Structured data is hand-emitted today** — a `Product` JSON-LD block per product page. In
  WordPress the SEO plugin emits its own. Exactly one of them survives (§10).

---

## 2. Route — Hello Elementor child theme, mixed layers

**Decided: Hello Elementor (parent) + `pph-child` (ours) + Elementor Pro + `pph-core` plugin.**

Hello Elementor is the right parent for this job and it is not a compromise: it ships almost no CSS,
which is exactly what a finished 2,594-line stylesheet needs. Nothing to neutralise except
Elementor's own global layer.

**Elementor Pro earns its place on the prose pages and nowhere else.** The reason is the JavaScript.
`public/js/script.js` binds by `data-*` attribute — the mega menu, cart drawer, size picker, purchase
mode, price recalculation, age gate and geo restriction all read attributes that a builder would not
emit. Rebuilding those screens in Elementor breaks them silently.

### Which layer owns which page

| Pages | Owned by | Why |
|---|---|---|
| Shop, category, product single, search, cart, checkout, My Account | **Woo template overrides in `pph-child/woocommerce/`** | Data-driven, and every `data-*` JS contract lives here |
| Home | **Page template in `pph-child`** | Hero carousel, count-up stats, parallax, drawn chromatogram — all JS-bound |
| `/certificates/`, `/certificates/<lot>/`, `/research/`, `/research/<slug>/` | **`pph-core` templates** | Generated from post meta |
| About, Quality, Applications, FAQ, Contact, and the 6 legal pages | **Elementor** | Prose. Juan edits them the way he expects. |
| Header, mega menu, footer | **`pph-child` template parts** | Must be byte-identical across all 83 pages; the mega menu is JS-driven |
| Age gate, geo restriction | **`pph-core`** — not an Elementor popup | Compliance, and it has to survive page caching (§11) |

**Mandatory Phase-4 work regardless:** in Elementor → Site Settings, switch off **Default Colors**
and **Default Fonts** (they are written onto `<body>` with a class selector and out-rank plain
element rules), enable **Improved CSS Loading**, and ship a scoped neutraliser — `.pph a`,
`.pph button` — *before* our component CSS, with the `:hover` variants wrapped in `:where()` so they
contribute zero specificity. No `!important` anywhere. This is how "the buttons went pink" and "the
text disappears on hover" are prevented rather than debugged.

**On the "premium theme licensed in your name" promise:** Hello Elementor is free. The licence that
transfers to Juan at handover is **Elementor Pro**. Say that to him plainly rather than letting him
discover it.

---

## 3. URL map

The static build's URLs are already the URLs we want. Configure WordPress to match so the sitemap,
canonicals and any links the client has shared stay correct.

| Static URL | WordPress | Config needed |
|---|---|---|
| `/` | Front page (static) | Settings → Reading |
| `/products/` | Shop page | Woo → Products → Shop page |
| `/products/category/<slug>/` | Product category archive | Permalinks → category base `products/category` |
| `/products/<slug>/` | Product single | Permalinks → product base `products` |
| `/certificates/` | CPT `pph_coa` archive | `has_archive => 'certificates'` |
| `/certificates/<lot>/` | CPT `pph_coa` single | `rewrite => ['slug' => 'certificates']` |
| `/research/` | Article archive | CPT `pph_article` (keeps native Posts free for a future blog) |
| `/research/<slug>/` | Article single | same rewrite |
| `/cart/` `/checkout/` `/account/` | Woo pages | rename `my-account` → `account` |
| `/orders/` `/orders/<id>/` | Woo My Account → Orders | becomes `/account/orders/` and `/account/view-order/<id>/` — **URL changes**, demo data only |
| `/search/` | Woo product search | template override |
| `/about/` `/contact/` `/faq/` `/quality/` `/applications/` `/wholesale/` `/wholesale/apply/` `/shipping/` `/refunds/` `/chargebacks/` `/terms/` `/privacy/` `/research-use-policy/` | Pages | one per URL |
| `/styleguide/` `/emails/` | **not shipped** | internal references; keep in the repo |

Nothing is live yet, so there is no redirect map to inherit. The one URL that changes is the order
detail page, which only ever held demo data.

---

## 4. Content model — who edits what

The dividing line: **anything the owner will change without us is a post type or a Woo object.
Anything that is page furniture stays in the template.**

| Content | Lives in | Owner edits? |
|---|---|---|
| 25 products, 41 size variations, price, stock, SKU, lot | **Woo variable products** | Yes — Products screen |
| CAS, formula, MW, sequence, form, purity, method, storage, research area, `verify` flag | Product meta (ACF field group or plugin meta box) | Yes |
| SDS PDF per product | Product meta, file field | Yes |
| 12 certificates, one per lot | **CPT `pph_coa`** | Yes — the main thing he was promised |
| 8 research articles | **CPT `pph_article`** | Yes |
| 7 product categories | Woo product categories | Yes |
| About, Quality, Applications, FAQ, Contact copy | Pages, block editor | Yes |
| Terms, Privacy, Shipping, Refunds, Chargebacks, Research-Use Policy | Pages, block editor | Yes (after legal review) |
| Homepage hero slides, stat counters, value-prop tiles | **open decision — see §14, Q3** | TBD |
| Mega menu | WP menu + category query | Yes |
| Footer disclaimer, product disclaimer (exact AllayPay strings) | Plugin constants, single source | **No — locked**, surfaced read-only in settings |
| Phone, address, hours, support email | Plugin settings screen | Yes |
| Research-field dropdown options (8) | Plugin settings | Yes |
| Restricted states | Plugin settings | Yes |

The two mandated disclaimer strings stay in code on purpose. Underwriting checks for them verbatim;
an editable field is an invitation to reword one and fail a review.

---

## 5. Plugin stack

**Free stack only.** Elementor Pro is the one paid licence, and it already exists. Anything a paid
plugin would have done, we build in `pph-core`.

| Purpose | Plugin | Cost | Note |
|---|---|---|---|
| Store | WooCommerce | free | |
| Builder | Elementor + Elementor Pro | existing licence | Prose pages only (§2) |
| Theme | Hello Elementor + `pph-child` | free | |
| **Subscriptions** | **`pph-core` — built by us** | — | **See §5a. This is the one real casualty of the free-stack decision.** |
| Volume pricing | `pph-core` | — | Filter on `woocommerce_product_get_price`. Exactly the agreed ladder, nothing more. |
| Wholesale | `pph-core` | — | Role, tier pricing, application, approval, PO checkout |
| Custom fields | ACF **free** (or hand-rolled meta boxes) | free | Free tier is enough: every spec field is flat, and the lot list is a COA query, not a Repeater (Repeater is Pro-only) |
| SEO | **Yoast free** | free | Schema ownership changes as a result — see §10 |
| Forms | **Contact Form 7** | free | Contact + wholesale application. Its form body is hand-written HTML, so it can emit our exact `.field` / `.input` / `data-validate` markup. Checkout is Woo, not CF7. |
| SMTP | FluentSMTP | free | Transactional mail. Non-negotiable — see §9. |
| Caching | Host's own, or LiteSpeed Cache | free | Must exclude cart/checkout/account and the age-gate JS |
| Backups | UpdraftPlus + host daily | free | Promised in the chat |
| Security | Wordfence free + host firewall | free | Promised in the chat |
| Coming-soon | Elementor Pro Maintenance Mode | existing | Store stays behind it until AllayPay approves |
| Tax | **undecided** | varies | TaxJar is Stripe-owned and he is not on Stripe. Avalara or Woo native — decide with his accountant |
| Payment | **AllayPay — unknown integration** | — | The single biggest open risk. See §7. |

Everything we write ourselves ships in **one plugin, `pph-core`** — never in the theme, so a theme
change cannot take his certificates with it.

### 5a. Subscriptions without WooCommerce Subscriptions

The accepted Scale Plan sold: *"One-time purchase and Subscribe & Save on every product · both
discounts stacked · customer-managed: pause, skip, change quantity, cancel · rules defined for
renewals."* WooCommerce Subscriptions (~$199/yr) is the plugin that normally does that, and it is
out of scope under the free-stack decision.

The honest read: **this was probably always going to be custom work.** Woo Subscriptions renews a
subscription by calling a gateway that implements its tokenisation API. AllayPay almost certainly
does not implement it (§7), so even with the paid plugin we would be writing the AllayPay bridge
ourselves. The free-stack decision removes the scheduler and the My Account UI, not the hard part.

So `pph-core` gets a subscription engine scoped to exactly what was sold — and nothing else:

- Subscription created at checkout, storing the AllayPay payment token
- WP-Cron (backed by a real server cron, not page-view cron) schedules the next charge
- Renewal charges through AllayPay; failure retries on a schedule, then emails and suspends
- My Account → Subscriptions: **pause, skip next, change quantity, cancel**
- Renewal rule: whether a volume break survives a quantity drop — **client must confirm**
- Admin: list, edit next-charge date, cancel, and the payment-health view promised in the plan

**Free alternatives were considered and rejected:** the free tiers of WP Swings and YITH only drive
Stripe and PayPal, which he is not on. Adding one would mean maintaining their gateway bridge
*and* our AllayPay bridge.

**Flag to the client in writing, before phase 9:** if AllayPay cannot tokenise for automatic
rebilling, no subscription engine of any kind can exist and Subscribe & Save becomes a discount code
plus a reminder email. This was already raised with him on 27 Aug — it needs re-confirming, not
assuming.

---

## 6. The custom plugin (`pph-core`)

```
pph-core/
├── pph-core.php              bootstrap, version, activation (flush rewrites)
├── inc/cpt-coa.php           CPT pph_coa + meta: lot, product, purity, net content,
│                             endotoxin, heavy metals, test date, lab, PDF, preview image,
│                             verification URL
├── inc/cpt-article.php       CPT pph_article
├── inc/product-meta.php      CAS, formula, MW, sequence, form, purity, method, storage,
│                             research area, SDS file, verify flag  (+ "On request" rendering)
├── inc/lot-tracking.php      variation → current lot; writes lot onto each order line item;
│                             admin report: lot → orders → customers
├── inc/pricing.php           volume ladder + subscription discount, stacked
├── inc/wholesale.php         role, tier pricing, application → pending → approve, PO checkout
├── inc/compliance.php        age gate, geo restriction at cart, checkout fields,
│                             acknowledgement capture with timestamp into order meta
├── inc/settings.php          contact details, research fields, restricted states, thresholds
├── templates/                markup lifted from the static build, byte-for-byte where possible
└── assets/                   nothing — CSS and JS stay in the child theme, one file each
```

**The rule that keeps the design intact:** each template is built from the prototype's own HTML, then
the rendered output is diffed against the static page. Not "looks close" — diffed.

### Lot traceability, in detail (this is the promised feature)

1. Each certificate is a `pph_coa` post keyed by lot number.
2. Each product variation carries a **current lot** field.
3. On `woocommerce_checkout_create_order_line_item`, the variation's current lot is copied onto the
   line item as order meta. It is a snapshot — later lot changes must not rewrite history.
4. Admin screen: enter a lot, get every order and customer that received it.
5. The client uploads a new COA and sets it as current on the variation. No developer.

---

## 7. Payment — the biggest unknown

AllayPay is primary, with SeamlessChex or PayRam as the second rail so a pause is a settings change.
ACH recurring is confirmed possible by AllayPay (chat, 28 Aug).

**What we do not yet know, and must, before we can size this work:**

- Does AllayPay ship a WooCommerce plugin?
- If not, what are their rails? Most high-risk ACH processors run on **NMI** or **Authorize.Net** —
  if so, an off-the-shelf Woo gateway exists and this is configuration.
- If it is a bespoke API, we write a `WC_Payment_Gateway` subclass **plus** the
  `WC_Subscriptions` tokenisation hooks. That is materially more work than the plugin path.
- Does their tokenisation support automatic rebilling? If not, Subscribe & Save degrades to a
  discount code plus a reminder email — which was flagged to the client on 27 Aug and must be
  re-flagged, not quietly shipped.

**Sequencing trap, already identified in the chat:** AllayPay want to see a finished site before they
underwrite; we want the gateway before we can finish. Resolution stands — build to completion behind
the coming-soon page, submit, flip one switch on approval day.

---

## 8. WooCommerce configuration

- **Products:** variable, one variation per size. Variation carries price, stock state, SKU, lot.
- **Stock:** `in-stock` / `backorder` per the inventory sheet. Backorder variations allow backorder,
  display the badge.
- **Guest checkout: OFF.** AllayPay require an account; the static build already removed every guest
  path. *Note the conflict:* the 27 Aug scope said "guest checkout, streamlined." AllayPay's rule
  overrides it. Confirm with the client in writing so it is not a surprise at review.
- **Checkout fields:** email, password, name, **company/institution (required)**, **research field
  (required, 8 options)**, shipping, billing, "ordering against a purchase order" (wholesale),
  ACH fields (name, routing 9-digit, account, type).
- **Acknowledgements — never pre-ticked, all required:** research-use-only, 21+, terms.
  Each captured with a UTC timestamp into order meta and printed on the admin order screen.
- **ACH web authorisation:** AllayPay's verbatim text with its own checkbox, rendered immediately
  above Place Order. Do not reword. Also lives at `/terms/#ach`.
- **Age gate:** 21+, before entry, on every page. Must survive page caching — see §11.
- **Geographic restriction:** blocked states enforced at cart, not only at checkout.
- **Emails:** branded order, shipping and receipt templates carrying the footer disclaimer.

---

## 9. Forms and email deliverability

| Form | Destination |
|---|---|
| Contact | support inbox, `Reply-To` set to the sender |
| Wholesale application | admin + creates a pending wholesale account |
| Account creation | Woo native |
| Checkout | Woo native |

PHP `mail()` is unsigned and gets dropped with no error visible anywhere on the site. Configure real
SMTP (FluentSMTP + a transactional provider), then **SPF, DKIM and DMARC on the sending domain**, and
send a test to Gmail, Outlook and one institutional address before launch.

**Blocked:** sender domain and mailbox not yet chosen by the client.

---

## 10. SEO and schema

Yes, in scope — the chat sold titles, meta descriptions, clean URLs, heading hierarchy, product
schema, image alt and compression.

- **Yoast free.** Titles and meta descriptions ported from the static build — they already exist per
  page and are good.
- **Schema has exactly one owner, and with this stack it is WooCommerce.** WooCommerce core emits
  valid `Product` JSON-LD natively. Yoast free emits the `Organization` / `WebSite` / `BreadcrumbList`
  graph. So:
  - **Delete the hand-written `Product` JSON-LD** from our product template. Do not port it.
  - Let Woo own `Product`; let Yoast own everything else.
  - `pph-core` adds lot and COA properties into Woo's product structured data via
    `woocommerce_structured_data_product` — into the existing entity, never as a second block.
  - *Known limitation of the free stack:* Yoast WooCommerce SEO ($99/yr, not approved) is the addon
    that merges Woo's product node into Yoast's `@graph`. Without it the page carries two separate
    valid JSON-LD blocks. Google accepts that; it simply does not link the entities. Acceptable —
    but two `Product` entities would not be, which is why the hand-written one has to go.
- **Staging hygiene** (we build on our own server): staging stays `noindex` + HTTP-auth for its whole
  life. At migration, search-replace the staging host → `https://purelypeptideshub.com`, then
  re-check canonicals, the sitemap, Woo's structured data and every image `src`. The domain is
  hardcoded in exactly one place — canonicals — so this is a known, finite job.
- `sitemap.xml` and `robots.txt` handed to Yoast (delete the static ones).
- OG images per page type.
- **Coming-soon + `noindex` until AllayPay approve.** Then index, submit sitemap, verify in Search
  Console. Getting this backwards indexes a store that cannot take payment.

---

## 11. Performance and accessibility

The static build verified clean at 320/400/768/1024/1440px, no console errors, one `<h1>` per page,
no heading skips, no missing `alt`. **The port must not regress any of it** — re-run every check
against the WordPress output, not against the static folder.

- Self-host Rokkitt and Noto Sans; `font-display: swap`; preload the two weights actually used.
  Switch **Elementor → Google Fonts loading off** so it does not fetch a second copy.
- Elementor housekeeping: Improved CSS Loading on, unused experiments and widgets off, eicons not
  enqueued on pages with no Elementor content. Elementor's assets are the main new weight this port
  adds to a build that currently loads one stylesheet and four scripts.
- Hero video (`hero-lab.mp4`) stays `preload="none"` with a poster, and respects
  `prefers-reduced-motion` as it does today.
- One enqueued stylesheet, one script bundle, both cache-busted with `filemtime()`.
- **Cache exclusions:** cart, checkout, My Account, and any page whose age gate or geo-restriction JS
  must run. Optimiser plugins that defer or combine inline JS break this class of feature *for
  logged-out visitors only* — which is every real customer, and nobody on the build team.
- Images to WebP with JPEG fallback; explicit width/height to hold CLS.
- Keep the existing focus rings, the `:where()`-scoped hover rules and the status-colour + glyph
  pairing. They are already correct; the risk is a theme overwriting them.

---

## 12. Shipping and tax

| Item | Status |
|---|---|
| Weight/dimension based rates | **Blocked** — no weights or box dimensions supplied |
| Free shipping threshold | Assumed $250 — confirm |
| Restricted destinations at cart | Currently CA / NY / LA — confirm |
| Cold-pack surcharge + ship-day cut-offs | Assumed — confirm whether cold handling is needed at all |
| International zones | Built, switched **off** until labelling is ready (as sold) |
| US destination-based sales tax | Service undecided. TaxJar is Stripe-owned and he is not on Stripe. Avalara or Woo native. |
| Nexus states | **Blocked** — per his accountant |

---

## 13. Build order

| Phase | Work | Depends on |
|---|---|---|
| 0 | Staging server: WP, Woo, Hello Elementor, Elementor Pro, `noindex` + HTTP-auth | — |
| 1 | `pph-child`: CSS/JS ported and enqueued, Elementor global colours/fonts disabled, scoped neutraliser, chrome (header, mega menu, footer) | 0 |
| 2 | Static pages in Elementor: about, quality, applications, FAQ, contact, 6 legal | 1 |
| 3 | `pph-core` plugin: CPTs, product meta, settings | — |
| 4 | Products imported from `src/data.js` → WP-CLI import script, variations, meta, images | **prices** |
| 5 | Product + category + search templates, spec table, COA panel, purchase-mode block | 3, 4 |
| 6 | Certificates: 12 COAs, PDFs, previews, searchable batch archive | 3 |
| 7 | Research articles ×8 | 3 |
| 8 | Cart, checkout, compliance layer, acknowledgements, geo blocking | 4 |
| 9 | Pricing: volume ladder, then the `pph-core` subscription engine (§5a), stacked | 8, **AllayPay tokenisation confirmed** |
| 10 | Wholesale: role, tiers, application, approval, PO checkout | 8 |
| 11 | Shipping + tax | weights, nexus |
| 12 | Forms, SMTP, branded emails, SPF/DKIM/DMARC | sender domain |
| 13 | SEO, schema, sitemap, coming-soon + noindex | 5 |
| 14 | Performance, caching + exclusions, security, backups | all |
| 15 | Gateway integration + live test transactions | **AllayPay approval** |
| 16 | **Migration**: staging → his hosting, search-replace, SSL, permalinks flushed, re-verify | hosting credentials |
| 17 | Verification pass, handover docs, recorded walkthrough, ownership transfer | all |

Phases 0–3 and 6–7 can start today. Phase 4 onward needs prices. Phases 9 and 15 need AllayPay.
Phase 16 needs his hosting credentials, which we do not have.

---

## 14. Decisions — settled 14 Sept 2026

| Decision | Settled as |
|---|---|
| Stack | Hello Elementor + `pph-child` + Elementor Pro + WooCommerce + `pph-core` |
| SEO | Yoast (free) |
| Forms | Contact Form 7, where a form is actually needed |
| Build location | **Staging on our own server**, migrate to his hosting at handover |
| Owner-editable scope | **Baseline** — products, COAs, articles, pages. Homepage furniture, mega menu and footer stay in the template. |
| Paid plugins | **None.** Elementor Pro is the only licence, and it already exists. Build custom where the use case requires it. |

Consequences already folded into this plan: the subscription engine becomes ours (§5a), schema
ownership moves to WooCommerce (§10), and go-live becomes a migration rather than a switch (§13).

Still open, and not ours to settle:

1. **AllayPay's integration path** (§7) — sizes both the gateway and the subscription work.
2. **Tax service** — Avalara vs WooCommerce native, with his accountant.

## 15. Blocked on the client

Carried from `STATUS.md`, unchanged, all still outstanding:

**Blocking launch**
- **Prices — never supplied, for any SKU.** One table in `src/data.js` keyed `slug|size`; the build
  throws if any size is unpriced, so none can be missed. Nothing else moves without this.
- Business details: real phone, address. AllayPay require two real forms of contact published.
- Legal entity name + registered state (the governing-law clause reads `[to be confirmed]`).
- Hosting credentials (cPanel or equivalent) and the registrar for purelypeptideshub.com.
- Product photography, or the vial label artwork to composite.
- Per-size weights and box dimensions, for the shipping table.

**Needed before launch**
- Confirm the discount percentages (volume assumed −8% at 5, −16% at 10; subscription assumed −10%;
  both stack) and whether a volume break survives a quantity drop at renewal.
- Shipping: carrier + account, real rates, cold-pack requirement and surcharge, ship-day cut-offs,
  free-shipping threshold.
- Restricted states — confirm CA / NY / LA.
- Sales tax: nexus states, and which tax service.
- Wholesale: pricing tiers, minimum order, approval criteria, application fields.
- Email sender domain and SMTP provider.
- Analytics: GA4, Search Console, Meta Pixel — wanted or not.
- About page content; facility photographs if any.

**Documents**
- Certificates for the remaining **15 of 25 products**, and safety data sheets for **17 of 25**
  (TB-500 and NAD+ are stocked and selling with no SDS — prioritise those two).
  AllayPay require a lab report online for every product. If they will not accept the honest
  "Lab report pending" badge, ship documented products only — the build already supports it
  (`ONLY_DOCUMENTED=1 node build.js` → 10 products, 5 categories).
- `BP5-0318.pdf` prints batch `BP10-0318` in its header while naming the 5 mg sample. Reissue.
- The NAD+ certificate is addressed to **Ion Peptide** and the vial in its photograph carries that
  label. Publishing it names his supplier — confirm he is comfortable with that.

**Legal review** — `/terms/`, `/privacy/`, `/refunds/`, `/chargebacks/`, `/research-use-policy/`.
The ACH sections of the terms are AllayPay's template and must **not** be reworded.

**Payment processor** — application status, gateway credentials on approval, reserve terms, and the
~$1,500 legal opinion letter, plus the supporting documents he still owes them.

---

## 16. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| AllayPay ships no Woo plugin and no NMI/Authorize.Net rail | Custom gateway + subscription tokenisation — days, not hours | Ask AllayPay for integration docs **now**, before phase 15 |
| AllayPay cannot tokenise for automatic rebilling | Subscribe & Save is not a subscription, and §5a's engine cannot exist | Already flagged to the client 27 Aug; re-confirm in writing before building phase 9 |
| Custom subscription engine under-scoped | Renewals silently stop, or double-charge | Build only the four sold actions; idempotent charge keys; a failed-renewal report the client can see |
| Prices never arrive | Nothing ships | One table, one edit. Escalate as the single blocking item. |
| Elementor global colours/fonts left on | "The buttons went pink" three weeks after handover | Disabled in phase 1, plus the scoped neutraliser before any component CSS |
| Elementor loads its own fonts/icons/CSS on every page | PageSpeed regression against a build that is currently clean | Disable Google Fonts loading and unused Elementor features; Improved CSS Loading on; re-run PageSpeed against the WP output |
| Cache plugin breaks the age gate for logged-out visitors only | Compliance failure invisible to us | Test every pass in a logged-out incognito window with caches purged |
| Duplicate `Product` schema | Search Console errors | One schema owner, decided in phase 13 |
| AllayPay reject on the 15 undocumented products | Launch delay | The `ONLY_DOCUMENTED` build mode already exists as the fallback |

---

## 17. Deliverables at handover

```
wordpress/
├── themes/pph-child/         style.css, functions.php, woocommerce/ overrides, assets/  (parent: Hello Elementor)
├── plugins/pph-core/         the content + compliance plugin  + pph-core.zip
├── tests/check.py            the project's static checks, run against the WP output
├── README-WORDPRESS.md       install order, CSS architecture, what lives where
├── OWNER-HANDOFF.md          wp-admin, task by task, no jargon
├── GO-LIVE.md                launch checklist in order, with the rollback
├── FORMS.md  SEO.md          system docs
└── TROUBLESHOOTING.md        symptom → cause → fix, grown during the build
```

Plus, as sold: recorded walkthrough (adding products, editing prices, uploading COAs, processing
orders), written admin guide, and full ownership transfer — hosting, domain, theme licence in his
name.

---

## 18. One thing to deal with outside this plan

`mdnjuan.pdf` is **still tracked in git** and the remote is
`github.com/varun-s20/purely-peptides-wordpress`. It contains the client's full name and email
address, the AllayPay merchant-account correspondence, the pricing negotiation and the fact that
payment had not cleared. `.gitignore` was added, but gitignore does not untrack what is already
committed.

If that repository is public, this needs fixing before anything else: make it private, or purge the
file from history and force-push. Both are destructive and need a decision.
