# Deploying a pass to the WordPress site

How code and catalogue changes in this repo reach the live WordPress site
(Hostinger, `lightseagreen-reindeer-736443.hostingersite.com`). Every step below
was run against a clean WordPress + WooCommerce install on 22 Sep 2026, in this
order, and verified.

Nothing here is destructive to orders or customers. Imports update in place and
never delete. The only thing overwritten is page *content* (WordPress keeps
revisions) and product data.

---

## What this pass contains (21 Sep client drop)

| Part | Where it lives | How it gets there |
|---|---|---|
| 51 products, 82 sizes, retail + wholesale prices, stock, lots | `wordpress/content/` | Tools → Import PPH Products |
| 57 product photographs | `wordpress/themes/pph-child/assets/img/products/` | file upload with the theme |
| Address, email, wholesale copy, live application form | `wordpress/pages/` | Tools → Import PPH Pages |
| Wholesale engine, pricing, importer changes | `wordpress/plugins/pph-core/` | file upload |
| Header/footer/front page, JS, CSS | `wordpress/themes/pph-child/` | file upload |

---

## 0. Before you start

- Take a backup: Hostinger hPanel → **Websites → Backups → Create backup**, or
  UpdraftPlus if it is installed. One click, and it is the whole rollback plan.
- Know the wp-admin login for the site, with an Administrator account.
- Have the repo on your machine with Node installed.

---

## 1. Rebuild the export folders (on your machine)

```bash
cd research-peptide
node build.js                     # static build - proves the data is valid
node tools/export-wp-theme.js     # theme chrome + assets (css, js, images)
node tools/export-wp-pages.js     # 14 page bodies + manifest.json
node tools/export-wp-products.js  # categories.json + products.json
```

Expected last lines:

```
Built 110 HTML pages ...
Wrote header.php, footer.php, front-page.php, 404.php + assets ...
Exported 14 page bodies (116 KB) to wordpress/pages/
Exported 8 categories and 51 products (82 size-variations) to wordpress/content/
```

If any of these fail, stop — they fail loudly on bad data (a size with no price,
a missing image) and that is the point.

*Already done for this pass.* Re-run only if you change anything under `src/`.

---

## 2. Upload the theme and the plugin

Hostinger hPanel → **Files → File Manager** (or any SFTP client).

1. **Theme** → `public_html/wp-content/themes/pph-child/`
   Upload the whole local `wordpress/themes/pph-child/` folder, overwriting.
   New this pass: `assets/img/products/` (57 files, ~3 MB), and changed
   `header.php`, `footer.php`, `front-page.php`, `assets/css/`, `assets/js/`,
   `woocommerce/checkout/form-billing.php`, `woocommerce/checkout/payment.php`.
2. **Plugin** → `public_html/wp-content/plugins/pph-core/`
   Upload the whole local `wordpress/plugins/pph-core/` folder, overwriting.
   New files: `inc/wholesale.php`, `inc/pages-importer.php`,
   `inc/admin-import-pages.php`.

Uploading a zip and extracting it in File Manager is faster than uploading
hundreds of files individually.

**Check before continuing:** load wp-admin. If you get a white screen, a PHP
file did not upload completely — re-upload `pph-core` and reload.

---

## 3. Import the products

wp-admin → **Tools → Import PPH Products**.

1. On your machine, right-click the `wordpress\content` folder →
   **Send to → Compressed (zipped) folder**.
2. Upload `content.zip` on that screen → **Upload and import**.

Expected: **8 categories, 51 products imported.** Takes about a minute.

This sets, for every size: price, wholesale price, stock quantity, lot number,
SKU and its own photograph. Re-running it is safe.

> Stock quantities are overwritten with the sheet's numbers every time you run
> this. That is how a new weekly inventory sheet is applied — but it also means
> any quantity edited by hand in wp-admin since the last import is replaced.

---

## 4. Import the pages

wp-admin → **Tools → Import PPH Pages**.

1. Right-click `wordpress\pages` → **Send to → Compressed (zipped) folder**.
2. Upload `pages.zip` → **Upload and import**.

Expected: **0 created, 13 updated** (13 created if this is a fresh site).

This is what puts the new address and email on every legal page, the rewritten
wholesale terms on `/wholesale/`, and the working application form on
`/wholesale/apply/`.

*(With SSH, `wp eval-file tools/import-wp-pages.php --user=1` does exactly the
same thing — it is the same code.)*

---

## 5. Settings to check once

- **PPH Settings → Restricted states** — if it still says `CA NY LA`, clear the
  box and **Save**. A saved value overrides the new "no restrictions" default,
  and the client has never named a restricted state.
- **PPH Settings → Contact details** — set the support email to
  `purelypeptideshubcs@gmail.com` and the address to the West Hollywood one, so
  the admin screen agrees with the site.
- **LiteSpeed Cache** — if it has been re-enabled since it was removed in
  September: **Purge All** (both the page cache and the CSS/JS cache).

These three only apply to this pass. Settings that are already correct on
staging and should stay that way: Permalinks (product base `products`, product
category base `products/category`), the Shop page slug `products`, Cart and
Checkout pages containing `[woocommerce_cart]` / `[woocommerce_checkout]`, and
guest checkout off.

---

## 6. Verify (logged out, in a private window)

| Check | Expected |
|---|---|
| `/products/` | 51 products, photographs on the cards |
| Any product page, click through the sizes | price, stock and the photograph change with the size |
| `/products/category/lab-supplies/` | Bacteriostatic Water |
| Footer, `/contact/` | West Hollywood address, gmail, no phone number, no opening hours |
| `/wholesale/` | "Minimum order — 10 vials per size", no old discount tiers |
| Add something to the cart | drawer opens, `/cart/` shows it with the right vial photo |
| Add 10 of one size | "Volume pricing applied − 16%" on the cart row |

Then the wholesale round trip:

1. Submit `/wholesale/apply/` with a test email.
2. wp-admin → **Users** → the new user shows as **Wholesale applicant**.
3. Open them → **Role → Wholesale buyer** → **Update User**.
4. Sign in as that user: a product page shows the wholesale price, quantity
   starts at 10, and the volume ladder is gone.
5. Delete the test user afterwards.

---

## 7. If something looks wrong

| Symptom | Cause | Fix |
|---|---|---|
| Every page says "Great things are on the horizon" | WooCommerce "Coming soon" mode (on by default for new stores) | WooCommerce → Settings → Site visibility → **Live** |
| `/products/` is a 404 | Shop page slug is not `products` | Pages → Shop → Quick Edit → slug `products`; Settings → Permalinks → Save |
| Category URLs 404 | Product category base | Settings → Permalinks → **Product category base** = `products/category` |
| Checkout looks like plain WooCommerce with no research field | Cart/Checkout pages are blocks, not shortcodes | Replace their content with `[woocommerce_cart]` / `[woocommerce_checkout]` |
| Prices or photos unchanged after import | LiteSpeed serving a cached page | LiteSpeed Cache → Purge All, then retest in a private window |
| Import screen says the zip is wrong | zipped the files instead of the folder, or the folder is nested | Zip the folder itself; the importer looks up to 4 levels deep for the marker files |

Rollback: restore the backup from step 0, or re-upload the previous
`pph-core` / `pph-child` folders. Product and page imports can simply be run
again from an older export.

---

## Deploying a CSS-only pass (23 Sep: account/sign-in/thank-you styling)

Only three files changed, so this is much smaller than a full pass - no imports, no settings:

1. `wordpress/themes/pph-child/assets/css/woo-bridge.css`
2. `wordpress/themes/pph-child/assets/css/styles.css`
3. `wordpress/themes/pph-child/functions.php`

Upload those three over the existing ones in
`public_html/wp-content/themes/pph-child/`, then purge LiteSpeed if it is on and
hard-reload (Ctrl-F5) - the stylesheet is cache-busted by file modification time, so a normal
reload usually suffices.

Check afterwards, logged out: `/my-account/` (sign-in form in a card, teal Log in button),
`/cart/` with an empty cart. Then signed in: `/my-account/` (two columns, navigation as a boxed
list), `/my-account/orders/`, and the order page from any past order.

---
## Next time (a new inventory sheet or more photos)

1. Put the new photos through `python tools/product-photos.py <folder>` after
   adding one `MAP` line per file (file name → `slug|size label`).
2. Update `PRICING`, sizes, stock and lots in `src/data.js`.
3. Steps 1 → 3 above (export, upload the theme if photos changed, import
   products). Pages only need re-importing if page copy changed.
