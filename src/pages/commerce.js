'use strict';

const { page, esc, money } = require('../layout');
const C = require('../components');
const { icons, productShot } = require('../art');
const { products, brand, researchFields } = require('../data');

const LINES = [
  { slug: 'bpc-157', name: 'BPC-157', sku: 'PPH-3001', size: '10 mg', lot: 'BP10-0318', qty: 2, unit: 75 },
  { slug: 'ghk-cu', name: 'GHK-Cu', sku: 'PPH-3003', size: '50 mg', lot: 'GHK50-0616', qty: 1, unit: 45, tint: '#D6E4EE' },
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
    <p data-cart-summaryline>Documentation for each lot is attached automatically.</p>
  </div>
</div>

<div class="wrap cart">
  <div>
    <div data-cart-rows></div>

    <div class="empty" data-cart-empty hidden>
      ${icons.cart}
      <h2>Your order is empty</h2>
      <p>Nothing has been added yet. Every material you add arrives with the analytical record for the lot that ships.</p>
      <a class="btn btn--primary" href="/products/">Browse the catalogue</a>
    </div>

    <div class="notice notice--warn" style="margin-top:24px">
      ${icons.flask}
      <div><strong>${esc(brand.productDisclaimer)}</strong> They are not intended for human dosing,
      injection, or ingestion, and may not be resold for any such purpose.</div>
    </div>

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
      <p class="small muted center" style="margin-top:10px">A research account is required to complete an order.</p>
      <ul class="pdp__assur" style="list-style:none;padding:0;margin-top:20px">
        <li>${icons.lock}Secure ACH / e-check payment</li>
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
    description: 'Review your Purely Peptides Hub order before checkout. Lot documentation is attached to each line automatically.',
    canonical: '/cart/',
    active: null,
    body,
  });
}

/* --------------------------------------------------------------- checkout
   Built to our payment processor's research-use-only checkout rules, which
   are conditions of the merchant account rather than preferences:
     - an account is required; guest checkout is not permitted
     - the buyer declares a research field from a fixed list
     - a company / institution name is mandatory
     - a research-use acknowledgement must be given, never pre-ticked
     - the ACH web authorisation is shown immediately before Place Order
   Changing any of these puts the merchant account at risk. */

function checkout() {
  const body = `
<div class="wrap" style="padding-block:24px;border-bottom:1px solid var(--rule)">
  <div class="row" style="justify-content:space-between">
    <h1 style="font-size:var(--t-h3)">Checkout</h1>
    <span class="row" style="gap:8px;font-size:var(--t-micro);color:var(--slate)">${icons.lock} Secure checkout</span>
  </div>
</div>

<div class="empty" data-order-placed hidden style="max-width:560px;margin:64px auto">
  ${icons.checkCircle}
  <h2>Order placed</h2>
  <p>A confirmation is on its way to your email. The certificate of analysis for every documented lot in this
  order is already in your account, and tracking follows when the parcel is scanned.</p>
  <div class="row" style="justify-content:center;gap:10px">
    <a class="btn btn--primary" href="/orders/">View your orders</a>
    <a class="btn btn--secondary" href="/products/">Continue browsing</a>
  </div>
</div>

<div class="empty" data-checkout-empty hidden style="max-width:520px;margin:64px auto">
  ${icons.cart}
  <h2>There is nothing to check out</h2>
  <p>Your order is empty. Add a material and its documentation follows it through to delivery.</p>
  <a class="btn btn--primary" href="/products/">Browse the catalogue</a>
</div>

<form class="wrap checkout" data-checkout-form data-validate
      data-success="Order placed. Confirmation sent to your email."
      data-success-action="clear-cart">
  <div>
    <div class="notice notice--accent" style="margin-bottom:28px">
      ${icons.user}
      <div>
        <strong>An account is required to order.</strong> We do not offer guest checkout. Orders are
        released only to identified research accounts, and your order history and lot documentation
        stay attached to that account. Already registered?
        <a class="link" href="/login/">Sign in</a> and these details are filled in for you.
      </div>
    </div>

    <fieldset class="fieldset">
      <legend>Your research account</legend>
      <div class="form-grid">
        <label class="field field--full">
          <span class="field__label">Email address<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="email" name="email" required autocomplete="email" placeholder="name@institution.edu">
          <span class="field__hint">This becomes your account username. Order confirmations, tracking and certificates are sent here.</span>
        </label>
        <label class="field">
          <span class="field__label">Create a password<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="password" name="password" required autocomplete="new-password" minlength="8">
          <span class="field__hint">At least 8 characters.</span>
        </label>
        <label class="field">
          <span class="field__label">Confirm password<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="password" name="password2" required autocomplete="new-password" minlength="8">
        </label>
        <label class="field">
          <span class="field__label">Full name<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="text" name="name" required autocomplete="name">
        </label>
        <label class="field">
          <span class="field__label">Company or institution<span class="field__req" aria-hidden="true">*</span></span>
          <input class="input" type="text" name="company" required autocomplete="organization"
                 placeholder="Laboratory, university or company">
          <span class="field__hint">Orders cannot be placed without a named organisation.</span>
        </label>
        <label class="field field--full">
          <span class="field__label">Field of research<span class="field__req" aria-hidden="true">*</span></span>
          <select class="select" name="research-field" required>
            <option value="">Select your field of research</option>
            ${researchFields.map((f) => `<option>${esc(f)}</option>`).join('')}
          </select>
          <span class="field__hint">We are required to record the research context for every order.</span>
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
      <div class="field">
        <label class="field__label" for="delivery-note">Delivery instructions <span class="field__opt">(optional)</span></label>
        <input class="input" id="delivery-note" placeholder="Loading bay, room number, receiving hours">
        <span class="field__hint">Cold-chain orders must be signed for; instructions to leave a parcel unattended cannot be followed.</span>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Billing</legend>
      <label class="check"><input type="checkbox" checked><span>Billing address is the same as the shipping address</span></label>
      <label class="check"><input type="checkbox"><span>I am ordering against a purchase order</span></label>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Payment - ACH / e-check</legend>
      <div class="card" style="padding:24px">
        <p class="small muted" style="margin-bottom:18px">
          Orders are settled by ACH debit from a US bank account. Enter the account the payment
          should be drawn from. Payments authorised after 2 PM Eastern are applied on the next
          business day.
        </p>
        <div class="form-grid">
          <label class="field field--full">
            <span class="field__label">Name on the account<span class="field__req" aria-hidden="true">*</span></span>
            <input class="input" type="text" name="ach-name" required autocomplete="off">
          </label>
          <label class="field">
            <span class="field__label">Routing number<span class="field__req" aria-hidden="true">*</span></span>
            <input class="input input--mono" name="ach-routing" required inputmode="numeric" pattern="[0-9]{9}"
                   placeholder="000000000" autocomplete="off">
            <span class="field__hint">Nine digits.</span>
          </label>
          <label class="field">
            <span class="field__label">Account number<span class="field__req" aria-hidden="true">*</span></span>
            <input class="input input--mono" name="ach-account" required inputmode="numeric" autocomplete="off">
          </label>
          <label class="field">
            <span class="field__label">Account type<span class="field__req" aria-hidden="true">*</span></span>
            <select class="select" name="ach-type" required>
              <option value="">Select</option><option>Business checking</option><option>Business savings</option>
              <option>Personal checking</option><option>Personal savings</option>
            </select>
          </label>
        </div>
        <div class="notice">${icons.lock}<div>Bank details are transmitted directly to our payment
        processor over an encrypted connection. ${esc(brand.legal)} does not store account numbers.</div></div>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Required acknowledgements</legend>
      <div class="card" style="padding:20px;border-left:3px solid var(--warn)">
        <label class="check">
          <input type="checkbox" name="ack-ruo" required>
          <span><strong>Research use confirmation.</strong> I confirm that I am ordering on behalf of
          the laboratory, institution or company named above, and that the chemicals purchased
          <strong>shall not be used for human therapeutic purposes</strong> and are for research
          purposes only. They will not be administered to humans or animals, and will not be
          dosed, injected or ingested.</span>
        </label>
        <label class="check">
          <input type="checkbox" name="ack-age" required>
          <span>I am 21 years of age or older.</span>
        </label>
        <label class="check">
          <input type="checkbox" name="ack-terms" required>
          <span>I have read and accept the <a class="link" href="/terms/">terms and conditions of purchase</a>,
          the <a class="link" href="/privacy/">privacy policy</a>, the
          <a class="link" href="/refunds/">refund and returns policy</a>, the
          <a class="link" href="/chargebacks/">chargeback policy</a> and the
          <a class="link" href="/research-use-policy/">research use policy</a>.</span>
        </label>
        <label class="check">
          <input type="checkbox" name="opt-docs">
          <span>Send me notification when new documentation is published for lots I have ordered.</span>
        </label>
      </div>
    </fieldset>

    <!-- ACH web authorisation. Required wording, and it must sit immediately
         before the Place Order control - do not move it further up the page. -->
    <fieldset class="fieldset">
      <legend>ACH debit authorisation</legend>
      <div class="card" style="padding:20px;border-left:3px solid var(--teal)">
        <p class="small" style="margin-bottom:14px">
          Each time I place an ACH / e-check order by clicking the &ldquo;Place Order&rdquo; button, I am
          authorising ${esc(brand.domain)} to initiate a single ACH / electronic debit to my account
          in the amount of my order, from the bank account information provided, on the date of my
          order. I agree that the ACH transactions I authorise comply with all applicable law.
          Payments made after 2 PM Eastern time will be applied as of the next business day. Once
          payment is authorised, there cannot be any changes or corrections.
        </p>
        <p class="small" style="margin-bottom:14px">
          I also authorise ${esc(brand.domain)} to initiate a one-time ACH / electronic debit and/or
          credit entry to my account for a micro amount (less than $1) in order to validate the bank
          account information provided, and to initiate an ACH credit to recover the amount of a
          micro deposit.
        </p>
        <p class="small muted" style="margin-bottom:16px">
          It is recommended that you print a copy of this authorisation and keep it for your records.
        </p>
        <label class="check">
          <input type="checkbox" name="ach-auth" required>
          <span><strong>I authorise the ACH debit described above</strong> and agree to the
          <a class="link" href="/terms/#ach">web authorisation terms</a>.</span>
        </label>
      </div>
    </fieldset>

    <button class="btn btn--primary btn--lg btn--block" type="submit" data-region-gated>Place Order - <span data-sum-total>${money(total)}</span></button>
    <p class="small muted center" style="margin-top:16px">You will receive an order confirmation by email. Certificates for each documented lot appear in your account once the order is despatched.</p>
  </div>

  <aside class="checkout__summary">
    <h2>Order summary</h2>
    <div class="checkout__lines" data-checkout-lines></div>
    <div class="checkout__totals">
      ${shipNote}
      <div class="trow"><span>Subtotal</span><span class="num" data-sum-subtotal>${money(subtotal)}</span></div>
      <div class="trow"><span>Shipping</span><span class="num" data-sum-shipping>${money(shipping)}</span></div>
      <div class="trow"><span>Cold-pack handling</span><span class="num" data-sum-cold>${money(coldPack)}</span></div>
      <div class="trow"><span>Tax · <span data-sum-taxrate>6.25%</span></span><span class="num" data-sum-tax>${money(tax)}</span></div>
      <div class="trow trow--total"><span>Total</span><span class="num" data-sum-total>${money(total)}</span></div>
      ${regionBlock}
      <div class="notice notice--warn" style="margin-top:16px">
        ${icons.flask}
        <div>${esc(brand.productDisclaimer)}</div>
      </div>
      <ul class="pdp__assur" style="list-style:none;padding:0;margin-top:20px">
        <li>${icons.lock}ACH / e-check, processed securely</li>
        <li>${icons.truck}Order tracking issued on despatch</li>
        <li>${icons.doc}Documentation available in your account</li>
      </ul>
    </div>
  </aside>
</form>`;

  return page({
    title: 'Checkout',
    description: 'Complete your Purely Peptides Hub order. A research account and a research use confirmation are required before an order can be placed.',
    canonical: '/checkout/',
    active: null,
    body,
  });
}

module.exports = { cart, checkout, LINES, subtotal, total };
