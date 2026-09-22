/* =========================================================================
   Purely Peptides - wishlist store.

   Wishlist is a legitimate client-only feature - there is no server concept
   of "save for later" to wire it to - so it stays on localStorage exactly as
   before. Cart moved out of this file entirely: it is a real WooCommerce cart
   now (see public/js/cart.js), and a save-for-later list has no business
   sharing state or a render pass with real order data.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var CATALOGUE = window.PP_CATALOGUE || [];
  var bySlug = {};
  CATALOGUE.forEach(function (p) { bySlug[p.slug] = p; });

  var KEY_WISH = 'pp.wishlist';

  function read(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  var wish = read(KEY_WISH).filter(function (s) { return bySlug[s]; });

  function money(n) { return '$' + Number(n).toFixed(2); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function toast(msg) { if (window.PP && window.PP.toast) window.PP.toast(msg); }
  function href(slug) { return (bySlug[slug] || {}).href || '#'; }
  function img(slug) {
    var p = bySlug[slug] || {};
    return '<img src="' + (p.img || 'img/prod-a.jpg') + '" alt="" width="900" height="900" loading="lazy" decoding="async">';
  }

  function persist() {
    write(KEY_WISH, wish);
    renderWishlist();
  }

  function toggleWish(slug) {
    var i = wish.indexOf(slug);
    if (i === -1) wish.push(slug); else wish.splice(i, 1);
    persist();
    return wish.indexOf(slug) !== -1;
  }

  function renderWishlist() {
    $$('[data-wish-toggle]').forEach(function (b) {
      var slug = b.getAttribute('data-wish-toggle');
      var on = wish.indexOf(slug) !== -1;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-saved', on);
      var name = b.getAttribute('data-wish-label') || 'this material';
      b.setAttribute('aria-label', (on ? 'Remove ' + name + ' from your wishlist' : 'Save ' + name + ' to your wishlist'));
    });

    var count = $('[data-wish-count]');
    if (count) { count.textContent = String(wish.length); count.hidden = wish.length === 0; }

    var host = $('[data-wish-list]');
    if (!host) return;
    host.innerHTML = wish.map(function (slug) {
      var p = bySlug[slug];
      if (!p) return '';
      var size = p.sizes[0];
      return '<article class="wishrow">' +
        '<div class="wishrow__media">' + img(slug) + '</div>' +
        '<div class="wishrow__body">' +
          '<h3 class="wishrow__name"><a href="' + href(slug) + '">' + esc(p.name) + '</a></h3>' +
          '<p class="wishrow__meta"><span class="mono">' + esc(p.sku) + '</span> · from ' +
            money(size.price) + ' per ' + esc(size.label) + ' vial</p>' +
        '</div>' +
        '<div class="wishrow__actions">' +
          '<button class="btn btn--secondary btn--sm" type="button" data-wish-add="' + esc(slug) + '">Add to order</button>' +
          '<button class="btn-text" type="button" data-wish-remove="' + esc(slug) + '">Remove</button>' +
        '</div>' +
      '</article>';
    }).join('');
    var empty = $('[data-wish-empty]');
    if (empty) empty.hidden = wish.length > 0;
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var wt = e.target.closest('[data-wish-toggle]');
    if (wt) {
      var ws = wt.getAttribute('data-wish-toggle');
      var on = toggleWish(ws);
      toast((bySlug[ws] ? bySlug[ws].name : 'Material') +
        (on ? ' saved to your wishlist' : ' removed from your wishlist'));
      return;
    }

    var wr = e.target.closest('[data-wish-remove]');
    if (wr) {
      var rs = wr.getAttribute('data-wish-remove');
      toggleWish(rs);
      toast((bySlug[rs] ? bySlug[rs].name : 'Material') + ' removed from your wishlist');
      return;
    }

    /* "Add to order" from a saved wishlist row hands off to the real cart -
       cart.js owns [data-add-to-order] everywhere else, so this dispatches
       the same request rather than duplicating add-to-cart logic here. */
    var wa = e.target.closest('[data-wish-add]');
    if (wa) {
      var as = wa.getAttribute('data-wish-add');
      var ap = bySlug[as];
      if (!ap || !window.PP || !window.PP.addToCart) return;
      window.PP.addToCart({ productId: ap.id, variationId: ap.leadVariationId, quantity: 1 });
      return;
    }
  });

  window.addEventListener('storage', function (e) {
    if (e.key !== KEY_WISH) return;
    wish = read(KEY_WISH).filter(function (s) { return bySlug[s]; });
    renderWishlist();
  });

  window.PP = window.PP || {};
  window.PP.wishlistCount = function () { return wish.length; };

  renderWishlist();
  document.addEventListener('DOMContentLoaded', renderWishlist);
})();
