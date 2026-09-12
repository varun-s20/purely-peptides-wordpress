'use strict';

const { page, esc, money } = require('../layout');
const C = require('../components');
const { icons, productShot } = require('../art');
const { lots, researchFields } = require('../data');

const LINE = (name, slug, size, lot, qty, unit) => ({ name, slug, size, lot, qty, unit });

const ORDERS = [
  {
    id: 'PPH-84120', date: '02 Sep 2026', total: 240.0, status: 'shipped', track: '1Z-994-772-01',
    lines: [
      LINE('BPC-157', 'bpc-157', '10 mg', 'BP10-0318', 2, 75),
      LINE('GHK-Cu', 'ghk-cu', '50 mg', 'GHK50-0616', 1, 45),
      LINE('Sermorelin', 'sermorelin', '5 mg', 'SERMO5-0318', 1, 50),
    ],
    steps: [['Received', '02 Sep, 10:14'], ['Prepared', '02 Sep, 15:40'], ['Despatched', '03 Sep, 08:02'], ['In transit', '04 Sep, 06:30']],
    done: 4,
  },
  {
    id: 'PPH-83771', date: '14 Aug 2026', total: 75.0, status: 'delivered', track: '1Z-994-661-08',
    lines: [LINE('BPC-157', 'bpc-157', '10 mg', 'BP10-0318', 1, 75)],
    steps: [['Received', '14 Aug, 09:22'], ['Prepared', '14 Aug, 13:05'], ['Despatched', '15 Aug, 08:10'], ['Delivered', '17 Aug, 11:48']],
    done: 4,
  },
  {
    id: 'PPH-83402', date: '27 Jun 2026', total: 525.0, status: 'delivered', track: '1Z-994-512-44',
    lines: [
      LINE('Semaglutide', 'semaglutide', '10 mg', 'SEMA10-0616', 2, 110),
      LINE('Retatrutide', 'retatrutide', '10 mg', 'RETA10-0616', 1, 160),
      LINE('GHK-Cu', 'ghk-cu', '100 mg', 'GHK100-0616', 1, 75),
      LINE('TB-500', 'tb-500', '10 mg', 'TB10-0318', 1, 95),
    ],
    steps: [['Received', '27 Jun, 11:31'], ['Prepared', '27 Jun, 16:20'], ['Despatched', '28 Jun, 08:04'], ['Delivered', '30 Jun, 14:12']],
    done: 4,
  },
  {
    id: 'PPH-82995', date: '09 May 2026', total: 230.0, status: 'delivered', track: '1Z-994-390-17',
    lines: [
      LINE('Tirzepatide', 'tirzepatide', '10 mg', 'TIR10-0528', 1, 135),
      LINE('NAD+', 'nad', '500 mg', 'ND5-011726', 1, 95),
    ],
    steps: [['Received', '09 May, 08:47'], ['Prepared', '09 May, 12:15'], ['Despatched', '10 May, 07:55'], ['Delivered', '12 May, 09:30']],
    done: 4,
  },
  {
    id: 'PPH-82611', date: '18 Mar 2026', total: 175.0, status: 'delivered', track: '1Z-994-221-63',
    lines: [
      LINE('Tesamorelin', 'tesamorelin', '10 mg', 'TESA10-0803', 1, 120),
      LINE('AOD-9604', 'aod-9604', '5 mg', 'AOD5-0803', 1, 55),
    ],
    steps: [['Received', '18 Mar, 14:02'], ['Prepared', '19 Mar, 09:40'], ['Despatched', '19 Mar, 16:18'], ['Delivered', '23 Mar, 10:05']],
    done: 4,
  },
];

const itemCount = (o) => o.lines.reduce((n, l) => n + l.qty, 0);
const lineSubtotal = (o) => o.lines.reduce((n, l) => n + l.qty * l.unit, 0);
const orderFile = (id) => `/orders/${id.toLowerCase()}/`;

const NAV = [
  ['Overview', '/account/', icons.grid],
  ['Orders', '/orders/', icons.box],
  ['Batch documents', '/certificates/', icons.doc],
  ['Subscriptions', '/account/#subscriptions', icons.refresh],
  ['Addresses', '/account/#addresses', icons.pin],
  ['Wholesale', '/wholesale/', icons.building],
  ['Account settings', '/account/#settings', icons.settings],
  ['Support', '/contact/', icons.help],
];

const statusBadge = (s) =>
  s === 'shipped'
    ? `<span class="status status--warn">${icons.truck}In transit</span>`
    : s === 'delivered'
      ? `<span class="status status--ok">${icons.check}Delivered</span>`
      : `<span class="status status--flat">${icons.clock}Processing</span>`;

function acctNav(active) {
  return `<nav class="acct-nav" aria-label="Account">
    ${NAV.map(([label, href, icon]) => `<a href="${href}"${label === active ? ' aria-current="page"' : ''}>${icon}${esc(label)}</a>`).join('')}
  </nav>`;
}

/* -------------------------------------------------------------- dashboard */

function dashboard() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Account' }])}

<div class="wrap account">
  ${acctNav('Overview')}
  <div>
    <div class="row" style="justify-content:space-between;align-items:flex-end;margin-bottom:32px">
      <div>
        <span class="label">Welcome back</span>
        <h1 style="font-size:var(--t-h2);margin-top:8px">Dr. Amara Osei</h1>
        <p class="muted small" style="margin-top:6px">Kendall Institute - Cell Biology · Account PP-C-2214 · Wholesale tier 2</p>
      </div>
      <a class="btn btn--secondary btn--sm" href="/login/">Sign out</a>
    </div>

    <div class="quickactions">
      <a class="quickaction" href="/orders/">${icons.refresh}Reorder</a>
      <a class="quickaction" href="/orders/pph-84120/">${icons.truck}Track order</a>
      <a class="quickaction" href="/certificates/">${icons.checkCircle}Verify a lot</a>
      <a class="quickaction" href="/certificates/">${icons.download}Download documents</a>
    </div>

    <section style="margin-top:48px">
      ${C.sectionHead({ title: 'Account at a glance' })}
      <div class="statgrid">
        <div class="statbox"><span class="label">Orders this year</span><div class="statbox__val">14</div></div>
        <div class="statbox"><span class="label">Documents on file</span><div class="statbox__val">31</div></div>
        <div class="statbox"><span class="label">Volume tier</span><div class="statbox__val">−8%</div><p class="small muted" style="margin-top:6px">Applied automatically at checkout</p></div>
      </div>
    </section>

    <section style="margin-top:48px">
      ${C.sectionHead({ title: 'Recent orders', action: { label: 'All orders', href: '/orders/' } })}
      <table class="dtable dtable--stack">
        <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${ORDERS.slice(0, 3)
            .map(
              (o) => `<tr>
            <td data-label="Order"><a class="link mono" href="/orders/${o.id.toLowerCase()}/">${esc(o.id)}</a></td>
            <td data-label="Date" class="mono">${esc(o.date)}</td>
            <td data-label="Items" class="mono">${itemCount(o)}</td>
            <td data-label="Total" class="mono">${money(o.total)}</td>
            <td data-label="Status">${statusBadge(o.status)}</td>
            <td data-label="Actions"><a class="link-arrow" href="/orders/${o.id.toLowerCase()}/"><span>Details</span>${icons.arrow}</a></td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </section>

    <section style="margin-top:48px" id="wishlist">
      ${C.sectionHead({
        title: 'Wishlist',
        body: 'Materials you have saved. Kept in this browser, so it survives a reload without an account.',
      })}
      <div class="wishlist" data-wish-list></div>
      <div class="empty" data-wish-empty hidden>
        ${icons.heart}
        <h3>Nothing saved yet</h3>
        <p>Use the heart on any product to keep it here for later.</p>
        <a class="btn btn--secondary" href="/products/">Browse the catalogue</a>
      </div>
    </section>

    <!-- Subscriptions are customer-managed: pause, skip the next delivery,
         change quantity or cancel, without contacting anyone. -->
    <section style="margin-top:48px" id="subscriptions">
      ${C.sectionHead({
        title: 'Subscriptions',
        body: 'Change quantity, skip a delivery or cancel at any time. Volume pricing is recalculated on every renewal.',
      })}
      <div class="subs">
        ${[
          { name: 'BPC-157', sku: 'PP-1001', size: '5 mg', qty: 10, every: 8, next: '04 Nov 2026', unit: 46, state: 'active' },
          { name: 'GHK-Cu', sku: 'PP-1003', size: '50 mg', qty: 4, every: 12, next: '18 Dec 2026', unit: 38, state: 'paused' },
        ]
          .map((s) => {
            const vol = s.qty >= 10 ? 0.16 : s.qty >= 5 ? 0.08 : 0;
            const line = s.unit * s.qty;
            const per = line * (1 - vol) * 0.9;
            return `<article class="sub" data-state="${s.state}">
        <div class="sub__head">
          <div>
            <h3 class="sub__name"><a href="/products/${s.name.toLowerCase()}/">${esc(s.name)}</a></h3>
            <p class="sub__meta"><span class="mono">${esc(s.sku)}</span> · ${esc(s.size)} vial · qty <span data-sub-qtyval>${s.qty}</span></p>
          </div>
          <span class="status status--${s.state === 'active' ? 'ok' : 'warn'}">
            ${s.state === 'active' ? icons.refresh : icons.clock}${s.state === 'active' ? 'Active' : 'Paused'}
          </span>
        </div>
        <dl class="sub__rows">
          <div><dt>Frequency</dt><dd data-sub-every>Every ${s.every} weeks</dd></div>
          <div><dt data-sub-nextlabel>${s.state === 'active' ? 'Next delivery' : 'Resumes'}</dt><dd class="mono" data-sub-next data-sub-weeks="${s.every}">${esc(s.next)}</dd></div>
          <div><dt>Volume discount</dt><dd class="mono">−${Math.round(vol * 100)}%</dd></div>
          <div><dt>Subscribe &amp; Save</dt><dd class="mono">−10%</dd></div>
          <div><dt>Per delivery</dt><dd class="mono sub__price" data-sub-price data-unit="${s.unit}">${money(per)}</dd></div>
        </dl>
        <div class="sub__actions">
          <button class="btn btn--secondary btn--sm" type="button" data-sub-skip>Skip next</button>
          <button class="btn btn--secondary btn--sm" type="button" data-sub-qty>Change quantity</button>
          <button class="btn btn--secondary btn--sm" type="button" data-sub-toggle>${s.state === 'active' ? 'Pause' : 'Resume'}</button>
          <button class="btn btn--ghost btn--sm" type="button" data-sub-cancel>Cancel</button>
        </div>
      </article>`;
          })
          .join('')}
      </div>
      <div class="notice" style="margin-top:16px">
        ${icons.info}
        <div>Renewals are priced at the volume tier the quantity qualifies for on the day they run - if you increase quantity, the better rate applies from the next delivery.</div>
      </div>
    </section>

    <section style="margin-top:48px" id="documents">
      ${C.sectionHead({ title: 'Documentation for your lots', body: 'Certificates for every lot your account has received, retained after delivery.', action: { label: 'Certificate library', href: '/certificates/' } })}
      <table class="dtable dtable--zebra dtable--stack">
        <thead><tr><th>Product</th><th>Lot</th><th>Size</th><th>Test date</th><th>Purity</th><th>Status</th><th>Certificate</th></tr></thead>
        <tbody>${lots.slice(0, 5).map(C.lotRow).join('')}</tbody>
      </table>
    </section>

    <section style="margin-top:48px" id="addresses">
      ${C.sectionHead({ title: 'Addresses' })}
      <div class="grid grid-2">
        ${[
          ['Shipping - default', 'Kendall Institute<br>Cell Biology, Room 4.12<br>77 Binney Street<br>Cambridge, MA 02142'],
          ['Billing - accounts payable', 'Kendall Institute<br>Finance Office<br>81 Binney Street<br>Cambridge, MA 02142'],
        ]
          .map(
            ([t, a]) => `<div class="card" style="padding:24px">
          <span class="label">${esc(t)}</span>
          <address class="footer__addr" style="color:var(--ink);margin-top:12px">${a}</address>
          <div class="row" style="gap:16px;margin-top:16px"><button class="btn-text" type="button">Edit</button><button class="btn-text" type="button">Remove</button></div>
        </div>`
          )
          .join('')}
      </div>
    </section>
  </div>
</div>`;

  return page({ title: 'Account overview', description: 'Your Purely Peptides Hub account: orders, batch documentation, addresses and wholesale settings.', canonical: '/account/', active: null, body });
}

/* ----------------------------------------------------------------- orders */

function orders() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Account', href: '/account/' }, { label: 'Orders' }])}

<div class="wrap account">
  ${acctNav('Orders')}
  <div>
    <div class="row" style="justify-content:space-between;align-items:flex-end;margin-bottom:24px">
      <h1 style="font-size:var(--t-h2)">Orders</h1>
      <a class="btn btn--secondary btn--sm" href="/products/#quick-order">Quick reorder</a>
    </div>

    <div class="toolbar" style="border-bottom:1px solid var(--rule)">
      <div class="toolbar__left">
        <form class="searchbar" style="max-width:320px" role="search">
          <span class="searchbar__icon">${icons.search}</span>
          <label class="visually-hidden" for="oq">Search orders</label>
          <input id="oq" type="search" placeholder="Order number, product or lot">
        </form>
      </div>
      <div class="toolbar__right">
        <label class="visually-hidden" for="ostatus">Filter by status</label>
        <select class="select" id="ostatus" style="width:auto"><option>All statuses</option><option>Processing</option><option>In transit</option><option>Delivered</option></select>
        <label class="visually-hidden" for="operiod">Filter by period</label>
        <select class="select" id="operiod" style="width:auto"><option>Last 12 months</option><option>2026</option><option>2025</option></select>
      </div>
    </div>

    <table class="dtable dtable--stack" style="margin-top:8px">
      <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Tracking</th><th>Actions</th></tr></thead>
      <tbody>
        ${ORDERS.map(
          (o) => `<tr>
          <td data-label="Order"><a class="link mono" href="/orders/${o.id.toLowerCase()}/">${esc(o.id)}</a></td>
          <td data-label="Date" class="mono">${esc(o.date)}</td>
          <td data-label="Items" class="mono">${itemCount(o)}</td>
          <td data-label="Total" class="mono">${money(o.total)}</td>
          <td data-label="Status">${statusBadge(o.status)}</td>
          <td data-label="Tracking" class="mono micro">${esc(o.track)}</td>
          <td data-label="Actions"><button class="btn-text" type="button" data-reorder='${JSON.stringify(o.lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty })))}' data-order="${esc(o.id)}">Reorder</button></td>
        </tr>`
        ).join('')}
      </tbody>
    </table>
    ${C.pager(1, 3, '/orders/')}
  </div>
</div>`;

  return page({ title: 'Orders', description: 'Your Purely Peptides Hub order history, tracking and reorder options.', canonical: '/orders/', active: null, body });
}

/* ------------------------------------------------------------ order detail */

function orderDetail(o) {
  const subtotal = lineSubtotal(o);
  const discount = +(subtotal * 0.08).toFixed(2);
  const shipping = 14;
  const tax = +(o.total - (subtotal - discount + shipping)).toFixed(2);
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Account', href: '/account/' }, { label: 'Orders', href: '/orders/' }, { label: o.id }])}

<div class="wrap account">
  ${acctNav('Orders')}
  <div>
    <div class="row" style="justify-content:space-between;align-items:flex-end;margin-bottom:24px">
      <div>
        <span class="label">Order</span>
        <h1 style="font-size:var(--t-h2);margin-top:6px" class="mono">${esc(o.id)}</h1>
        <p class="muted small" style="margin-top:6px">Placed ${esc(o.date)} · ${itemCount(o)} vials · ${money(o.total)}</p>
      </div>
      <div class="row" style="gap:8px">
        ${statusBadge(o.status)}
        <button class="btn btn--secondary btn--sm" type="button" data-reorder='${JSON.stringify(o.lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty })))}' data-order="${esc(o.id)}">Reorder</button>
      </div>
    </div>

    <div class="card" style="padding:24px;margin-bottom:32px">
      <div class="row" style="justify-content:space-between;margin-bottom:20px">
        <span class="label">Shipment progress</span>
        <span class="mono small">${esc(o.track)}</span>
      </div>
      <ol style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px" class="ordersteps">
        ${o.steps
          .map(
            ([label, when], i) => `<li style="padding-top:14px;border-top:2px solid ${i < o.done ? 'var(--verdigris)' : 'var(--rule)'}">
          <div style="font-size:var(--t-small);font-weight:500">${esc(label)}</div>
          <div class="mono micro muted" style="margin-top:4px">${esc(when)}</div>
        </li>`
          )
          .join('')}
      </ol>
    </div>

    <h2 class="label" style="margin-bottom:12px">Items and documentation</h2>
    <table class="dtable dtable--stack">
      <thead><tr><th>Product</th><th>Size</th><th>Lot</th><th>Qty</th><th>Unit</th><th>Total</th><th>Certificate</th></tr></thead>
      <tbody>
        ${o.lines
          .map(
            ({ name, slug, size, lot, qty, unit }) => `<tr>
          <td data-label="Product"><a class="link" href="/products/${slug}/">${esc(name)}</a></td>
          <td data-label="Size" class="mono">${esc(size)}</td>
          <td data-label="Lot" class="mono">${esc(lot)}</td>
          <td data-label="Qty" class="mono">${qty}</td>
          <td data-label="Unit" class="mono">${money(unit)}</td>
          <td data-label="Total" class="mono">${money(qty * unit)}</td>
          <td data-label="Certificate"><a class="link-arrow" href="/certificates/${String(lot).toLowerCase()}/"><span>View COA</span>${icons.arrow}</a></td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div class="grid grid-2" style="margin-top:40px">
      <div class="card" style="padding:24px">
        <span class="label">Delivery address</span>
        <address class="footer__addr" style="color:var(--ink);margin-top:12px">Kendall Institute<br>Cell Biology, Room 4.12<br>77 Binney Street<br>Cambridge, MA 02142</address>
      </div>
      <div class="card" style="padding:24px">
        <span class="label">Totals</span>
        <div style="margin-top:12px">
          <div class="trow"><span>Subtotal</span><span class="num">${money(subtotal)}</span></div>
          <div class="trow"><span>Wholesale tier 2 (−8%)</span><span class="num">−${money(discount)}</span></div>
          <div class="trow"><span>Shipping</span><span class="num">${money(shipping)}</span></div>
          <div class="trow"><span>Tax</span><span class="num">${money(tax)}</span></div>
          <div class="trow trow--total"><span>Paid</span><span class="num">${money(o.total)}</span></div>
        </div>
        <button class="btn btn--secondary btn--block" style="margin-top:16px" type="button" data-toast="Invoice ${esc(o.id)}.pdf downloaded">${icons.download} Download invoice</button>
      </div>
    </div>
  </div>
</div>`;

  return page({ title: `Order ${o.id}`, description: `Order ${o.id} placed ${o.date}: items, shipment progress and lot documentation.`, canonical: orderFile(o.id), active: null, body });
}

/* ------------------------------------------------------------------ login */

function login() {
  const body = `
<div class="auth">
  <div class="auth__panel">
    <div class="auth__form">
      <span class="eyebrow">Account</span>
      <h1 style="font-size:var(--t-h2);margin-bottom:8px" data-tab-title>Sign in</h1>
      <p class="muted small" style="margin-bottom:32px">Order history, batch documentation and account pricing.</p>

      <div data-tabs>
        <div class="tabs" style="margin-bottom:24px" role="tablist">
          <button type="button" role="tab" data-tab="signin" aria-selected="true">Sign in</button>
          <button type="button" role="tab" data-tab="create" aria-selected="false">Create account</button>
        </div>

        <div data-panel="signin">
          <form data-validate data-success="Signed in as Dr. Amara Osei">
            <label class="field">
              <span class="field__label">Email address</span>
              <input class="input" type="email" required autocomplete="email" placeholder="name@institution.edu">
            </label>
            <label class="field">
              <span class="field__label">Password</span>
              <input class="input" type="password" required minlength="8" autocomplete="current-password">
            </label>
            <div class="row" style="justify-content:space-between;margin-bottom:24px">
              <label class="check"><input type="checkbox"><span>Keep me signed in</span></label>
              <a class="btn-text" href="/contact/">Forgot password?</a>
            </div>
            <button class="btn btn--primary btn--lg btn--block" type="submit">Sign in</button>
          </form>
        </div>

        <!-- The fields here are the same set checkout collects, because they are
             the ones the merchant account requires: a named organisation and a
             declared field of research on every account. Dropping either from
             this path would let an account exist that cannot legally order. -->
        <div data-panel="create" hidden>
          <form data-validate data-success="Account created. A confirmation has been sent to your email.">
            <div class="form-grid">
              <label class="field field--full">
                <span class="field__label">Email address<span class="field__req" aria-hidden="true">*</span></span>
                <input class="input" type="email" name="email" required autocomplete="email" placeholder="name@institution.edu">
                <span class="field__hint">This becomes your username. Certificates are sent here.</span>
              </label>
              <label class="field">
                <span class="field__label">Password<span class="field__req" aria-hidden="true">*</span></span>
                <input class="input" type="password" name="password" required minlength="8" autocomplete="new-password">
                <span class="field__hint">8 characters or more.</span>
              </label>
              <label class="field">
                <span class="field__label">Confirm<span class="field__req" aria-hidden="true">*</span></span>
                <input class="input" type="password" name="password2" required minlength="8" autocomplete="new-password">
              </label>
              <label class="field">
                <span class="field__label">Full name<span class="field__req" aria-hidden="true">*</span></span>
                <input class="input" type="text" name="name" required autocomplete="name">
              </label>
              <label class="field">
                <span class="field__label">Company or institution<span class="field__req" aria-hidden="true">*</span></span>
                <input class="input" type="text" name="company" required autocomplete="organization">
              </label>
              <label class="field field--full">
                <span class="field__label">Field of research<span class="field__req" aria-hidden="true">*</span></span>
                <select class="select" name="research-field" required>
                  <option value="">Select your field of research</option>
                  ${researchFields.map((f) => `<option>${esc(f)}</option>`).join('')}
                </select>
              </label>
            </div>
            <label class="check" style="margin:4px 0 24px">
              <input type="checkbox" name="ack-ruo" required>
              <span>I confirm materials bought on this account are for laboratory research only, and
              not for human or veterinary therapeutic use.</span>
            </label>
            <button class="btn btn--primary btn--lg btn--block" type="submit">Create account</button>
          </form>
        </div>
      </div>

      <p class="small muted center" style="margin-top:24px">
        Ordering for an organisation on net terms or account pricing?
        <a class="link" href="/wholesale/apply/">Apply for a wholesale account</a>.
      </p>
    </div>
  </div>
  <div class="auth__art on-dark">
   <div class="auth__art-inner">
    <span class="eyebrow">Why an account</span>
    <h2 style="font-size:var(--t-h2);max-width:16ch">Your documentation stays with your orders.</h2>
    <ul>
      <li>${icons.doc}<span>Certificates for every lot your organisation has received, retained after delivery.</span></li>
      <li>${icons.refresh}<span>Reorder a previous order in one action, with the same sizes and quantities.</span></li>
      <li>${icons.building}<span>Purchase orders, consolidated invoicing and account pricing for approved organisations.</span></li>
      <li>${icons.truck}<span>Tracking and delivery history recorded against each order.</span></li>
    </ul>
   </div>
  </div>
</div>`;

  return page({ title: 'Sign in', description: 'Sign in to your Purely Peptides Hub account for orders, batch documentation and account pricing.', canonical: '/login/', active: null, body });
}

module.exports = { dashboard, orders, orderDetail, login, ORDERS };
