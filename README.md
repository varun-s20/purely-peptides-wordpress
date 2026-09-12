# Purely Peptides Hub

A research-materials storefront for **purelypeptideshub.com**, built from the client's own
inventory sheet, certificates of analysis, safety data sheets, brand assets and payment-processor
requirements. Plain HTML, CSS and JavaScript — no framework, no dependencies, nothing to install
to view it.

**To look at it: open `site/index.html` in a browser.** That is the whole website; every page links
to every other page from the file system, no server required.

```bash
npm start     # rebuild + serve at http://localhost:4173  (needed to view the PDFs)
npm run build # regenerate site/ only
```

83 pages · 25 products · 12 certificates · 8 safety data sheets.

---

## Where the content came from

Every value on the site traces to a document the client supplied. Nothing about the materials is
invented.

| Content | Source document |
|---|---|
| Products, sizes, stock levels, lot numbers | `Copy of Inventory of Peptides.xlsx` |
| CAS number, molecular formula, molecular weight | American Peptides SDS, rev 1.0, 6 Jul 2026 (8 compounds) |
| Lot purity, net content, endotoxin, heavy metals, test dates | The 12 certificates of analysis |
| Logo, wordmark, brand colours | `Purely Peptides Hub/` Design.com export |
| Age gate, checkout rules, disclaimers, T&C wording | AllayPay ACH checklist + web-authorisation template |

`src/data.js` is the single source. Adding a product is one entry there — the product page,
category listing, mega-menu counts, search index and sitemap all follow.

### Specifications we could not evidence

Four materials have no supplier document, so their identity fields render **"On request"** rather
than a number we cannot stand behind. They carry `verify: true` in `src/data.js`:

**Cagrilintide · 5-Amino-1MQ · Cartalax** — plus the three blends, which are mixtures.

Ask the supplier for CAS, formula and molecular weight, then drop the flag.

---

## Payment processor compliance

AllayPay's research-use-only rules are conditions of the merchant account, not preferences. Each
one is implemented and verified in the built HTML:

| Requirement | Where it lives | Verified |
|---|---|---|
| 21+ age verification popup before entering | `src/layout.js` age gate | 83/83 pages |
| Account required, **guest checkout not acceptable** | `src/pages/commerce.js` | no guest path exists |
| Research-field dropdown at checkout | `researchFields` in `src/data.js` | 8 options, required |
| Company / institution name required | checkout account step | required field |
| Research-use acknowledgement, never pre-ticked | checkout acknowledgements | 3 required boxes |
| ACH web-authorisation text + tick immediately before Place Order | `/terms/#ach` and checkout | verbatim from their template |
| Per-product disclaimer, exact wording | `brand.productDisclaimer` | 25/25 product pages |
| Footer disclaimer, exact wording | `brand.footerDisclaimer` | 83/83 pages |
| Terms, Privacy, Shipping, Refund, Returns, **Chargeback** | `/terms/` `/privacy/` `/shipping/` `/refunds/` `/chargebacks/` | all published and linked |
| Image, description and price on every product | product template | 25/25 |
| Two forms of contact | footer + `/contact/` | email and phone |
| No health, weight-loss, dosage, cycle or testimonial claims | copy rules below | swept, clean |

The two exact strings are held once in `src/data.js` and must not be reworded — underwriting checks
for them verbatim.

### The one requirement not fully met

AllayPay require **a lab report available online for each product**. The client supplied 12
certificates covering **10 of the 25 products**. The other 15 are listed honestly with a
*"Lab report pending"* badge rather than a badge claiming documentation that does not exist.

If underwriting will not accept that, ship only the documented products — no rewriting needed:

```bash
ONLY_DOCUMENTED=1 node build.js   # 65 pages, 10 products, 5 categories
```

The filter lives in `src/data.js` so the nav, counts, search and listings all follow from one
place and cannot disagree.

**Missing documentation, by product:** Cagrilintide · MOTS-c · 5-Amino-1MQ · Ipamorelin ·
CJC-1295 · KPV · Cartalax · Selank · Semax · Melanotan-I · Melanotan-II · Kisspeptin-10 ·
GLOW · KLOW · BPC-157/TB-500 blend.

**Lots in inventory with no certificate:** SEMA5-0616, NAD500-0803, NAD1000-0803, BPCTB20-0318.
These appear in a "lots awaiting documentation" list on the product page and get no certificate
page — a certificate page for a lot with no document would certify nothing.

---

## Certificates

The certificates are the client's real documents, served from `site/doc/coa/`. Each certificate
page transcribes the measured values into an accessible table **and** shows page one of the issued
document, with the full file one click away.

Two laboratories appear, and the distinction matters:

- **Bioviridian Inc.** performed and signed 11 of the analyses (`bioviridians.com/coa-search.html`
  is linked for independent verification). *American Peptides* is the vendor named on those
  documents, not the testing lab — the site attributes the testing correctly.
- **Freedom Diagnostics** issued the NAD+ certificate, addressed to *Ion Peptide*.

The certificate is shown as a rendered first-page image (`doc/coa/preview/`) rather than an
embedded PDF viewer. An `<object>` PDF renders as a blank box wherever the browser has no inline
viewer — most phones — and there is no way to detect that from CSS. Regenerate the previews if the
source documents change:

```bash
python -c "import fitz,glob,os;[fitz.open(f)[0].get_pixmap(dpi=120).pil_save(f'public/doc/coa/preview/{os.path.basename(f)[:-4]}.jpg',format='JPEG',quality=78) for f in glob.glob('public/doc/coa/*.pdf')]"
```

### Three problems in the supplied documents

1. **`BP5-0318.pdf` prints batch number `BP10-0318`** in its header while naming the 5 mg sample.
   The site carries a note on that lot's page. The supplier should reissue it.
2. **Only 8 of 25 products have a safety data sheet.** TB-500 and NAD+ are stocked and selling
   without one.
3. The NAD+ certificate is addressed to **Ion Peptide** and the vial in its photograph carries that
   label. Publishing it names the client's supplier — confirm they are happy with that before launch.

---

## Design

**Palette.** Taken from the supplied logo: cyan `#1DAFCB` and lime `#C7E119` over near-black
`#051214`. Cyan carries interaction, lime carries the single call to action on a screen.

Neither brand colour clears 4.5:1 as text on paper — cyan reads 2.7:1 and lime 1.5:1 — so each has
a darkened companion used wherever the accent has to be *words* (`--teal-deep` #0E7B90 at 4.9:1,
`--orange-text` #5F6E07 at 5.7:1), while the bright values stay for fills, rules and arrows. Lime
buttons set ink on lime rather than white on lime. Status colour is always paired with a glyph and
a word, so meaning survives greyscale and print.

**The logo.** Every variant in the supplied pack is built for a dark background — "PURELY" is
white in all of them and the grayscale version is light grey, so the lockup disappears on a light
ground. The header therefore uses the icon as artwork with the wordmark set in type; the dark
footer uses the supplied full-colour lockup as-is. **A light-background lockup with dark text is
worth requesting from Design.com.**

**Typography.** Rokkitt for every heading and nothing else; Noto Sans for everything else,
including data, using its tabular figures so lot numbers align in a column.

**The one bold move.** The drawn chromatogram is the recurring motif — but on product pages it is
now labelled *"Schematic · measured trace is in the certificate"*. Drawing a trace and presenting
it as data would be a lie on a site whose whole argument is that the data is real.

---

## Structure

```
site/                 ← THE WEBSITE. Open site/index.html.

build.js              route table + link rewriting → site/
serve.js              optional local server
public/                 copied to site/ verbatim
  css/styles.css      the global stylesheet
  js/                 store, catalog, script, forms
  img/brand/          logo mark, dark lockup, favicon
  doc/coa/            the client's certificates + rendered previews
  doc/sds/            the client's safety data sheets
src/                  page generator (not shipped)
  data.js             catalogue, lots, SDS, brand, pricing  ← the file to edit
  art.js              photo wiring, drawn figures, icon set
  layout.js           page shell: header, mega menu, footer, age gate
  components.js       cards, rows, tables, badges
  pages/              one module per page family
```

The build fails loudly if any internal link points at a page that does not exist, so dead links
cannot ship.

---

## Verification run

| Check | Result |
|---|---|
| Build | 83 pages, 0 unresolved links |
| Horizontal overflow, 320 / 400 / 768 / 1024 / 1440 px | none, across 16 representative pages |
| JavaScript console errors | none |
| One `<h1>` per page, no heading-level skips | 83/83 clean |
| Images without `alt`, unlabelled fields, controls with no accessible name | none |
| Banned-claim sweep (health, weight-loss, dosage, cycles, stacks, testimonials) | clean — the only hits are "freeze-thaw cycles", a breakpoint note, and our own clause prohibiting sale to weight-loss clinics |

---

## Before this goes live

1. **Prices.** *The client has never supplied any.* Every figure is a placeholder in the `PRICING`
   block at the top of `src/data.js`, keyed `slug|size`, so the whole catalogue can be priced by
   editing one table. **Nothing else in the file needs touching.** The build throws if a size has
   no price, so none can be missed.
2. **Business details.** `brand` in `src/data.js` carries `+1 (000) 000-0000` and "Address line 1"
   as deliberately obvious placeholders. AllayPay require two real forms of contact on the site.
3. **Legal review.** `/terms/`, `/privacy/`, `/refunds/` and `/chargebacks/` are marked as awaiting
   review on the page itself. The ACH sections of the terms are reproduced from AllayPay's template
   and should not be reworded; the rest needs counsel. The governing-law state is `[to be confirmed]`.
4. **Missing documentation.** 15 products have no certificate and 17 have no SDS — see above.
5. **Shipping and tax.** Rates, the cold-pack surcharge, ship-day cut-offs and the free-shipping
   threshold ($250) are assumptions. Restricted states are currently CA, NY and LA — confirm.
   Nexus states and the tax service (TaxJar is Stripe-owned; AllayPay is not Stripe) are unset.
6. **Discounts.** The volume ladder (−8% at 5, −16% at 10) and the −10% subscription rate implement
   "both stacked" as agreed, but the exact percentages are assumed.
7. **Commerce back end.** Cart, checkout, account and wholesale application are presentation only.
   The markup follows WooCommerce conventions so the templates map onto it directly. Subscriptions
   are shown because AllayPay confirmed ACH recurring is supported — wire them to the gateway
   before enabling.

---

## Language rules baked into the copy

The site never claims a physiological, therapeutic, performance or health effect. Product
descriptions say what a material *is* and what the literature *records*, and stop there. There is
no dosage guidance, no protocols, no cycles or stacks, and no testimonials. Research-use
confirmation at checkout is required and never pre-checked.

If copy is added later that reads as a health claim, it is a defect that puts the merchant account
at risk, not a variation.
