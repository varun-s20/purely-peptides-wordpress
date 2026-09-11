'use strict';

/**
 * Transactional email templates.
 *
 * These are table-based and inline-styled on purpose - it is 2026 and Outlook
 * still renders with Word. No flexbox, no grid, no external stylesheet, no web
 * font; the brand slab is requested and Georgia catches it when it is refused.
 * Everything degrades to a single readable column at 320px.
 *
 * The page below previews all three at once so the client can approve the
 * design without an ESP account. `emailHtml()` returns a standalone document
 * ready to paste into whatever eventually sends it.
 */

const { page, esc, money } = require('../layout');
const C = require('../components');
const { icons } = require('../art');
const { brand } = require('../data');

const INK = '#071112';
const BODY = '#3B3B3B';
const MUTED = '#5C6E71';
const TEAL = '#378189';
const ORANGE = '#FF7223';
const RULE = '#D7D7D7';
const MIST = '#F6F6F4';

const SLAB = "'Rokkitt', Rockwell, Georgia, serif";
const SANS = "'Noto Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

const ORDER = {
  id: 'PP-84251',
  date: '12 September 2026',
  lines: [
    { name: 'BPC-157', sku: 'PP-1001', size: '5 mg', lot: 'BP-260910', qty: 2, unit: 46 },
    { name: 'GHK-Cu', sku: 'PP-1003', size: '50 mg', lot: 'GH-260803', qty: 1, unit: 38 },
  ],
  ship: 14,
  cold: 9,
  taxRate: 0.0625,
};
const sub = ORDER.lines.reduce((n, l) => n + l.qty * l.unit, 0);
const taxAmt = +(sub * ORDER.taxRate).toFixed(2);
const grand = sub + ORDER.ship + ORDER.cold + taxAmt;

/* ------------------------------------------------------------- primitives */

const btn = (label, href, bg = TEAL, fg = '#FFFFFF') => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
  <tr><td bgcolor="${bg}" style="border-radius:999px">
    <a href="${href}" style="display:inline-block;padding:13px 30px;font-family:${SANS};font-size:14px;font-weight:700;color:${fg};text-decoration:none;border-radius:999px">${esc(label)}</a>
  </td></tr>
</table>`;

const row = (k, v, strong) => `
<tr>
  <td style="padding:7px 0;font-family:${SANS};font-size:13px;color:${MUTED}">${k}</td>
  <td align="right" style="padding:7px 0;font-family:${SANS};font-size:13px;${strong ? `font-weight:700;color:${INK}` : `color:${INK}`}">${v}</td>
</tr>`;

const lineItems = () => ORDER.lines.map((l) => `
<tr>
  <td style="padding:14px 0;border-bottom:1px solid ${RULE}">
    <div style="font-family:${SLAB};font-size:16px;font-weight:600;color:${INK}">${esc(l.name)}</div>
    <div style="font-family:${SANS};font-size:12px;color:${MUTED};padding-top:4px">
      ${esc(l.size)} vial &middot; ${esc(l.sku)} &middot; Lot <a href="https://purelypeptides.com/certificates/${l.lot.toLowerCase()}/" style="color:${TEAL};font-weight:600">${esc(l.lot)}</a>
    </div>
  </td>
  <td align="right" valign="top" style="padding:14px 0;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:13px;color:${INK};white-space:nowrap">
    ${l.qty} &times; ${money(l.unit)}
  </td>
</tr>`).join('');

/** Shared shell: header bar, content slot, research-use footer. */
function shell(preheader, heading, intro, content) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${MIST}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MIST}">
  <tr><td align="center" style="padding:28px 12px">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#FFFFFF;border-radius:10px;overflow:hidden">

      <tr><td style="padding:22px 28px;background:${INK}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:${SLAB};font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em">
            Purely<span style="font-weight:400;color:#6DB9C1">Peptides</span>
          </td>
        </tr></table>
      </td></tr>

      <tr><td style="padding:32px 28px 8px">
        <h1 style="margin:0 0 10px;font-family:${SLAB};font-size:26px;line-height:1.15;font-weight:600;color:${INK}">${esc(heading)}</h1>
        <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${BODY}">${intro}</p>
      </td></tr>

      <tr><td style="padding:8px 28px 28px">${content}</td></tr>

      <tr><td style="padding:20px 28px;background:${MIST};border-top:1px solid ${RULE}">
        <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED}">
          <strong style="color:${INK}">Research use only.</strong> All materials supplied by ${esc(brand.legal)}
          are intended exclusively for laboratory research and in-vitro investigation by qualified professionals.
          They are not drugs, foods, cosmetics or medical devices, and are not for human or veterinary use,
          diagnostic use, or any form of consumption.
        </p>
        <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED}">
          ${brand.address.map(esc).join(', ')} &middot;
          <a href="mailto:${brand.email}" style="color:${TEAL}">${esc(brand.email)}</a> &middot;
          <a href="https://purelypeptides.com/account/" style="color:${TEAL}">Your account</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

/* ------------------------------------------------------------- templates */

const totals = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px">
  ${row('Subtotal', money(sub))}
  ${row('Shipping - tracked, domestic', money(ORDER.ship))}
  ${row('Cold-pack handling', money(ORDER.cold))}
  ${row('Tax · 6.25%', money(taxAmt))}
  <tr><td colspan="2" style="border-top:1px solid ${RULE};padding-top:4px"></td></tr>
  ${row('Total', money(grand), true)}
</table>`;

const TEMPLATES = [
  {
    key: 'confirmation',
    label: 'Order confirmation',
    when: 'Sent immediately on order placement.',
    html: shell(
      `Order ${ORDER.id} confirmed - lot documentation is attached to your account.`,
      'Your order is confirmed',
      `Thank you, Dr. Osei. Order <strong style="color:${INK}">${ORDER.id}</strong> was placed on ${ORDER.date}. Every lot below is already linked to its certificate - you can open them now, before the order ships.`,
      `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lineItems()}</table>
${totals}
${btn('View your order', 'https://purelypeptides.com/orders/pp-84251/')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EDF6F7;border-radius:6px">
  <tr><td style="padding:14px 16px;font-family:${SANS};font-size:13px;line-height:1.6;color:${BODY}">
    <strong style="color:${INK}">Lot documentation.</strong> The certificate of analysis for each lot in this
    order is retained in your account permanently, including after the lot leaves stock.
  </td></tr>
</table>`
    ),
  },
  {
    key: 'shipping',
    label: 'Shipping notification',
    when: 'Sent when the carrier scans the parcel.',
    html: shell(
      `Order ${ORDER.id} has shipped - tracking enclosed.`,
      'Your order is on its way',
      `Order <strong style="color:${INK}">${ORDER.id}</strong> left our Massachusetts facility today with cold-pack handling. Tracking is live below.`,
      `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${RULE};border-radius:6px">
  <tr><td style="padding:16px">
    <div style="font-family:${SANS};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED}">Tracking number</div>
    <div style="font-family:${SANS};font-size:18px;font-weight:700;color:${INK};padding-top:6px">1Z 999 AA1 0123 4567</div>
    <div style="font-family:${SANS};font-size:13px;color:${MUTED};padding-top:6px">Estimated delivery: 15 September 2026</div>
  </td></tr>
</table>
${btn('Track this shipment', 'https://purelypeptides.com/orders/pp-84251/', ORANGE, INK)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lineItems()}</table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${BODY}">
  <strong style="color:${INK}">On arrival:</strong> transfer to the storage condition printed on the
  vial label. Short transit at ambient temperature does not affect lyophilised material.
</p>`
    ),
  },
  {
    key: 'receipt',
    label: 'Payment receipt',
    when: 'Sent on settlement, and on every subscription renewal.',
    html: shell(
      `Receipt for order ${ORDER.id}.`,
      'Payment receipt',
      `This is your receipt for order <strong style="color:${INK}">${ORDER.id}</strong>, settled on ${ORDER.date}. Keep it for your records - a copy is always available in your account.`,
      `
${totals}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;border-top:1px solid ${RULE}">
  ${row('Paid by', 'Card ending 4242')}
  ${row('Billed to', 'Kendall Institute, Cambridge MA')}
  ${row('Purchase order', 'KI-2026-0912')}
</table>
${btn('Download receipt (PDF)', 'https://purelypeptides.com/orders/pp-84251/')}`
    ),
  },
];

/* ----------------------------------------------------------- preview page */

module.exports = function emailsPage() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Design system', href: '/styleguide/' }, { label: 'Email templates' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Internal reference</span>
    <h1>Transactional email templates</h1>
    <p>
      The three branded emails an order generates. Table-based and inline-styled so they survive
      Outlook, with the slab wordmark requested and Georgia as the fallback. Each one carries the
      research-use notice and links every lot to its certificate.
    </p>
  </div>
</div>

<div class="wrap section">
  <div class="notice" style="margin-bottom:32px">
    ${icons.info}
    <div>These render inside an iframe below exactly as an email client would receive them. Markup is
    self-contained - no external stylesheet, no web font, no script - so it can be pasted straight into
    whichever service sends it.</div>
  </div>

  <div class="emails">
    ${TEMPLATES.map(
      (tpl) => `<section class="email" id="${tpl.key}">
      <div class="email__head">
        <div>
          <h2>${esc(tpl.label)}</h2>
          <p class="small muted">${esc(tpl.when)}</p>
        </div>
        <span class="status status--flat">${icons.mail}${esc(tpl.key)}.html</span>
      </div>
      <div class="email__frame">
        <iframe title="${esc(tpl.label)} preview" loading="lazy"
                srcdoc="${tpl.html.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>
      </div>
    </section>`
    ).join('')}
  </div>
</div>`;

  return page({
    title: 'Transactional email templates',
    description: 'Branded order confirmation, shipping notification and payment receipt templates.',
    canonical: '/emails/',
    active: null,
    body,
  });
};
