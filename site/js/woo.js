/* =========================================================================
   Purely Peptides - WooCommerce glue.

   The product page's size picker, quantity stepper and price panel are the
   static build's own markup, driven by script.js exactly as before. This file
   does the one thing script.js cannot know about: keeping the real
   WooCommerce form's hidden inputs in step with the chosen size, so the
   variation that gets added to the cart is the one shown on screen.

   Deliberately small. If this grows past syncing form state, the logic
   probably belongs in script.js or in PHP instead.
   ========================================================================= */
(function () {
  'use strict';

  var form = document.querySelector('[data-pph-cart]');
  if (!form) return;

  var variationInput = form.querySelector('[data-pph-variation]');
  var attrInput = form.querySelector('[data-pph-attr]');
  if (!variationInput || !attrInput) return;

  function sync(btn) {
    var id = btn.getAttribute('data-variation-id');
    var label = btn.getAttribute('data-label');
    if (id) variationInput.value = id;
    if (label) attrInput.value = label;
  }

  Array.prototype.forEach.call(form.querySelectorAll('[data-size]'), function (btn) {
    btn.addEventListener('click', function () { sync(btn); });
  });

  /* A size the client has not restocked yet can still be ordered - the static
     build labelled those "To order" rather than disabling them - so this only
     guards against submitting with nothing selected at all, which should not
     be reachable since one size is always pre-selected server-side. */
  form.addEventListener('submit', function (e) {
    if (!variationInput.value) {
      e.preventDefault();
      var first = form.querySelector('[data-size]');
      if (first) { sync(first); form.submit(); }
    }
  });
})();
