/* =========================================================================
   Purely Peptides - interaction layer. No dependencies.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ mega menu */

  var scrim = $('[data-scrim]');
  var openMega = null;
  var openedBy = null;   // 'hover' | 'click' - a hover-opened menu must not close on the click that follows

  function closeMega() {
    if (!openMega) return;
    var panel = $('#mega-' + openMega);
    if (panel) panel.setAttribute('data-open', 'false');
    var btn = $('[data-mega="' + openMega + '"]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (scrim) scrim.setAttribute('data-open', 'false');
    openMega = null;
    openedBy = null;
  }

  function showMega(key, source) {
    if (openMega === key) { openedBy = source; return; }
    closeMega();
    var panel = $('#mega-' + key);
    if (!panel) return;
    panel.setAttribute('data-open', 'true');
    $('[data-mega="' + key + '"]').setAttribute('aria-expanded', 'true');
    if (scrim) scrim.setAttribute('data-open', 'true');
    openMega = key;
    openedBy = source;
  }

  $$('[data-mega]').forEach(function (btn) {
    var key = btn.getAttribute('data-mega');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // Only a click can close what a click opened; a hover-opened menu stays open.
      if (openMega === key && openedBy === 'click') closeMega();
      else showMega(key, 'click');
    });
    btn.addEventListener('mouseenter', function () {
      if (window.innerWidth > 1080) showMega(key, 'hover');
    });
  });

  var nav = $('.primary-nav');
  if (nav) {
    nav.addEventListener('mouseleave', closeMega);
    nav.addEventListener('focusout', function (e) {
      if (!nav.contains(e.relatedTarget)) closeMega();
    });
  }
  if (scrim) scrim.addEventListener('click', closeMega);

  /* ----------------------------------------------------------- mobile nav */

  var mnav = $('[data-mobile-nav]');
  function setMobile(open) {
    if (!mnav) return;
    mnav.setAttribute('data-open', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    var t = $('[data-mobile-open]');
    if (t) t.setAttribute('aria-expanded', String(open));
    if (open) { var first = $('button, a', mnav); if (first) first.focus(); }
  }
  var mOpen = $('[data-mobile-open]');
  if (mOpen) mOpen.addEventListener('click', function () { setMobile(true); });
  var sOpen = $('[data-search-open]');
  if (sOpen) sOpen.addEventListener('click', function () {
    setMobile(true);
    var f = $('#m-search');
    if (f) f.focus();
  });
  var mClose = $('[data-mobile-close]');
  if (mClose) mClose.addEventListener('click', function () { setMobile(false); });

  $$('[data-mnav]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      var panel = btn.nextElementSibling;
      if (panel) panel.setAttribute('data-open', String(!open));
    });
  });

  /* ---------------------------------------------------------- cart drawer */

  var drawer = $('[data-cart-drawer]');
  function setCart(open) {
    if (!drawer) return;
    drawer.setAttribute('data-open', String(open));
    if (scrim) scrim.setAttribute('data-open', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var c = $('[data-cart-close]', drawer); if (c) c.focus(); }
  }
  $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', function () { setCart(true); }); });
  $$('[data-cart-close]').forEach(function (b) { b.addEventListener('click', function () { setCart(false); }); });
  if (scrim) scrim.addEventListener('click', function () { setCart(false); });

  /* ---------------------------------------------------------------- modal */

  var lastFocus = null;
  function setModal(key, open) {
    var m = $('[data-modal="' + key + '"]');
    if (!m) return;
    m.setAttribute('data-open', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { lastFocus = document.activeElement; var f = $('input, button', m); if (f) f.focus(); }
    else if (lastFocus) lastFocus.focus();
  }
  $$('[data-modal-open]').forEach(function (b) {
    b.addEventListener('click', function () { setModal(b.getAttribute('data-modal-open'), true); });
  });
  $$('[data-modal-close]').forEach(function (b) {
    b.addEventListener('click', function () {
      var m = b.closest('[data-modal]');
      if (m) setModal(m.getAttribute('data-modal'), false);
    });
  });
  $$('[data-modal]').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) setModal(m.getAttribute('data-modal'), false); });
  });

  /* ----------------------------------------------------------- accordions */

  function toggleDisclosure(btn) {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    var panel = btn.getAttribute('aria-controls')
      ? document.getElementById(btn.getAttribute('aria-controls'))
      : btn.nextElementSibling;
    if (panel) panel.setAttribute('data-open', String(!open));
  }
  $$('[data-acc]').forEach(function (b) { b.addEventListener('click', function () { toggleDisclosure(b); }); });
  $$('[data-fgroup]').forEach(function (b) { b.addEventListener('click', function () { toggleDisclosure(b); }); });

  /* -------------------------------------------------------- filter drawer */

  var filters = $('[data-filters]');
  function setFilters(open) {
    if (!filters) return;
    filters.setAttribute('data-open', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  $$('[data-filters-open]').forEach(function (b) { b.addEventListener('click', function () { setFilters(true); }); });
  $$('[data-filters-close]').forEach(function (b) { b.addEventListener('click', function () { setFilters(false); }); });

  /* ----------------------------------------------------------- view toggle */

  $$('[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-view');
      $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var g = $('[data-results-grid]'), l = $('[data-results-list]');
      if (g) g.hidden = mode !== 'grid';
      if (l) l.hidden = mode !== 'list';
    });
  });

  /* -------------------------------------------------------- quantity + size */

  $$('[data-qty]').forEach(function (wrap) {
    var input = $('input', wrap);
    $$('button', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var next = (parseInt(input.value, 10) || 1) + parseInt(b.getAttribute('data-step'), 10);
        input.value = Math.max(1, Math.min(999, next));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  });

  /* ------------------------------------------- price: volume + subscription

     Both discounts stack, so the panel shows each line rather than one blended
     figure. Volume is applied first, then the subscription percentage is taken
     off the already-discounted line - which is what "stacked" means here, and
     what the buyer would otherwise have to work out themselves. */

  var VOLUME_TIERS = [
    { min: 1,  max: 4,        rate: 0,    label: '1–4 vials' },
    { min: 5,  max: 9,        rate: 0.08, label: '5–9 vials' },
    { min: 10, max: Infinity, rate: 0.16, label: '10+ vials' },
  ];
  var SUB_RATE = 0.10;

  var buybox = $('.pdp__buybox');
  if (buybox) {
    var unit = parseFloat(($('[data-size][aria-pressed="true"]', buybox) || {}).getAttribute
      ? $('[data-size][aria-pressed="true"]', buybox).getAttribute('data-value')
      : 0) || 0;
    var sizeLabel = '';
    var qtyInput = $('#qty');

    function tierFor(q) {
      for (var i = 0; i < VOLUME_TIERS.length; i++) {
        if (q >= VOLUME_TIERS[i].min && q <= VOLUME_TIERS[i].max) return i;
      }
      return 0;
    }
    function money(n) { return '$' + n.toFixed(2); }

    function recalc() {
      var qty = Math.max(1, parseInt(qtyInput && qtyInput.value, 10) || 1);
      var ti = tierFor(qty);
      var tier = VOLUME_TIERS[ti];
      var subscribed = !!$('[data-buymode][value="sub"]:checked');

      $$('[data-volume] .volume__tier').forEach(function (el, i) {
        el.setAttribute('data-active', String(i === ti));
      });
      $$('[data-volume] .volume__price').forEach(function (el, i) {
        el.textContent = money(unit * (1 - VOLUME_TIERS[i].rate));
      });

      var list = unit * qty;
      var volCut = list * tier.rate;
      var afterVol = list - volCut;
      var subCut = subscribed ? afterVol * SUB_RATE : 0;
      var total = afterVol - subCut;

      var panel = $('[data-pricecalc]');
      if (panel) {
        panel.hidden = false;
        $('[data-calc-list]').textContent = money(list);
        var volRow = $('[data-calc-volrow]');
        volRow.hidden = tier.rate === 0;
        $('[data-calc-vollabel]').textContent = 'Volume discount · ' + tier.label + ' −' + Math.round(tier.rate * 100) + '%';
        $('[data-calc-vol]').textContent = '−' + money(volCut);
        var subRow = $('[data-calc-subrow]');
        subRow.hidden = !subscribed;
        $('[data-calc-sub]').textContent = '−' + money(subCut);
        $('[data-calc-totallabel]').textContent = subscribed ? 'Per delivery' : 'Total';
        $('[data-calc-total]').textContent = money(total);

        var note = $('[data-calc-note]');
        if (subscribed) {
          var weeks = ($('[data-sub-freq]') || {}).value || '8';
          note.hidden = false;
          note.textContent = 'Ships every ' + weeks + ' weeks. Both discounts applied - you save '
            + money(volCut + subCut) + ' per delivery. Change quantity, skip or cancel from your account.';
        } else if (tier.rate > 0) {
          note.hidden = false;
          note.textContent = 'Volume pricing applied. Adding Subscribe & Save takes a further 10% off this total.';
        } else {
          note.hidden = true;
        }
      }
    }

    $$('[data-size]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('[data-size]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        unit = parseFloat(btn.getAttribute('data-value'));
        sizeLabel = btn.getAttribute('data-label');
        var el = $('[data-price]'), per = $('[data-per]');
        if (el) el.textContent = money(unit);
        if (per) per.textContent = 'per ' + sizeLabel + ' vial';
        recalc();
      });
    });
    $$('[data-buymode]').forEach(function (r) { r.addEventListener('change', recalc); });
    var freq = $('[data-sub-freq]');
    if (freq) freq.addEventListener('change', recalc);
    if (qtyInput) {
      qtyInput.addEventListener('change', recalc);
      qtyInput.addEventListener('input', recalc);
    }
    // Selecting the frequency should imply the subscription, not fight it.
    if (freq) freq.addEventListener('focus', function () {
      var sub = $('[data-buymode][value="sub"]');
      if (sub && !sub.checked) { sub.checked = true; recalc(); }
    });
    recalc();
  }

  $$('.opt[data-size], .pdp__thumb').forEach(function (b) {
    if (!b.classList.contains('pdp__thumb')) return;
    b.addEventListener('click', function () {
      $$('.pdp__thumb').forEach(function (t) { t.setAttribute('aria-pressed', String(t === b)); });
    });
  });

  /* --------------------------------------------------------------- toasts */

  var toastRegion = $('[data-toasts]');
  window.PP = window.PP || {};

  function toast(message) {
    if (!toastRegion) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML =
      '<span class="toast__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg></span>' +
      '<span></span><button class="toast__close" type="button" aria-label="Dismiss">&times;</button>';
    el.querySelector('span:nth-child(2)').textContent = message;
    toastRegion.appendChild(el);
    var timer = setTimeout(remove, 5200);
    function remove() { clearTimeout(timer); if (el.parentNode) el.parentNode.removeChild(el); }
    el.querySelector('.toast__close').addEventListener('click', remove);
  }

  // store.js has no toast of its own; this is the bridge.
  window.PP.toast = toast;

  $$('[data-toast]').forEach(function (b) {
    b.addEventListener('click', function () { toast(b.getAttribute('data-toast')); });
  });

  /* Cart and wishlist behaviour live in store.js, which owns the state. */

  $$('[data-quickview]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      toast('Quick view is not wired up in this build - open the product page for full specifications.');
    });
  });

  /* ------------------------------------------------------ search suggest */

  var SUGGEST = {
    products: [
      { label: 'BPC-157', meta: '10 mg · PP-1001', href: '/products/bpc-157/' },
      { label: 'TB-500', meta: '5 mg · PP-1002', href: '/products/tb-500/' },
      { label: 'GHK-Cu', meta: '50 mg · PP-1003', href: '/products/ghk-cu/' },
      { label: 'Semax', meta: '10 mg · PP-1004', href: '/products/semax/' },
      { label: 'MOTS-c', meta: '5 mg · PP-1010', href: '/products/mots-c/' }
    ],
    documentation: [
      { label: 'Lot BP-260910', meta: 'BPC-157 · 99.4%', href: '/certificates/bp-260910/' },
      { label: 'Lot GH-260803', meta: 'GHK-Cu · 99.6%', href: '/certificates/gh-260803/' }
    ],
    research: [
      { label: 'How to read an HPLC purity result', meta: 'Methods', href: '/research/reading-an-hplc-purity-result/' },
      { label: 'What a certificate of analysis contains', meta: 'Quality', href: '/research/what-a-certificate-of-analysis-contains/' }
    ]
  };

  var input = $('[data-suggest]');
  var panel = $('#suggest-panel');

  function renderSuggest(q) {
    if (!panel) return;
    var term = q.trim().toLowerCase();
    var groups = [
      ['Products', SUGGEST.products],
      ['Documentation', SUGGEST.documentation],
      ['Research', SUGGEST.research]
    ];
    var html = '';
    groups.forEach(function (g) {
      var hits = term
        ? g[1].filter(function (i) { return (i.label + ' ' + i.meta).toLowerCase().indexOf(term) > -1; })
        : g[1].slice(0, 3);
      if (!hits.length) return;
      html += '<div class="suggest__group"><div class="suggest__label">' + g[0] + '</div>';
      hits.forEach(function (i) {
        html += '<a class="suggest__item" role="option" href="' + i.href + '"><span>' + i.label + '</span><span class="mono">' + i.meta + '</span></a>';
      });
      html += '</div>';
    });
    if (!html) {
      html = '<div class="suggest__group"><div class="suggest__item" style="color:var(--slate)">No matches. Press Enter to search everything.</div></div>';
    }
    panel.innerHTML = html;
  }

  function setSuggest(open) {
    if (!panel || !input) return;
    panel.setAttribute('data-open', String(open));
    input.setAttribute('aria-expanded', String(open));
  }

  if (input && panel) {
    input.addEventListener('focus', function () { renderSuggest(input.value); setSuggest(true); });
    input.addEventListener('input', function () { renderSuggest(input.value); setSuggest(true); });
    input.addEventListener('keydown', function (e) {
      var items = $$('.suggest__item[href]', panel);
      if (!items.length) return;
      var idx = items.findIndex(function (i) { return i.getAttribute('aria-selected') === 'true'; });
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > -1) items[idx].removeAttribute('aria-selected');
        idx = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx <= 0 ? items.length - 1 : idx - 1);
        items[idx].setAttribute('aria-selected', 'true');
        items[idx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && idx > -1) {
        e.preventDefault();
        window.location.href = items[idx].getAttribute('href');
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.searchwrap')) setSuggest(false);
    });
  }

  /* ------------------------------------------------------------- escape key */

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMega();
    setCart(false);
    setMobile(false);
    setFilters(false);
    setSuggest(false);
    $$('[data-modal][data-open="true"]').forEach(function (m) { setModal(m.getAttribute('data-modal'), false); });
  });

  /* --------------------------------------------------------- subnav spy */

  var subnavLinks = $$('[data-subnav] a');
  if (subnavLinks.length && 'IntersectionObserver' in window) {
    var sections = subnavLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          subnavLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
          });
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  var tocLinks = $$('.article__toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var heads = tocLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    var tocSpy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          tocLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
          });
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    heads.forEach(function (h) { tocSpy.observe(h); });
  }

  /* ------------------------------------------------------------ count up */

  var counters = $$('[data-count]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    var counted = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        counted.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now();
        (function tick(now) {
          var t = Math.min((now - start) / 900, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counted.observe(c); });
  }

  /* ------------------------------------------------------- hero carousel */

  var carousel = $('[data-carousel]');
  if (carousel) {
    var track = carousel.querySelector('[data-track]');
    var slides = [].slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = [].slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
    var countEl = carousel.querySelector('[data-carousel-count]');
    var index = 0;
    var timer = null;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function goTo(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = 'translateX(' + -index * 100 + '%)';
      slides.forEach(function (s, i) {
        s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
        // Links inside a hidden slide must leave the tab order too.
        [].slice.call(s.querySelectorAll('a, button')).forEach(function (el) {
          if (i === index) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === index ? 'true' : 'false'); });
      if (countEl) countEl.textContent = index + 1 + ' / ' + slides.length;
    }

    function play() {
      if (calm || timer) return;
      timer = setInterval(function () { goTo(index + 1); }, 7000);
    }
    function pause() { clearInterval(timer); timer = null; }

    carousel.querySelector('[data-carousel-prev]').addEventListener('click', function () { pause(); goTo(index - 1); });
    carousel.querySelector('[data-carousel-next]').addEventListener('click', function () { pause(); goTo(index + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { pause(); goTo(i); }); });

    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', play);
    carousel.addEventListener('focusin', pause);
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { pause(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { pause(); goTo(index + 1); }
    });
    // A carousel that keeps turning in a background tab is just wasted work.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else play();
    });

    goTo(0);
    play();
  }

  /* --------------------------------------------------- footer accordions */

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-facc]') : null;
    if (!t) return;
    t.setAttribute('aria-expanded', t.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });

  /* ------------------------------------------------------- scroll reveal */

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  if ('IntersectionObserver' in window && !calm.matches) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target); // once only - never replayed on scroll back
        });
      },
      // Fires a little before the element reaches the viewport edge, so the
      // motion has finished by the time it is properly in view.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );

    $$('[data-reveal]').forEach(function (el) {
      // Anything already on screen at load skips the animation entirely.
      // Animating it would mean animating content the user is already reading.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.classList.add('is-in');
        return;
      }
      revealObserver.observe(el);
    });

    /* Grids stagger their own children - a short cascade reads as one gesture,
       where a simultaneous fade reads as a page repaint. */
    $$('[data-reveal-stagger]').forEach(function (group) {
      var kids = [].slice.call(group.children);
      kids.forEach(function (kid, i) {
        kid.setAttribute('data-reveal', '');
        kid.style.setProperty('--reveal-delay', Math.min(i, 5) * 55 + 'ms');
        if (kid.getBoundingClientRect().top < window.innerHeight * 0.9) kid.classList.add('is-in');
        else revealObserver.observe(kid);
      });
    });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ----------------------------------------------------------- age gate */

  var KEY_AGE = 'pp.research-use-confirmed';
  var gate = $('[data-agegate]');
  if (gate) {
    var confirmed = false;
    try { confirmed = localStorage.getItem(KEY_AGE) === '1'; } catch (e) { confirmed = false; }
    if (!confirmed) {
      gate.hidden = false;
      document.body.style.overflow = 'hidden';
      var accept = $('[data-agegate-accept]', gate);
      if (accept) {
        accept.focus();
        accept.addEventListener('click', function () {
          try { localStorage.setItem(KEY_AGE, '1'); } catch (e) {}
          gate.hidden = true;
          document.body.style.overflow = '';
        });
      }
      // Trap focus: the gate is the only thing on screen, so Tab must stay in it.
      gate.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var f = $$('button, a[href]', gate);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
  }

  /* ------------------------------------------- geographic restrictions

     A handful of states are treated as restricted for shipping. The region
     the visitor picks is remembered and enforced wherever an order can be
     progressed - the cart and the checkout - rather than only warned about
     at the end, which is where it would waste the most of their time. */

  var RESTRICTED = ['CA', 'NY', 'LA'];
  var KEY_REGION = 'pp.ship-region';
  /* Destination-based rates. Real figures come from the carrier and the tax
     service; these are the shape the UI has to hold, and they are shown before
     checkout rather than revealed at it. */
  var REGIONS = {
    MA: { name: 'Massachusetts', ship: 14, tax: 0.0625 },
    TX: { name: 'Texas',         ship: 18, tax: 0.0825 },
    FL: { name: 'Florida',       ship: 18, tax: 0.06   },
    IL: { name: 'Illinois',      ship: 16, tax: 0.0625 },
    WA: { name: 'Washington',    ship: 22, tax: 0.065  },
    CA: { name: 'California',    ship: 22, tax: 0.0725 },
    NY: { name: 'New York',      ship: 16, tax: 0.08   },
    LA: { name: 'Louisiana',     ship: 18, tax: 0.0445 },
  };
  var FREE_SHIP_OVER = 250;
  var COLD_PACK = 9;

  function currentRegion() {
    try { return localStorage.getItem(KEY_REGION) || 'MA'; } catch (e) { return 'MA'; }
  }
  function money(n) { return '$' + n.toFixed(2); }

  function recalcTotals(code) {
    var r = REGIONS[code] || REGIONS.MA;
    var subEl = $('[data-sum-subtotal]');
    if (!subEl) return;
    // The live cart is the authority; the rendered figure is only a fallback
    // for the split second before store.js has run.
    var sub = (window.PP && window.PP.subtotal) ? window.PP.subtotal()
      : parseFloat(subEl.textContent.replace(/[^0-9.]/g, '')) || 0;
    subEl.textContent = money(sub);
    var ship = sub >= FREE_SHIP_OVER ? 0 : r.ship;
    var tax = +(sub * r.tax).toFixed(2);
    var total = sub + ship + COLD_PACK + tax;

    $$('[data-sum-shipping]').forEach(function (el) { el.textContent = ship === 0 ? 'Free' : money(ship); });
    $$('[data-sum-cold]').forEach(function (el) { el.textContent = money(COLD_PACK); });
    $$('[data-sum-taxrate]').forEach(function (el) { el.textContent = (r.tax * 100).toFixed(2).replace(/\.?0+$/, '') + '%'; });
    $$('[data-sum-tax]').forEach(function (el) { el.textContent = money(tax); });
    $$('[data-sum-total]').forEach(function (el) { el.textContent = money(total); });
    $$('[data-freeship]').forEach(function (el) {
      el.innerHTML = ship === 0
        ? 'Weight-based tracked despatch. <strong>Free shipping applied</strong> - this order is over $' + FREE_SHIP_OVER + '.'
        : 'Weight-based tracked despatch. Spend <strong>' + money(FREE_SHIP_OVER - sub) + '</strong> more for free shipping.';
    });
  }

  function applyRegion() {
    var code = currentRegion();
    var blocked = RESTRICTED.indexOf(code) !== -1;
    var label = (REGIONS[code] || {}).name || code;
    $$('[data-region-label]').forEach(function (el) { el.textContent = el.tagName === 'STRONG' ? code : label; });
    recalcTotals(code);
    $$('[data-region-block]').forEach(function (el) { el.hidden = !blocked; });
    $$('[data-region-gated]').forEach(function (el) {
      if (blocked) {
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('tabindex', '-1');
        if ('disabled' in el) el.disabled = true;
      } else {
        el.removeAttribute('aria-disabled');
        el.removeAttribute('tabindex');
        if ('disabled' in el) el.disabled = false;
      }
    });
  }
  $$('[data-region-set]').forEach(function (input) {
    input.addEventListener('change', function () {
      try { localStorage.setItem(KEY_REGION, input.value); } catch (e) {}
      applyRegion();
    });
    if (input.value === currentRegion()) input.checked = true;
  });
  applyRegion();
  // Totals depend on the cart as well as the destination, so a cart change
  // has to re-run the same calculation.
  window.PP.onCartChange = function () { applyRegion(); };

  /* ------------------------------------------------------- graph draw-on */

  /* Every chromatogram draws itself once, when it arrives. The class goes on
     the wrapper rather than the path so the CSS stays declarative and the
     observer never touches style properties directly. */
  var graphs = $$('[data-graph]');
  if (graphs.length) {
    if (calm.matches || !('IntersectionObserver' in window)) {
      graphs.forEach(function (g) { g.classList.add('is-drawn'); });
    } else {
      var graphObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-drawn');
            obs.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.25 }
      );
      graphs.forEach(function (g) { graphObserver.observe(g); });
    }
  }

  /* ----------------------------------------------------------- parallax

     The media box is 124% tall and offset -12%, so there is 24% of overspill
     to move through and the edges can never be exposed. Transform only - no
     layout property is touched, so this cannot shift the document and feed
     back into scroll position the way the old condensing header did.

     Work is gated on the hero actually being in view and batched into rAF, so
     scrolling the rest of the page costs nothing. */

  var hero = $('[data-vhero]');
  var media = $('[data-hero-video]');
  if (hero && media && !calm.matches) {
    var TRAVEL = 0.16;      // fraction of scroll distance the media lags behind
    var ticking = false;
    var inView = true;

    function positionMedia() {
      ticking = false;
      if (!inView) return;
      var rect = hero.getBoundingClientRect();
      // How far the hero has travelled up out of the viewport, 0 → 1.
      var progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));

      /* The budget is half the overspill - the media is centred on the frame,
         so what hangs off the top is what it can travel down before the top
         edge appears. Measured rather than assumed, so changing the CSS
         height cannot silently reintroduce the gap. */
      var budget = Math.max(0, (media.offsetHeight - rect.height) / 2);
      var shift = Math.min(progress * rect.height * TRAVEL, budget);
      media.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(positionMedia);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) onScroll();
      }, { threshold: 0 }).observe(hero);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    positionMedia();
  }

  /* --------------------------------------------------------- hero video */

  var heroVideo = $('[data-hero-video]');
  if (heroVideo) {
    function applyMotionPreference() {
      if (calm.matches) {
        heroVideo.pause();
        heroVideo.removeAttribute('autoplay');
      } else {
        var playing = heroVideo.play();
        // Autoplay can still be refused (battery saver, data saver). The
        // poster frame stays up, so there is nothing to handle but the noise.
        if (playing && playing.catch) playing.catch(function () {});
      }
    }
    applyMotionPreference();
    if (calm.addEventListener) calm.addEventListener('change', applyMotionPreference);

    // A looping video in a tab nobody is looking at is just decoding for heat.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) heroVideo.pause();
      else if (!calm.matches) { var q = heroVideo.play(); if (q && q.catch) q.catch(function () {}); }
    });
  }


  /* ------------------------------------------------------- account actions

     Reorder restores a past order into the live cart. The subscription
     controls change the card they belong to rather than only announcing a
     change - a button that claims something happened and leaves the screen
     identical is worse than no button. */

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var ro = e.target.closest('[data-reorder]');
    if (ro && window.PP && window.PP.addToCart) {
      var lines;
      try { lines = JSON.parse(ro.getAttribute('data-reorder')); } catch (err) { lines = []; }
      var added = 0;
      lines.forEach(function (l) {
        window.PP.addToCart({ slug: l.slug, size: l.size, qty: l.qty, mode: 'once', freq: null });
        added += l.qty;
      });
      toast(added
        ? 'Order ' + ro.getAttribute('data-order') + ' added to your order (' + added + (added === 1 ? ' vial)' : ' vials)')
        : 'Nothing from that order is still available');
      return;
    }

    var card = e.target.closest('.sub');
    if (!card) return;

    function weeksOut(n) {
      var d = new Date();
      d.setDate(d.getDate() + n * 7);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function reprice() {
      var qty = parseInt($('[data-sub-qtyval]', card).textContent, 10) || 1;
      var unit = parseFloat($('[data-sub-price]', card).getAttribute('data-unit')) || 0;
      var tiers = (window.PP && window.PP.VOLUME_TIERS) || [];
      var rate = 0;
      tiers.forEach(function (t) { if (qty >= t.min && qty <= t.max) rate = t.rate; });
      var sub = (window.PP && window.PP.SUB_RATE) || 0.1;
      $('[data-sub-price]', card).textContent = money(unit * qty * (1 - rate) * (1 - sub));
    }

    if (e.target.closest('[data-sub-skip]')) {
      var weeks = parseInt($('[data-sub-next]', card).getAttribute('data-sub-weeks'), 10) || 8;
      $('[data-sub-next]', card).textContent = weeksOut(weeks * 2);
      toast('Next delivery skipped. The one after it is unchanged.');
      return;
    }

    if (e.target.closest('[data-sub-qty]')) {
      var el = $('[data-sub-qtyval]', card);
      var current = parseInt(el.textContent, 10) || 1;
      var next = window.prompt('Vials per delivery', String(current));
      if (next === null) return;
      var n = Math.max(1, Math.min(999, parseInt(next, 10) || current));
      el.textContent = String(n);
      reprice();
      toast('Quantity updated to ' + n + '. Volume pricing recalculated.');
      return;
    }

    if (e.target.closest('[data-sub-toggle]')) {
      var btn = e.target.closest('[data-sub-toggle]');
      var paused = card.getAttribute('data-state') === 'paused';
      card.setAttribute('data-state', paused ? 'active' : 'paused');
      btn.textContent = paused ? 'Pause' : 'Resume';
      var status = $('.status', card);
      if (status) {
        status.className = 'status status--' + (paused ? 'ok' : 'warn');
        status.lastChild.textContent = paused ? 'Active' : 'Paused';
      }
      var label = $('[data-sub-nextlabel]', card);
      if (label) label.textContent = paused ? 'Next delivery' : 'Resumes';
      toast(paused ? 'Subscription resumed.' : 'Subscription paused. Resume any time.');
      return;
    }

    if (e.target.closest('[data-sub-cancel]')) {
      if (!window.confirm('Cancel this subscription? No further deliveries will be sent.')) return;
      card.style.transition = 'opacity 200ms var(--ease-out)';
      card.style.opacity = '0';
      setTimeout(function () {
        card.remove();
        var host = $('.subs');
        if (host && !host.children.length) {
          host.innerHTML = '<p class="muted small">No active subscriptions. Subscribe &amp; Save is offered on every product page.</p>';
        }
      }, 210);
      toast('Subscription cancelled. No further deliveries will be sent.');
    }
  });

  /* ------------------------------------------------------- sticky header */

  /* The header is sticky in CSS. Two jobs remain here:

     1. Condense it past the utility bar, so the pinned header costs ~120px of
        viewport instead of ~193px.
     2. Publish its real height as --header-h. Seven sticky sidebars, the nav
        scrim and scroll-padding-top are all calculated from that token; when
        it was hardcoded it drifted 41px out of date and anchor links landed
        underneath the header. Measuring removes that whole class of bug. */

  var header = $('[data-header]');
  if (header) {
    var lastH = 0;

    function publishHeight() {
      var h = Math.round(header.getBoundingClientRect().height);
      if (h && h !== lastH) {
        lastH = h;
        document.documentElement.style.setProperty('--header-h', h + 'px');
      }
    }

    // Measured on load and resize only - never on scroll. The header's height
    // no longer changes while scrolling, and writing a custom property on
    // every scroll event recalculates styles for every element that inherits
    // it, which is most of the page.
    publishHeight();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(publishHeight);
    window.addEventListener('load', publishHeight);
    window.addEventListener('resize', function () { lastH = 0; publishHeight(); });

    /* The pinned header gets a shadow to lift it off the content. A sentinel
       above it reports when it leaves the top of the viewport, so there is no
       scroll handler and nothing to oscillate - the shadow is paint-only and
       changes no layout, so it cannot feed back into scroll position. */
    if ('IntersectionObserver' in window) {
      var sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none';
      header.parentNode.insertBefore(sentinel, header);
      new IntersectionObserver(
        function (entries) { header.classList.toggle('is-stuck', !entries[0].isIntersecting); },
        { threshold: 0 }
      ).observe(sentinel);
    }
  }
})();
