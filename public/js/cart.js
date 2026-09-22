/* =========================================================================
   Purely Peptides - the real cart.

   Everything the static build's store.js used to do for the cart (badge,
   drawer, cart-page rows, remove, quantity) now happens against a real
   WooCommerce cart through the small REST API in inc/cart-api.php, instead of
   localStorage. The markup this writes into the page is the server's own
   `.cart-line` / `.cart-row` HTML, unchanged from the static design - only
   the data source moved.

   PPH_CART is localised by functions.php: { restUrl, nonce }.
   ========================================================================= */
(function () {
  'use strict';

  /* Guards against this file executing twice on one page - a caching/
     minification layer on the live host duplicating the <script> tag is a
     real failure mode (WP only enqueues it once; a proxy or cache combining
     assets can still print it twice), and a second run means a second
     `document.addEventListener('click', ...)` below - every add-to-cart and
     every toast then fires twice per click. */
  if (window.PPH_LOADED && window.PPH_LOADED.cart) return;
  (window.PPH_LOADED = window.PPH_LOADED || {}).cart = true;

  if (typeof window.PPH_CART === 'undefined') return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function toast(msg) { if (window.PP && window.PP.toast) window.PP.toast(msg); }
  function openDrawer() { if (window.PP && window.PP.openCart) window.PP.openCart(true); }

  function request(path, body) {
    var opts = {
      method: body ? 'POST' : 'GET',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window.PPH_CART.nonce }
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(window.PPH_CART.restUrl + path, opts).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.message || 'Something went wrong with your order.');
        // See inc/cart-api.php's pph_cart_payload() - a cached page can only
        // ever hand this file a stale nonce, so every response's own fresh
        // one replaces it before the next request needs it.
        if (data.nonce) window.PPH_CART.nonce = data.nonce;
        return data;
      });
    });
  }

  /* --------------------------------------------------------------- render */

  function applyState(state) {
    var badge = $('[data-cart-count]');
    if (badge) { badge.textContent = String(state.count); badge.hidden = state.count === 0; }
    var openBtn = $('[data-cart-open]');
    if (openBtn) {
      openBtn.setAttribute('aria-label', state.count
        ? 'Open your order, ' + state.count + (state.count === 1 ? ' item' : ' items')
        : 'Open your order, currently empty');
    }

    var linesHost = $('[data-cart-lines]');
    if (linesHost) linesHost.innerHTML = state.linesHtml;

    var drawer = $('[data-cart-drawer]');
    var empty = drawer ? $('[data-cart-empty]', drawer) : null;
    if (empty) empty.hidden = !state.isEmpty;
    var note = $('[data-cart-docnote]');
    if (note) note.hidden = state.isEmpty;
    var foot = $('.cart-drawer__foot');
    if (foot) foot.hidden = state.isEmpty;
    var subtotalEl = $('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.innerHTML = state.subtotal;
    var word = $('[data-cart-countword]');
    if (word) word.textContent = '(' + state.count + (state.count === 1 ? ' item)' : ' items)');

    var rowsHost = $('[data-cart-rows]');
    if (rowsHost) {
      rowsHost.innerHTML = state.rowsHtml;
      var cartEmpty = $('[data-cart-empty]', $('.cart'));
      if (cartEmpty) cartEmpty.hidden = !state.isEmpty;
      var aside = $('.cart .checkout__summary');
      if (aside) aside.hidden = state.isEmpty;
      var line = $('[data-cart-summaryline]');
      if (line) {
        line.textContent = state.isEmpty
          ? 'Nothing in your order yet.'
          : state.count + (state.count === 1 ? ' vial. ' : ' vials. ') +
            'Documentation for each lot is attached automatically.';
      }
    }

    var checkoutLines = $('[data-checkout-lines]');
    if (checkoutLines) {
      checkoutLines.innerHTML = state.linesHtml;
      var guard = $('[data-checkout-empty]');
      var form = $('[data-checkout-form]');
      if (guard) guard.hidden = !state.isEmpty;
      if (form) form.hidden = state.isEmpty;
    }
  }

  /* Every cart action below (refresh/add/update/remove/restore) is its own
     independent fetch, and nothing stops two of them being in flight at once
     - the page-load refresh() and a click on "Add to order" a moment later,
     for instance. Network responses do not have to arrive in the order they
     were sent; if an OLDER request's response arrives after a NEWER one's,
     applying it blindly overwrites the correct, current state with a stale
     one - the exact bug this was: the badge visibly increments on a real add,
     then reverts because a leftover refresh() response from page load shows
     up a moment later still describing the cart from before that add.
     nextCartRequest()/isCurrentCartRequest() is "last request wins, not last
     response": each call below stamps its own sequence number before firing,
     and only applies its response if nothing newer has started since. */
  var cartRequestSeq = 0;
  function nextCartRequest() { return ++cartRequestSeq; }
  function isCurrentCartRequest( seq ) { return seq === cartRequestSeq; }

  function refresh() {
    var seq = nextCartRequest();
    return request('cart').then(function (state) {
      if (isCurrentCartRequest(seq)) applyState(state);
      return state;
    }).catch(function () { /* stale UI beats a broken page */ });
  }

  /* ------------------------------------------------------------ mutations */

  /* public/js/catalog.js's bulk "quick order" paste feature still calls
     window.PP.addToCart with the static build's original {slug, size, qty}
     shape - untouched, since it needs no other change. Resolving that shape
     into real IDs here, in the one function everything funnels through,
     means every caller keeps working without hunting down each one. */
  function resolveLegacyItem(item) {
    if (item.productId) return item;
    var entry = (window.PP_CATALOGUE || []).filter(function (p) { return p.slug === item.slug; })[0];
    if (!entry) return null;
    var size = entry.sizes.filter(function (s) { return s.label === item.size; })[0] || entry.sizes[0];
    return { productId: entry.id, variationId: size.variationId, quantity: item.qty || item.quantity || 1 };
  }

  function addToCart(item) {
    var resolved = resolveLegacyItem(item);
    if (!resolved) return Promise.reject(new Error('That item is no longer available.'));
    var seq = nextCartRequest();
    return request('cart/add', {
      productId: resolved.productId,
      variationId: resolved.variationId || 0,
      quantity: resolved.quantity || 1
    }).then(function (state) {
      if (isCurrentCartRequest(seq)) applyState(state);
      return state;
    });
  }
  window.PP = window.PP || {};
  window.PP.addToCart = addToCart;

  function updateQty(key, qty) {
    var seq = nextCartRequest();
    return request('cart/update', { key: key, quantity: qty }).then(function (state) {
      if (isCurrentCartRequest(seq)) applyState(state);
    }).catch(function (e) {
      toast(e.message);
      refresh();
    });
  }
  function removeLine(key) {
    var seq = nextCartRequest();
    return request('cart/remove', { key: key }).then(function (state) {
      if (isCurrentCartRequest(seq)) applyState(state);
    });
  }

  /* --------------------------------------------------------- saved orders */

  function saveOrder() {
    return request('cart/save', {});
  }
  function restoreSavedOrder(id) {
    var seq = nextCartRequest();
    return request('cart/saved/restore', { id: id }).then(function (state) {
      if (isCurrentCartRequest(seq)) applyState(state);
      return state;
    });
  }
  function removeSavedOrder(id) {
    return request('cart/saved/remove', { id: id });
  }

  /* ---------------------------------------------------------------- events */

  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('[data-pph-cart]');
    if (!form) return;
    e.preventDefault();

    var variationInput = form.querySelector('[data-pph-variation]');
    var qtyInput = form.querySelector('input[name="quantity"]');
    var productId = parseInt(form.querySelector('input[name="add-to-cart"]').value, 10);
    var variationId = variationInput ? parseInt(variationInput.value, 10) : 0;
    var quantity = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Adding…'; }

    addToCart({ productId: productId, variationId: variationId, quantity: quantity })
      .then(function () {
        toast('Added to your order');
        openDrawer();
      })
      .catch(function (e) { toast(e.message); })
      .then(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
      });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    /* Product/category cards, and the product page's subnav quick-add - a
       plain button, not the buybox form above, so it is handled separately.
       Cards have no size control of their own, so they add the lead
       (cheapest in-stock) variation the catalogue already picked. */
    var add = e.target.closest('[data-add-to-order]');
    if (add && !add.closest('[data-pph-cart]')) {
      var slug = add.getAttribute('data-slug');
      var entry = (window.PP_CATALOGUE || []).filter(function (p) { return p.slug === slug; })[0];
      if (!entry) return;
      addToCart({ productId: entry.id, variationId: entry.leadVariationId, quantity: 1 })
        .then(function () {
          toast((entry.name || 'Item') + ' added to your order');
          openDrawer();
        })
        .catch(function (err) { toast(err.message); });
      return;
    }

    var rm = e.target.closest('[data-line-remove]');
    if (rm) {
      /* Same success/failure split as the add-to-order handler above - without
         the .catch, a failed request (stale nonce on a cached page, a network
         blip) rejected silently: nothing was removed, no error shown, and the
         button looked like it just did not work. */
      removeLine(rm.getAttribute('data-line-remove'))
        .then(function () { toast('Removed from your order'); })
        .catch(function (err) { toast(err.message); refresh(); });
      return;
    }

    var step = e.target.closest('[data-line-step]');
    if (step) {
      var wrap = step.closest('[data-qty-line]');
      var input = $('input', wrap);
      var next = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(step.getAttribute('data-line-step'), 10));
      input.value = next;
      updateQty(wrap.getAttribute('data-qty-line'), next);
      return;
    }

    /* /cart/'s "Save this order" - real account storage now (inc/cart-api.php),
       not the static build's fake toast. The button only renders for a
       signed-in visitor (cart.php checks is_user_logged_in() server-side,
       same gate checkout itself already uses) - a guest sees a "Sign in to
       save this order" link instead, so this handler never has to guess
       whether it will be allowed. */
    var save = e.target.closest('[data-save-order]');
    if (save) {
      saveOrder()
        .then(function () { toast('Order saved to your account. Find it on your account page.'); })
        .catch(function (err) { toast(err.message); });
      return;
    }

    /* Account page's Saved orders section (inc/account.php) - restore adds
       every line back into the live cart via the same applyState() the rest
       of the cart uses, so the drawer/badge update immediately; remove drops
       the row from the page without a full reload. */
    var restore = e.target.closest('[data-saved-restore]');
    if (restore) {
      restoreSavedOrder(restore.getAttribute('data-saved-restore'))
        .then(function (state) {
          var note = state.skipped
            ? state.added + (state.added === 1 ? ' item' : ' items') + ' added - ' + state.skipped + (state.skipped === 1 ? ' line is' : ' lines are') + ' no longer available.'
            : 'Saved order added to your cart.';
          toast(note);
          openDrawer();
        })
        .catch(function (err) { toast(err.message); });
      return;
    }

    var removeSaved = e.target.closest('[data-saved-remove]');
    if (removeSaved) {
      var row = removeSaved.closest('[data-saved-order]');
      removeSavedOrder(removeSaved.getAttribute('data-saved-remove'))
        .then(function () {
          if (row && row.parentNode) row.parentNode.removeChild(row);
          toast('Saved order removed.');
        })
        .catch(function (err) { toast(err.message); });
    }
  });

  document.addEventListener('change', function (e) {
    var wrap = e.target.closest ? e.target.closest('[data-qty-line]') : null;
    if (!wrap) return;
    updateQty(wrap.getAttribute('data-qty-line'), Math.max(1, parseInt(e.target.value, 10) || 1));
  });

  /* One refresh() call, not two. This file is loaded with `defer` (see
     functions.php), which guarantees it runs after the DOM is parsed but
     BEFORE the DOMContentLoaded event fires - so a `DOMContentLoaded`
     listener registered here always catches an event that has not fired
     yet, and always runs a moment after this same refresh() already did.
     That second, redundant GET was the other half of the race explained
     above: nothing on the page changes between "this script ran" and "the
     DOMContentLoaded event fires" that would justify asking the server
     again, and every extra in-flight request is one more chance for a
     stale response to arrive late. */
  refresh();
})();
