/* =========================================================================
   Purely Peptides - form validation.

   The markup already declares what it needs (required, type=email, pattern,
   minlength), so this reads the constraints off the DOM rather than keeping a
   second schema in step with it. Native validity does the checking; this layer
   exists to place the message next to the field, manage focus, and summarise -
   which the browser's own bubble does not do well and cannot be styled.

   Forms opt in with data-validate. On success they run data-success (a toast)
   and, if declared, data-success-action.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var ALERT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>';

  function fieldOf(el) { return el.closest('.field') || el.closest('.check') || el.parentElement; }
  function labelOf(el) {
    var f = fieldOf(el);
    var l = f && (f.querySelector('.field__label') || f.querySelector('span'));
    // strip the required asterisk so messages do not read "Email address* is required"
    return l ? l.textContent.replace(/\*/g, '').trim() : (el.getAttribute('aria-label') || 'This field');
  }

  /* A message that says what to do, not what the state is. */
  function messageFor(el) {
    var v = el.validity;
    var name = labelOf(el);
    if (v.valueMissing) {
      if (el.type === 'checkbox') return 'Please confirm this to continue.';
      if (el.tagName === 'SELECT') return 'Choose an option.';
      return 'Enter ' + name.toLowerCase() + '.';
    }
    if (v.typeMismatch && el.type === 'email') return 'Enter a complete email address, including the @.';
    if (v.typeMismatch && el.type === 'url') return 'Enter a full web address.';
    if (v.patternMismatch) return el.getAttribute('data-pattern-message') || 'Check the format of this entry.';
    if (v.tooShort) return 'Use at least ' + el.minLength + ' characters.';
    if (v.rangeUnderflow) return 'Enter ' + el.min + ' or more.';
    if (v.rangeOverflow) return 'Enter ' + el.max + ' or less.';
    return 'Check this entry.';
  }

  function clearError(el) {
    var f = fieldOf(el);
    if (!f) return;
    f.classList.remove('field--error');
    var msg = f.querySelector('[data-error-for]');
    if (msg) msg.remove();
    el.removeAttribute('aria-invalid');
    var d = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x.indexOf('err-auto-') !== 0; });
    if (d.length) el.setAttribute('aria-describedby', d.join(' '));
    else el.removeAttribute('aria-describedby');
  }

  var uid = 0;
  function showError(el, text) {
    var f = fieldOf(el);
    if (!f) return;
    clearError(el);
    f.classList.add('field--error');
    var id = 'err-auto-' + (++uid);
    var span = document.createElement('span');
    span.className = 'field__error';
    span.id = id;
    span.setAttribute('data-error-for', '');
    span.innerHTML = ALERT + ' ' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    // after the control, before any hint, so the error reads first
    var hint = f.querySelector('.field__hint');
    if (hint) f.insertBefore(span, hint); else f.appendChild(span);
    el.setAttribute('aria-invalid', 'true');
    var d = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    d.push(id);
    el.setAttribute('aria-describedby', d.join(' '));
  }

  function controls(form) {
    return $$('input, select, textarea', form).filter(function (el) {
      return !el.disabled && el.type !== 'hidden' && el.type !== 'submit' && el.type !== 'button';
    });
  }

  function summaryFor(form) {
    var box = $('[data-form-summary]', form);
    if (box) return box;
    box = document.createElement('div');
    box.className = 'formsummary';
    box.setAttribute('data-form-summary', '');
    box.setAttribute('role', 'alert');
    box.hidden = true;
    form.insertBefore(box, form.firstChild);
    return box;
  }

  function validate(form, opts) {
    var bad = [];
    controls(form).forEach(function (el) {
      if (el.checkValidity()) { clearError(el); return; }
      showError(el, messageFor(el));
      bad.push(el);
    });

    var box = summaryFor(form);
    if (!bad.length) { box.hidden = true; box.textContent = ''; return []; }

    if (opts && opts.summarise) {
      box.hidden = false;
      box.innerHTML = '<strong>' + bad.length +
        (bad.length === 1 ? ' field needs attention' : ' fields need attention') +
        '</strong> before this can be submitted.';
      // The summary sits above the form, so send the user to the first problem
      // rather than making them hunt for it.
      try { bad[0].focus({ preventScroll: true }); } catch (e) { bad[0].focus(); }
      var f = fieldOf(bad[0]);
      if (f && f.scrollIntoView) f.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    return bad;
  }

  $$('form[data-validate]').forEach(function (form) {
    // Native bubbles are unstyleable and vanish on scroll; we render our own.
    form.setAttribute('novalidate', '');

    // Re-check a field once it has been corrected, but never before the user
    // has had a chance to finish it - errors that appear mid-typing are noise.
    form.addEventListener('input', function (e) {
      var el = e.target;
      if (!el.matches || !el.matches('input, select, textarea')) return;
      if (fieldOf(el) && fieldOf(el).classList.contains('field--error') && el.checkValidity()) clearError(el);
    });
    form.addEventListener('change', function (e) {
      var el = e.target;
      if (!el.matches || !el.matches('input, select, textarea')) return;
      if (fieldOf(el) && fieldOf(el).classList.contains('field--error') && el.checkValidity()) clearError(el);
    });

    /* Which control submitted matters: a draft button carries formnovalidate
       and must skip the check entirely. e.submitter is not in every engine we
       support, so the last-clicked button is tracked as a fallback. */
    var lastSubmitter = null;
    form.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button, input[type="submit"]');
      if (b && form.contains(b)) lastSubmitter = b;
    }, true);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitter = e.submitter || lastSubmitter;
      lastSubmitter = null;

      if (submitter && submitter.hasAttribute('formnovalidate')) {
        // A draft is allowed to be incomplete; clear anything already flagged.
        controls(form).forEach(clearError);
        summaryFor(form).hidden = true;
        var draftMsg = submitter.getAttribute('data-toast');
        if (draftMsg && window.PP && window.PP.toast) window.PP.toast(draftMsg);
        return;
      }

      var bad = validate(form, { summarise: true });
      if (bad.length) return;

      var box = summaryFor(form);
      box.hidden = true;

      var msg = form.getAttribute('data-success');
      if (msg && window.PP && window.PP.toast) window.PP.toast(msg);

      var action = form.getAttribute('data-success-action');
      if (action === 'clear-cart' && window.PP && window.PP.clearCart) {
        window.PP.clearCart();
        var done = $('[data-order-placed]');
        if (done) {
          done.hidden = false;
          form.hidden = true;
          done.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      } else if (action === 'reset') {
        form.reset();
      }
    });
  });

  /* ------------------------------------------------------------------ tabs
     A [role=tablist] whose buttons carry data-tab swaps the sibling
     [data-panel] of the same name. The search page wires its own scope tabs
     against the result set; this is for the static case, where the only job
     is showing one panel and hiding the rest. */
  $$('[data-tabs]').forEach(function (root) {
    var tabs = $$('[data-tab]', root);
    var panels = $$('[data-panel]', root);
    if (!tabs.length || !panels.length) return;

    // The heading belongs outside the panels so the page keeps one h1; it
    // takes its text from the active tab rather than contradicting it.
    var heading = $('[data-tab-title]', root.parentElement || root);

    function select(key) {
      var active = null;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === key;
        if (on) active = t;
        t.setAttribute('aria-selected', String(on));
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== key; });
      if (heading && active) heading.textContent = active.textContent.trim();
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { select(t.getAttribute('data-tab')); });
    });
    select((tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0])
      .getAttribute('data-tab'));
  });

})();
