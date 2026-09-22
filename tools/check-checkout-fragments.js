/**
 * Checkout AJAX fragment contract check.
 *
 *   node tools/check-checkout-fragments.js
 *
 * WC_AJAX::update_order_review() re-renders checkout/review-order.php and
 * checkout/payment.php on every refresh - including the one checkout.js fires
 * on page load - and hands each one to the browser as a fragment keyed by a
 * CSS selector. checkout.js applies it with $( selector ).replaceWith( html ).
 *
 * So each of those two templates must emit exactly ONE root element, that
 * element must carry the class the fragment is keyed by, and nothing the
 * template outputs may sit outside it. Break that and you get, respectively:
 *   - class missing        -> selector matches nothing, totals silently never update
 *   - class on an inner    -> the template gets nested inside itself, rendering twice
 *   - markup outside it    -> that markup is left behind as a visible duplicate
 * The second and third are what "checkout shows the same things twice" was.
 *
 * This is the cheap textual version of that rule: strip the PHP, look at the
 * HTML skeleton that is left.
 */

const fs = require('fs');
const path = require('path');

const WOO = path.join(__dirname, '..', 'wordpress', 'themes', 'pph-child', 'woocommerce', 'checkout');

const CONTRACT = [
  ['review-order.php', 'woocommerce-checkout-review-order-table'],
  ['payment.php', 'woocommerce-checkout-payment'],
];

let failed = 0;

for (const [file, cls] of CONTRACT) {
  const full = path.join(WOO, file);
  /* Strip every PHP block, then the HTML comments, leaving the raw HTML
     skeleton the template can emit. */
  const html = fs
    .readFileSync(full, 'utf8')
    .replace(/<\?php[\s\S]*?\?>/g, '')
    .replace(/<\?php[\s\S]*$/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const open = html.match(/^<([a-zA-Z]+)\b[^>]*>/);
  const fail = (why) => {
    console.error(`FAIL  ${file}: ${why}`);
    failed++;
  };

  if (!open) {
    fail('emits no root HTML element at all');
    continue;
  }
  if (!new RegExp(`\\bclass\\s*=\\s*"[^"]*\\b${cls}\\b`).test(open[0])) {
    fail(`root element <${open[1]}> does not carry class "${cls}" - the AJAX fragment selector`);
    continue;
  }
  if (html.split(cls).length - 1 !== 1) {
    fail(`class "${cls}" appears more than once - only the root element may carry it`);
    continue;
  }
  if (!new RegExp(`</${open[1]}>$`).test(html)) {
    fail(`markup sits outside the root <${open[1]}> - everything must be inside it`);
    continue;
  }
  console.log(`ok    ${file}: single <${open[1]}> root carrying .${cls}`);
}

if (failed) {
  console.error(`\n${failed} checkout template(s) break the AJAX fragment contract.`);
  process.exit(1);
}
console.log('\nCheckout fragment contract holds.');
