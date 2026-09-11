/* =========================================================================
   Purely Peptides - cart and wishlist store.

   There is no server here, so localStorage is the whole persistence layer.
   One source of truth, one render pass; the DOM is never the state. Loaded
   after catalogue.js and before script.js, and exposes what the interaction
   layer needs on window.PP.

   A line is identified by slug + size + purchase mode + frequency, so the same
   product bought once and bought on subscription are two lines rather than one
   ambiguous one.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var CATALOGUE = window.PP_CATALOGUE || [];
  var bySlug = {};
  CATALOGUE.forEach(function (p) { bySlug[p.slug] = p; });

  /* Pricing lives here rather than in script.js so the product page and the
     cart cannot drift apart on what a discount is worth. */
  var VOLUME_TIERS = [
    { min: 1, max: 4, rate: 0, label: '1-4 vials' },
    { min: 5, max: 9, rate: 0.08, label: '5-9 vials' },
    { min: 10, max: Infinity, rate: 0.16, label: '10+ vials' }
  ];
  var SUB_RATE = 0.10;

  var KEY_CART = 'pp.cart';
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

  var cart = read(KEY_CART);
  var wish = read(KEY_WISH);

  // Drop anything whose product no longer exists, so a stale basket cannot
  // render blank rows after the catalogue changes.
  cart = cart.filter(function (l) { return bySlug[l.slug]; });
  wish = wish.filter(function (s) { return bySlug[s]; });

  function money(n) { return '$' + Number(n).toFixed(2); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function toast(msg) { if (window.PP && window.PP.toast) window.PP.toast(msg); }

  function lineId(l) { return [l.slug, l.size, l.mode, l.freq || ''].join('|'); }

  function priceOf(slug, size) {
    var p = bySlug[slug];
    if (!p) return 0;
    var s = p.sizes.filter(function (x) { return x.label === size; })[0] || p.sizes[0];
    return s ? s.price : 0;
  }
  function tierFor(q) {
    for (var i = 0; i < VOLUME_TIERS.length; i++) {
      if (q >= VOLUME_TIERS[i].min && q <= VOLUME_TIERS[i].max) return VOLUME_TIERS[i];
    }
    return VOLUME_TIERS[0];
  }
  /* Volume first, then the subscription percentage off the already-discounted
     line - the same order the product page prints, so the two agree. */
  function lineTotal(l) {
    var gross = priceOf(l.slug, l.size) * l.qty;
    var afterVolume = gross * (1 - tierFor(l.qty).rate);
    return l.mode === 'sub' ? afterVolume * (1 - SUB_RATE) : afterVolume;
  }
  function count() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function subtotal() { return cart.reduce(function (n, l) { return n + lineTotal(l); }, 0); }

  function persist() {
    write(KEY_CART, cart);
    write(KEY_WISH, wish);
    renderAll();
  }

  function addToCart(item) {
    var id = lineId(item);
    var hit = cart.filter(function (l) { return lineId(l) === id; })[0];
    if (hit) hit.qty = Math.min(999, hit.qty + item.qty);
    else cart.push(item);
    persist();
  }
  function setQty(id, qty) {
    cart.forEach(function (l) {
      if (lineId(l) === id) l.qty = Math.max(1, Math.min(999, qty || 1));
    });
    persist();
  }
  function removeLine(id) {
    cart = cart.filter(function (l) { return lineId(l) !== id; });
    persist();
  }
  function toggleWish(slug) {
    var i = wish.indexOf(slug);
    if (i === -1) wish.push(slug); else wish.splice(i, 1);
    persist();
    return wish.indexOf(slug) !== -1;
  }

  /* Paths come from the catalogue, already resolved by the build. Anything
     built here at runtime would miss the link rewriter and 404 on a flat
     file-system copy of the site. */
  function img(slug) {
    var p = bySlug[slug] || {};
    return '<img src="' + (p.img || 'img/prod-a.jpg') + '" alt="" width="900" height="900" loading="lazy" decoding="async">';
  }
  function href(slug) { return (bySlug[slug] || {}).href || '#'; }
  function modeLabel(l) {
    return l.mode === 'sub' ? 'Subscription - every ' + (l.freq || 8) + ' weeks' : 'One-time purchase';
  }

  /* ---------------------------------------------------------------- render */

  function renderBadge() {
    var n = count();
    var badge = $('[data-cart-count]');
    if (badge) { badge.textContent = String(n); badge.hidden = n === 0; }
    var btn = $('[data-cart-open]');
    if (btn) {
      btn.setAttribute('aria-label', n
        ? 'Open your order, ' + n + (n === 1 ? ' item' : ' items')
        : 'Open your order, currently empty');
    }
  }

  function renderDrawer() {
    var host = $('[data-cart-lines]');
    if (!host) return;
    host.innerHTML = cart.map(function (l) {
      var p = bySlug[l.slug];
      return '<div class="cart-line">' +
        '<div class="cart-line__media">' + img(l.slug) + '</div>' +
        '<div>' +
          '<div class="cart-line__name">' + esc(p.name) + '</div>' +
          '<div class="cart-line__meta">' + esc(l.size) + ' vial · ' + esc(p.sku) +
            (p.lot ? ' · LOT ' + esc(p.lot) : '') + '</div>' +
          '<div class="cart-line__meta">' + esc(modeLabel(l)) + '</div>' +
          '<div class="cart-line__foot">' +
            '<span class="mono small">Qty ' + l.qty + '</span>' +
            '<span class="mono">' + money(lineTotal(l)) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    var has = cart.length > 0;
    var empty = $('[data-cart-empty]', $('[data-cart-drawer]'));
    if (empty) empty.hidden = has;
    var note = $('[data-cart-docnote]');
    if (note) note.hidden = !has;
    var foot = $('.cart-drawer__foot');
    if (foot) foot.hidden = !has;
    var sub = $('[data-cart-subtotal]');
    if (sub) sub.textContent = money(subtotal());
    var word = $('[data-cart-countword]');
    if (word) word.textContent = '(' + count() + (count() === 1 ? ' item)' : ' items)');
  }

  function renderCartPage() {
    var host = $('[data-cart-rows]');
    if (!host) return;
    host.innerHTML = cart.map(function (l) {
      var p = bySlug[l.slug];
      var id = lineId(l);
      var tier = tierFor(l.qty);
      return '<div class="cart-row" data-line="' + esc(id) + '">' +
        '<div class="cart-row__media">' + img(l.slug) + '</div>' +
        '<div class="cart-row__body">' +
          '<h2 class="cart-row__name"><a href="' + href(l.slug) + '">' + esc(p.name) + '</a></h2>' +
          '<p class="cart-row__meta"><span class="mono">' + esc(p.sku) + '</span> · ' + esc(l.size) + ' vial' +
            (p.lot && p.coa ? ' · Lot <a class="link" href="' + p.coa + '">' + esc(p.lot) + '</a>' : '') +
          '</p>' +
          '<p class="cart-row__meta">' + esc(modeLabel(l)) + '</p>' +
          (tier.rate > 0
            ? '<div class="volume-note">Volume pricing applied - ' + Math.round(tier.rate * 100) + '% off at ' + esc(tier.label) + '</div>'
            : '<div class="cart-row__hint">Order 5 or more vials of this size for volume pricing</div>') +
        '</div>' +
        '<div class="cart-row__actions">' +
          '<div class="qty" data-qty-line="' + esc(id) + '">' +
            '<button type="button" aria-label="Decrease quantity" data-line-step="-1">&minus;</button>' +
            '<input type="number" value="' + l.qty + '" min="1" max="999" aria-label="Quantity for ' + esc(p.name) + '">' +
            '<button type="button" aria-label="Increase quantity" data-line-step="1">+</button>' +
          '</div>' +
          '<span class="cart-row__price">' + money(lineTotal(l)) + '</span>' +
          '<button class="btn-text" type="button" data-line-remove="' + esc(id) + '">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');

    var empty = $('[data-cart-empty]', $('.cart'));
    if (empty) empty.hidden = cart.length > 0;
    var aside = $('.cart .checkout__summary');
    if (aside) aside.hidden = cart.length === 0;
    var extra = $('[data-cart-extras]');
    if (extra) extra.hidden = cart.length === 0;

    var line = $('[data-cart-summaryline]');
    if (line) {
      line.textContent = cart.length
        ? cart.length + (cart.length === 1 ? ' material · ' : ' materials · ') +
          count() + (count() === 1 ? ' vial. ' : ' vials. ') +
          'Documentation for each lot is attached automatically.'
        : 'Nothing in your order yet.';
    }
  }

  function renderCheckout() {
    var host = $('[data-checkout-lines]');
    if (!host) return;
    host.innerHTML = cart.map(function (l) {
      var p = bySlug[l.slug];
      return '<div class="cart-line">' +
        '<div class="cart-line__media">' + img(l.slug) + '</div>' +
        '<div>' +
          '<div class="cart-line__name">' + esc(p.name) + '</div>' +
          '<div class="cart-line__meta">' + esc(l.size) + ' vial · Qty ' + l.qty + '</div>' +
          '<div class="cart-line__foot">' +
            '<span class="mono small">' + esc(modeLabel(l)) + '</span>' +
            '<span class="mono">' + money(lineTotal(l)) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Nothing to check out: send the buyer back rather than showing a $0 form.
    var guard = $('[data-checkout-empty]');
    var form = $('[data-checkout-form]');
    if (guard) guard.hidden = cart.length > 0;
    if (form) form.hidden = cart.length === 0;
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

  function renderAll() {
    renderBadge();
    renderDrawer();
    renderCartPage();
    renderCheckout();
    renderWishlist();
    if (window.PP && window.PP.onCartChange) window.PP.onCartChange(subtotal(), count());
  }

  /* ------------------------------------------------------------- behaviour */

  /* What the product page currently has selected. Read at click time rather
     than tracked, so it cannot fall out of step with the controls. */
  function selection() {
    var sizeBtn = $('[data-size][aria-pressed="true"]') || $('[data-size]');
    var qtyEl = $('#qty');
    var subEl = $('[data-buymode][value="sub"]');
    var freqEl = $('[data-sub-freq]');
    var subscribed = !!(subEl && subEl.checked);
    return {
      size: sizeBtn ? sizeBtn.getAttribute('data-label') : null,
      qty: qtyEl ? Math.max(1, parseInt(qtyEl.value, 10) || 1) : 1,
      mode: subscribed ? 'sub' : 'once',
      freq: subscribed && freqEl ? parseInt(freqEl.value, 10) : null
    };
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var add = e.target.closest('[data-add-to-order]');
    if (add) {
      var slug = add.getAttribute('data-slug');
      var p = bySlug[slug];
      if (!p) return;
      // A card's button has no size control beside it, so it takes the default.
      var quick = add.hasAttribute('data-quick');
      var sel = selection();
      var size = quick || !sel.size ? p.sizes[0].label : sel.size;
      var qty = quick ? 1 : sel.qty;
      addToCart({
        slug: slug, size: size, qty: qty,
        mode: quick ? 'once' : sel.mode,
        freq: quick ? null : sel.freq
      });
      toast(p.name + ' added to your order (' + qty + ')');
      return;
    }

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

    var wa = e.target.closest('[data-wish-add]');
    if (wa) {
      var as = wa.getAttribute('data-wish-add');
      var ap = bySlug[as];
      if (!ap) return;
      addToCart({ slug: as, size: ap.sizes[0].label, qty: 1, mode: 'once', freq: null });
      toast(ap.name + ' added to your order');
      return;
    }

    var rm = e.target.closest('[data-line-remove]');
    if (rm) { removeLine(rm.getAttribute('data-line-remove')); toast('Removed from your order'); return; }

    var step = e.target.closest('[data-line-step]');
    if (step) {
      var wrap = step.closest('[data-qty-line]');
      var input = $('input', wrap);
      setQty(wrap.getAttribute('data-qty-line'),
        (parseInt(input.value, 10) || 1) + parseInt(step.getAttribute('data-line-step'), 10));
    }
  });

  document.addEventListener('change', function (e) {
    var wrap = e.target.closest ? e.target.closest('[data-qty-line]') : null;
    if (!wrap) return;
    setQty(wrap.getAttribute('data-qty-line'), parseInt(e.target.value, 10) || 1);
  });

  // Shared across tabs: a change in one window must show in the others.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY_CART && e.key !== KEY_WISH) return;
    cart = read(KEY_CART).filter(function (l) { return bySlug[l.slug]; });
    wish = read(KEY_WISH).filter(function (s) { return bySlug[s]; });
    renderAll();
  });

  window.PP = window.PP || {};
  window.PP.VOLUME_TIERS = VOLUME_TIERS;
  window.PP.SUB_RATE = SUB_RATE;
  window.PP.subtotal = subtotal;
  window.PP.count = count;
  window.PP.render = renderAll;
  window.PP.clearCart = function () { cart = []; persist(); };
  window.PP.addToCart = addToCart;

  renderAll();
  document.addEventListener('DOMContentLoaded', renderAll);
})();
