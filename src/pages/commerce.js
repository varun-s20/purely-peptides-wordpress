'use strict';

const { page, esc, money } = require('../layout');
const C = require('../components');
const { icons, productShot } = require('../art');
const { products } = require('../data');

const LINES = [
  { slug: 'bpc-157', name: 'BPC-157', sku: 'PP-1001', size: '10 mg', lot: 'BP-260910', qty: 2, unit: 78 },
  { slug: 'ghk-cu', name: 'GHK-Cu', sku: 'PP-1003', size: '50 mg', lot: 'GH-260803', qty: 1, unit: 38, tint: '#D6E4EE' },
];
const subtotal = LINES.reduce((s, l) => s + l.qty * l.unit, 0);
/* Server-side figures are the fallback the page renders with; the script
   recalculates them live against the chosen destination state. */
const shipping = 14;
const coldPack = 9;
const tax = +(subtotal * 0.0625).toFixed(2);
const total = subtotal + shipping + coldPack + tax;

/* Shown in both summaries so the rules are visible before checkout, not
   discovered at it. */
const shipNote = `
  <div class="shipnote">
    <div class="shipnote__row">
      <span>Destination</span>
      <button class="shipnote__pick" type="button" data-modal-open="region">
        United States - <strong data-region-label>MA</strong> · change
      </button>
    </div>
    <p class="shipnote__hint" data-freeship>
      Weight-based tracked despatch. Orders over <strong>$250</strong> ship free.
    </p>
  </div>`;

const regionBlock = `
  <div class="notice notice--stop" data-region-block hidden>
    ${icons.alert}
    <div>
      <strong>We cannot ship to <span data-region-label>this state</span>.</strong>
      These materials are restricted for despatch to California, New York and Louisiana.
      Choose another destination, or <a class="link" href="/contact/?topic=shipping">contact us</a>
      about institutional delivery.
    </div>
  </div>`;

/* ------------------------------------------------------------------- cart */

function cart() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Order' }])}

<div class="pagehead">
  <div class="wrap">
    <h1>Your order</h1>
    <p>${LINES.length} materials · ${LINES.reduce((s, l) => s + l.qty, 0)} vials. Documentation for each lot is attached automatically.</p>
  </div>
</div>

<div class="wrap cart">
  <div>
    ${LINES.map(
      (l) => `<div class="cart-row">
      <div class="cart-row__media">${productShot(l.sku, l.name)}</div>
      <div>
        <h2 style="font-size:var(--t-h4)"><a href="/products/${l.slug}/" style="text-decoration:none">${esc(l.name)}</a></h2>
        <div class="pcard__meta" style="margin-top:8px">
          <span>${esc(l.sku)}</span><span>${esc(l.size)} vial</span><span>Lot ${esc(l.lot)}</span>
        </div>
        <div class="row" style="gap:6px;margin-top:10px">
          <span class="status status--ok">${icons.check}In stock</span>
          <span class="status status--flat">${icons.doc}COA attached</span>
        </div>
        ${l.qty >= 2 ? `<div class="volume-note">${icons.info}Order 10 or more vials of this size for volume pricing</div>` : ''}
      </div>
      <div class="cart-row__actions">
        <div class="qty" data-qty>
          <button type="button" aria-label="Decrease quantity of ${esc(l.name)}" data-step="-1">−</button>
          <input type="number" value="${l.qty}" min="1" aria-label="Quantity of ${esc(l.name)}">
          <button type="button" aria-label="Increase quantity of ${esc(l.name)}" data-step="1">+</button>
        </div>
        <span class="cart-row__price">${money(l.qty * l.unit)}</span>
        <button class="btn-text" type="button" data-toast="${esc(l.name)} removed from your order">Remove</button>
      </div>
    </div>`
    ).join('')}

    <div class="row" style="justify-content:space-between;margin-top:24px">
      <a class="link-arrow" href="/products/">${icons.arrow}<span>Continue browsing the catalogue</span></a>
      <button class="btn-text" type="button" data-toast="Order saved to your account">Save this order</button>
    </div>

    <section style="margin-top:64px">
      ${C.sectionHead({ title: 'Frequently ordered together' })}
      <div class="grid grid-3">${products.slice(3, 6).map(C.productCard).join('')}</div>
    </section>
  </div>

  <aside class="checkout__summary">
    <h2>Order summary</h2>
    <div class="checkout__totals" style="background:var(--paper);border-top:0">
      ${shipNote}
      <div class="trow"><span>Subtotal</span><span class="num" data-sum-subtotal>${money(subtotal)}</span></div>
      <div class="trow"><span>Shipping - tracked, domestic</span><span class="num" data-sum-shipping>${money(shipping)}</span></div>
      <div class="trow"><span>Cold-pack handling</span><span class="num" data-sum-cold>${money(coldPack)}</span></div>
      <div class="trow"><span>Estimated tax · <span data-sum-taxrate>6.25%</span></span><span class="num" data-sum-tax>${money(tax)}</span></div>
      <div class="trow trow--total"><span>Total</span><span class="num" data-sum-total>${money(total)}</span></div>
      ${regionBlock}
      <a class="btn btn--primary btn--block btn--lg" style="margin-top:20px" href="/checkout/" data-region-gated>Proceed to checkout</a>
      <ul class="pdp__assur" style="list-style:none;padding:0;margin-top:20px">
        <li>${icons.lock}Secure payment</li>
        <li>${icons.truck}Tracked despatch and order tracking</li>
        <li>${icons.doc}Lot documentation retained in your account</li>
      </ul>
    </div>
    <div style="padding:24px;border-top:1px solid var(--rule)">
      <label class="field__label" for="po">Purchase order reference <span class="muted" style="font-weight:400">(optional)</span></label>
      <input class="input input--mono" id="po" placeholder="PO-000000">
      <p class="field__hint">Organisations on account can order against a PO. <a class="link" href="/wholesale/">Apply for an account</a>.</p>
    </div>
  </aside>
</div>`;

  return page({
    title: 'Your order',
    description: 'Review your Purely Peptides order before checkout. Lot documentation is attached to each line automatically.',
    canonical: '/cart/',
    active: null,
    body,
  });
}

/* --------------------------------------------------------------- checkout */

function checkout() {
  const body = `
<div class="wrap" style="padding-block:24px;border-bottom:1px solid var(--rule)">
  <div class="row" style="justify-content:space-between">
    <h1 style="font-size:var(--t-h3)">Checkout</h1>
    <span class="row" style="gap:8px;font-size:var(--t-micro);color:var(--slate)">${icons.lock} Secure checkout</span>
  </div>
</div>

<form class="wrap checkout" novalidate>
  <div>
    <fieldset class="fieldset">
      <legend>Contact</legend>
      <div class="form-grid">
        <label class="field field--full">
          <span class="field__label">Email address<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="email" name="email" required autocomplete="email" placeholder="name@institution.edu">
          <span class="field__hint">Order confirmation, tracking and certificates are sent to this address.</span>
        </label>
        <label class="field">
          <span class="field__label">Full name<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="text" required autocomplete="name">
        </label>
        <label class="field">
          <span class="field__label">Organisation</span>
          <input class="input" type="text" autocomplete="organization" placeholder="Laboratory or institution">
        </label>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Shipping address</legend>
      <div class="form-grid">
        <label class="field field--full">
          <span class="field__label">Street address<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="text" required autocomplete="address-line1">
        </label>
        <label class="field field--full">
          <span class="field__label">Building, room or department</span>
          <input class="input" type="text" autocomplete="address-line2">
        </label>
        <label class="field">
          <span class="field__label">City<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="text" required autocomplete="address-level2">
        </label>
        <label class="field">
          <span class="field__label">State<span class="field__req" aria-hidden="true">*</span></span>
          <select class="select" required autocomplete="address-level1">
            <option value="">Select a state</option><option>Massachusetts</option><option>California</option><option>New York</option><option>Texas</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">ZIP code<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input input--mono" type="text" required autocomplete="postal-code" inputmode="numeric">
        </label>
        <label class="field">
          <span class="field__label">Phone<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="tel" required autocomplete="tel">
          <span class="field__hint">Used by the courier for delivery only.</span>
        </label>
      </div>
      <div class="field field--error">
        <label class="field__label" for="delivery-note">Delivery instructions</label>
        <input class="input" id="delivery-note" value="Leave with reception" aria-describedby="err-1" aria-invalid="true">
        <span class="field__error" id="err-1">${icons.alert} Cold-chain orders must be received in person. Remove this instruction or select standard shipping.</span>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Billing</legend>
      <label class="check"><input type="checkbox" checked><span>Billing address is the same as the shipping address</span></label>
      <label class="check"><input type="checkbox"><span>I am ordering against a purchase order</span></label>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Payment</legend>
      <div class="card" style="padding:24px">
        <div class="form-grid">
          <label class="field field--full">
            <span class="field__label">Card number<span class="field__req" aria-hidden="true">*</span></span>
            <input class="input input--mono" inputmode="numeric" placeholder="0000 0000 0000 0000" autocomplete="cc-number">
          </label>
          <label class="field">
            <span class="field__label">Expiry<span class="field__req" aria-hidden="true">*</span></span>
            <input class="input input--mono" placeholder="MM / YY" autocomplete="cc-exp">
          </label>
          <label class="field">
            <span class="field__label">Security code<span class="field__req" aria-hidden="true">*</span></span>
            <input class="input input--mono" placeholder="123" autocomplete="cc-csc">
          </label>
        </div>
        <div class="notice">${icons.lock}<div>Card details are processed by our payment provider. Purely Peptides does not store card numbers.</div></div>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Required acknowledgements</legend>
      <div class="card" style="padding:20px;border-left:3px solid var(--warn)">
        <label class="check">
          <input type="checkbox" required>
          <span><strong>Research use confirmation.</strong> I confirm that I am ordering on behalf of a laboratory or research organisation and that these materials will be used exclusively for in-vitro laboratory research. They will not be administered to humans or animals.</span>
        </label>
        <label class="check">
          <input type="checkbox" required>
          <span>I have read and accept the <a class="link" href="/terms/">terms of sale</a> and the <a class="link" href="/research-use-policy/">research use policy</a>.</span>
        </label>
        <label class="check">
          <input type="checkbox">
          <span>Send me notification when new documentation is published for lots I have ordered.</span>
        </label>
      </div>
    </fieldset>

    <button class="btn btn--primary btn--lg btn--block" type="button" data-region-gated data-toast="Order placed. Confirmation sent to your email.">Place order - <span data-sum-total>${money(total)}</span></button>
    <p class="small muted center" style="margin-top:16px">You will receive an order confirmation by email. Certificates for each lot appear in your account once the order is despatched.</p>
  </div>

  <aside class="checkout__summary">
    <h2>Order summary</h2>
    <div class="checkout__lines">
      ${LINES.map(
        (l) => `<div class="cart-line">
        <div class="cart-line__media">${productShot(l.sku, l.name)}</div>
        <div>
          <div class="cart-line__name">${esc(l.name)}</div>
          <div class="cart-line__meta">${esc(l.size)} · ${esc(l.sku)}<br>Lot ${esc(l.lot)}</div>
          <div class="cart-line__foot"><span class="mono small">Qty ${l.qty}</span><span class="mono">${money(l.qty * l.unit)}</span></div>
        </div>
      </div>`
      ).join('')}
    </div>
    <div class="checkout__totals">
      ${shipNote}
      <div class="trow"><span>Subtotal</span><span class="num" data-sum-subtotal>${money(subtotal)}</span></div>
      <div class="trow"><span>Shipping</span><span class="num" data-sum-shipping>${money(shipping)}</span></div>
      <div class="trow"><span>Cold-pack handling</span><span class="num" data-sum-cold>${money(coldPack)}</span></div>
      <div class="trow"><span>Tax · <span data-sum-taxrate>6.25%</span></span><span class="num" data-sum-tax>${money(tax)}</span></div>
      <div class="trow trow--total"><span>Total</span><span class="num" data-sum-total>${money(total)}</span></div>
      ${regionBlock}
      <ul class="pdp__assur" style="list-style:none;padding:0;margin-top:20px">
        <li>${icons.lock}Secure payment</li>
        <li>${icons.truck}Order tracking issued on despatch</li>
        <li>${icons.doc}Documentation available in your account</li>
      </ul>
    </div>
  </aside>
</form>`;

  return page({
    title: 'Checkout',
    description: 'Complete your Purely Peptides order. Research use confirmation is required before an order can be placed.',
    canonical: '/checkout/',
    active: null,
    body,
  });
}

module.exports = { cart, checkout, LINES, subtotal, total };
