# Purely Peptides Hub — build status

**Project:** Research-materials storefront for purelypeptideshub.com (Digital Heroes × mdnjuan / Juan Medina)
**Last updated:** 12 September 2026
**Current state:** 83 pages · 25 products · 41 size-SKUs · 12 certificates · 8 safety data sheets
**Preview:** `npm start` → http://localhost:4173

---

## 0. Act on this first

- [ ] **`mdnjuan.pdf` is committed to a PUBLIC GitHub repo** (`varun-s20/purely-peptides-wordpress`).
      It contains the client's full name and gmail address, the AllayPay merchant-account
      correspondence, the pricing negotiation, and the fact that payment has not cleared.
      Fix by **making the repo private** or **purging the file from git history and force-pushing**.
      Both are destructive — needs a decision, not a default.
- [x] `.gitignore` added so `mdnjuan/` and `mdnjuan.pdf` cannot be re-committed.
      *(gitignore does not untrack what is already committed — the item above still stands.)*

---

## 1. Brand and identity — DONE

- [x] Renamed throughout: **Purely Peptides** → **Purely Peptides Hub**
- [x] Domain corrected: `purelypeptides.com` → **`purelypeptideshub.com`** (canonicals, sitemap, robots, JSON-LD, emails)
- [x] Stale `veridianbio.com` references removed from sitemap and robots
- [x] Logo mark wired into header, age gate and favicon (`public/img/brand/`)
- [x] Full colour lockup used on the dark footer, where it works as supplied
- [x] Palette swapped to the logo's colours: cyan `#1DAFCB`, lime `#C7E119`, ink `#051214`
- [x] WCAG-safe text companions derived: `--teal-deep #0E7B90` (4.9:1), `--orange-text #5F6E07` (5.7:1)
- [x] `package.json` / `serve.js` renamed off the old project name

**Known limitation:** every variant in the Design.com pack is built for a dark background —
"PURELY" is white in all of them, so the lockup vanishes on a light ground. The header therefore
uses the icon as artwork with the wordmark set in type.

- [ ] **Request from client:** a light-background lockup with dark text, from Design.com

---

## 2. Catalogue — DONE

- [x] All **25 products / 41 size-SKUs** entered from `Copy of Inventory of Peptides.xlsx`
- [x] Per-size stock state and lot number, exactly as the sheet records them
- [x] Old placeholder catalogue (20 invented products) removed entirely
- [x] Taxonomy rebuilt around the real catalogue, with no claim-implying category names:

| Category | Products |
|---|---|
| Metabolic Research | 7 |
| Cell Signalling Research | 5 |
| Growth Factor Research | 4 |
| Melanocortin Research | 3 |
| Blends | 3 |
| Cognitive Research | 2 |
| Cofactors & Nucleotides | 1 |

- [x] CAS / formula / molecular weight taken from the supplied SDS for the 8 compounds that have one
- [x] Specifications with no supporting document render **"On request"**, never an invented number
- [x] Demo order history and homepage examples rebuilt on real products and lots

**Rendering as "On request" until the supplier confirms:**

- [ ] Cagrilintide — CAS, formula, MW
- [ ] 5-Amino-1MQ — CAS, formula, MW
- [ ] Cartalax — CAS, formula, MW

---

## 3. Documents — DONE

- [x] 12 certificates served as real files from `site/doc/coa/`
- [x] 8 safety data sheets served from `site/doc/sds/`, linked from the product spec table
- [x] Each certificate page transcribes the measured values **and** shows page one of the issued document
- [x] First-page previews rendered to `doc/coa/preview/` — an `<object>` PDF renders as a blank box
      on most phones and cannot be feature-detected from CSS
- [x] **Lab attribution corrected:** Bioviridian Inc. performed and signed 11 of the analyses;
      *American Peptides* is the vendor named on those documents, not the testing laboratory
- [x] Bioviridian's verification lookup linked from every certificate they issued
- [x] NAD+ certificate attributed to Freedom Diagnostics
- [x] Lots with no certificate get **no certificate page** — one would certify nothing
- [x] Products with no certificate show an honest *"Lab report pending"* badge

**Issues found in the client's own documents:**

- [ ] **`BP5-0318.pdf` prints batch number `BP10-0318`** in its header while naming the 5 mg sample.
      A note appears on that lot's page. Ask the supplier to reissue.
- [ ] **NAD+ certificate is addressed to "Ion Peptide"** and the vial photograph carries that label.
      Publishing it names the client's supplier — confirm he is comfortable with that.

---

## 4. AllayPay compliance — DONE except one item

Every rule below is a condition of the merchant account, not a preference.

- [x] **21+** age verification popup before entering the site *(was 18)* — 83/83 pages
- [x] **Guest checkout removed.** An account is required; no guest path exists
- [x] Research-field dropdown at checkout, required — 8 options from their list
- [x] Company / institution name required on every order
- [x] Research-use acknowledgement, never pre-ticked
- [x] ACH web-authorisation text reproduced verbatim, with its tick **immediately before Place Order**
- [x] Payment switched from card fields to **ACH / e-check** (routing, account, type)
- [x] Per-product disclaimer, exact wording — **25/25 product pages**
- [x] Footer disclaimer, exact wording — **83/83 pages**
- [x] **Chargeback Policy** page created (`/chargebacks/`)
- [x] **Refund and Returns Policy** page created (`/refunds/`)
- [x] ACH authorisation and micro-entry clauses added to the terms (`/terms/#ach`)
- [x] Image, description and price on every product — 25/25
- [x] Two forms of contact published (footer + `/contact/`)
- [x] Copy swept for health / weight-loss / dosage / cycle / stack / testimonial claims — clean
- [x] FAQ answer "you can order as a guest" corrected

### The one requirement not fully met

AllayPay require **a lab report available online for each product**. The client supplied
certificates covering **10 of 25 products**.

- [ ] **Obtain certificates for the remaining 15 products** (list below), *or*
- [ ] **Ship documented products only** — already supported, no rewriting needed:
      ```bash
      ONLY_DOCUMENTED=1 node build.js   # 65 pages, 10 products, 5 categories
      ```

**No certificate (15):** Cagrilintide · MOTS-c · 5-Amino-1MQ · Ipamorelin · CJC-1295 ·
KPV · Cartalax · Selank · Semax · Melanotan-I · Melanotan-II · Kisspeptin-10 · GLOW · KLOW ·
BPC-157/TB-500 blend

**Lots in inventory with no certificate (4):** SEMA5-0616 · NAD500-0803 · NAD1000-0803 · BPCTB20-0318

**No safety data sheet (17):** Cagrilintide · MOTS-c · 5-Amino-1MQ · Ipamorelin · CJC-1295 ·
**TB-500** · KPV · Cartalax · Selank · Semax · Melanotan-I · Melanotan-II · Kisspeptin-10 ·
**NAD+** · GLOW · KLOW · BPC-157/TB-500 blend
*(TB-500 and NAD+ are stocked and selling without one — prioritise those two.)*

---

## 5. Bugs found and fixed — DONE

- [x] `.check > span { display:flex }` shredded every prose checkbox label into columns — this
      broke the entire checkout acknowledgement block. Now `display:block`, with the two-up layout
      scoped to rows that actually carry a count badge
- [x] Inline `<object>` PDF rendered as a blank box — replaced with rendered previews + link
- [x] Product pages printed "Metabolic Research · Metabolic Research" — research area renamed to *Metabolism*
- [x] Purity field restated its own method ("≥ 99% (RP-HPLC) - RP-HPLC / MALDI-MS")
- [x] Masthead wordmark wrapped mid-name to "PurelyPeptides / Hub"
- [x] Drawn chromatogram was presented as measured data — now labelled
      *"Schematic · measured trace is in the certificate"*
- [x] Heading-level skips (h1→h3) in the cart, checkout and certificate empty states
- [x] Invented despatch location ("Massachusetts") replaced with "our US facility"
- [x] Preview server had no MIME types for PDF/JPG/PNG — certificates would not open locally

---

## 6. Verification — DONE

| Check | Result |
|---|---|
| Build | 83 pages, **0 unresolved internal links** |
| Horizontal overflow @ 320 / 400 / 768 / 1024 / 1440 px | **none**, across 16 representative pages |
| JavaScript console errors | **none** |
| One `<h1>` per page, no heading-level skips | **83/83 clean** |
| Images without `alt`, unlabelled fields, controls with no accessible name | **none** |
| Banned-claim sweep | **clean** — only hits are "freeze-thaw cycles", a breakpoint note, and our own clause prohibiting sale to weight-loss clinics |
| Stale brand / colour / domain sweep in output | **clean** |
| Both build modes (full and `ONLY_DOCUMENTED=1`) | both build with 0 unresolved links |

---

## 7. Pending — blocked on the client

### Blocking launch

- [ ] **PRICES.** Never supplied, for any SKU. Every figure is a placeholder in the `PRICING`
      table at the top of `src/data.js`, keyed `slug|size`. **That table is the only thing to edit** —
      the build throws if a size has no price, so none can be missed.
- [ ] **Business details.** Currently obvious placeholders: phone `+1 (000) 000-0000`,
      "Address line 1", "City, State ZIP". AllayPay require two real forms of contact on the site.
- [ ] **Legal entity name** and **registered state** — the governing-law clause reads `[to be confirmed]`
- [ ] **Hosting and domain access** — cPanel (or equivalent) and the registrar for purelypeptideshub.com
- [ ] **Product photography**, or the vial label artwork so we can composite it. The site currently
      uses generic studio vial shots; the only labelled vials on the site are in the client's own COAs
- [ ] **Weights and box dimensions per size** — needed for the shipping rate table

### Needed before launch, not blocking build

- [ ] **Discount percentages.** Volume ladder is assumed at −8% (5+) and −16% (10+); subscription
      assumed at −10%. Both stack, as agreed. Confirm the real numbers, and whether the volume break
      survives a quantity drop at renewal
- [ ] **Shipping.** Carrier and account, real rates, cold-pack requirement + surcharge + ship-day
      cut-offs, free-shipping threshold (assumed $250)
- [ ] **Restricted states.** Currently CA / NY / LA — confirm, add or remove
- [ ] **Sales tax.** Nexus states per his accountant. Tax service still unchosen — note TaxJar is
      Stripe-owned and he is not on Stripe; Avalara or WooCommerce native are the alternatives
- [ ] **Wholesale programme.** Pricing tiers, minimum order, approval criteria, application fields
- [ ] **Email sender domain / SMTP** for transactional mail
- [ ] **Analytics** — GA4, Search Console, Meta Pixel: wanted or not
- [ ] **About page content** — company background, facility photographs if he has them

### Legal review

- [ ] `/terms/` — ACH sections are AllayPay's template and must **not** be reworded; the rest needs counsel
- [ ] `/privacy/` — marked as awaiting review on the page
- [ ] `/refunds/` — return window, restocking terms and refund method are drafting defaults
- [ ] `/chargebacks/` — needs review alongside the terms
- [ ] `/research-use-policy/` — substantive, but should still be reviewed

### Payment processor

- [ ] AllayPay application status — he was completing it; the finished site is what they need to underwrite
- [ ] Gateway credentials once approved
- [ ] Reserve terms and the **$1,500 legal opinion letter** — determined after underwriting
- [ ] Supporting documents he still owes them: driver's licence, voided cheque or bank letter,
      articles of incorporation, address verification, 3 months processing history,
      3 months bank statements, operating agreement (if >1 owner at 25%+)

---

## 8. Pending — our side, once the above lands

- [ ] Replace the `PRICING` table with real prices
- [ ] Fill `brand` in `src/data.js` with real contact and address details
- [ ] Port to **WordPress + WooCommerce** on his hosting (the agreed stack — the current build is the
      complete front end; markup already follows WooCommerce conventions so templates map directly)
- [ ] Wire the AllayPay gateway and run live test transactions end to end
- [ ] Configure Subscribe & Save against the gateway — AllayPay confirmed ACH recurring is supported
- [ ] Build the real shipping rate table and tax configuration
- [ ] Recorded walkthrough: adding products, editing prices, uploading COAs, processing orders
- [ ] Written admin guide
- [ ] Hand over ownership: hosting, domain, theme licence in his name
- [ ] Keep the store behind the coming-soon page until AllayPay approves, then flip one switch

---

## 9. Not started / out of scope so far

- [ ] Cart, checkout, account and wholesale application are **presentation only** — no back end
- [ ] Search is client-side over the built catalogue; no server-side search
- [ ] No CMS — content is generated from `src/data.js` until the WordPress port
