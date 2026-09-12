'use strict';

const { page, esc } = require('../layout');
const C = require('../components');
const { icons, photo } = require('../art');

/* ------------------------------------------------------------- wholesale */

function wholesale() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Wholesale' }])}

<section class="hero" style="border-bottom:1px solid var(--rule)">
  <div class="wrap hero__inner" style="padding-block:64px 72px">
    <div class="hero__copy">
      <span class="eyebrow">For labs &amp; procurement teams</span>
      <h1 class="hero__title" style="font-size:var(--t-h1)">Research procurement at scale.</h1>
      <p class="hero__lede">
        Approved research organisations order on account with bulk quantities, consolidated invoicing
        and a named contact who knows your standing catalogue.
      </p>
      <div class="hero__cta">
        <a class="btn btn--primary btn--lg" href="/wholesale/apply/">Apply for a wholesale account</a>
        <a class="btn btn--secondary btn--lg" href="/contact/?topic=wholesale">Contact procurement support</a>
      </div>
    </div>
    <div class="hero__figure">
      <div class="hero__frame">${photo('hero-wholesale', 'Laboratory shelving stocked with glassware and reagents', 1400, 875)}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${C.sectionHead({ title: 'What an account changes', body: 'Ordering, documentation and payment terms adapt to institutional purchasing.' })}
    <div class="grid grid-3">
      ${[
        ['Tiered pricing', 'Rates are applied automatically at checkout based on your account tier and order volume. No quote request needed for standard catalogue items.', icons.chart],
        ['Bulk quantities', 'Gram-scale fills and quantities beyond the published sizes are quoted directly, with the same lot documentation as catalogue material.', icons.box],
        ['Purchase orders', 'Order against a PO with net terms. Invoices are issued per order or consolidated monthly.', icons.doc],
        ['Order history', 'Complete reorder history retained against the organisation rather than the individual, so team changes do not lose it.', icons.refresh],
        ['Documentation access', 'Certificates for every lot your organisation has received stay retrievable from the account.', icons.checkCircle],
        ['Named contact', 'Specification and supply questions go to a person who already knows your catalogue.', icons.user],
      ]
        .map(
          ([t, b, icon]) => `<div class="icard">
        <div style="color:var(--verdigris)">${icon}</div>
        <h3>${esc(t)}</h3><p>${esc(b)}</p>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--mist">
  <div class="wrap">
    ${C.sectionHead({ title: 'Volume pricing', body: 'Indicative tiers for catalogue materials. Exact rates are confirmed on account approval.' })}
    <table class="dtable dtable--zebra dtable--stack" style="max-width:840px">
      <thead><tr><th>Tier</th><th>Monthly volume</th><th>Catalogue discount</th><th>Payment terms</th></tr></thead>
      <tbody>
        <tr><td data-label="Tier">Standard</td><td data-label="Monthly volume" class="mono">Under $1,000</td><td data-label="Discount" class="mono">List price</td><td data-label="Terms">Card at checkout</td></tr>
        <tr><td data-label="Tier">Tier 1</td><td data-label="Monthly volume" class="mono">$1,000 – $4,999</td><td data-label="Discount" class="mono">−5%</td><td data-label="Terms">PO, net 30</td></tr>
        <tr><td data-label="Tier">Tier 2</td><td data-label="Monthly volume" class="mono">$5,000 – $14,999</td><td data-label="Discount" class="mono">−8%</td><td data-label="Terms">PO, net 30</td></tr>
        <tr><td data-label="Tier">Tier 3</td><td data-label="Monthly volume" class="mono">$15,000 +</td><td data-label="Discount" class="mono">Quoted</td><td data-label="Terms">PO, net 45</td></tr>
      </tbody>
    </table>
    <p class="small muted" style="margin-top:16px;max-width:64ch">
      Tiers are reviewed quarterly against actual ordering. Moving between tiers does not require a new application.
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${C.sectionHead({ title: 'How approval works', body: 'We verify that materials are going to a research setting. It is a short process, not a sales cycle.' })}
    <div class="steps" style="max-width:820px">
      <div class="step"><span class="step__n">01</span><div><h3>Apply</h3><p>Four short steps covering your organisation, research context and expected purchasing.</p></div></div>
      <div class="step"><span class="step__n">02</span><div><h3>Review</h3><p>We confirm the organisation and the research-use context. We may ask one or two follow-up questions by email.</p></div></div>
      <div class="step"><span class="step__n">03</span><div><h3>Activate</h3><p>Your account tier, payment terms and named contact are set up, and existing order history is linked where it exists.</p></div></div>
    </div>
    <div class="notice" style="margin-top:32px;max-width:820px">
      ${icons.info}
      <div>Applications are reviewed individually. We do not publish a turnaround commitment, and we will tell you where the review stands if you ask.</div>
    </div>
  </div>
</section>

<section class="section on-dark">
  <div class="wrap center" style="display:grid;place-items:center;gap:20px">
    <h2 style="max-width:20ch">Ready to order on account?</h2>
    <p style="max-width:52ch">The application takes about ten minutes. You can save and return to it at any point.</p>
    <div class="row" style="gap:12px;justify-content:center">
      <a class="btn btn--onDark btn--lg" href="/wholesale/apply/">Start an application</a>
      <a class="btn btn--outlineDark btn--lg" href="/contact/?topic=wholesale">Talk to procurement support</a>
    </div>
  </div>
</section>`;

  return page({
    title: 'Wholesale & institutional ordering',
    description: 'Account-based ordering for research organisations: tiered pricing, bulk quantities, purchase orders and documentation access.',
    canonical: '/wholesale/',
    active: 'Wholesale',
    body,
  });
}

/* -------------------------------------------------------------- application */

function apply() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Wholesale', href: '/wholesale/' }, { label: 'Apply' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Wholesale application</span>
    <h1>Apply for a wholesale account</h1>
    <p>Four steps. Your progress is saved as you go, and you can return to an unfinished application from the same link.</p>
  </div>
</div>

<div class="wrap" style="padding-block:32px 96px;max-width:960px">
  <ol class="stepper" style="list-style:none;padding:0;margin:0 0 40px">
    <li class="stepper__step" data-state="done"><span class="stepper__n">${icons.check}</span><span class="stepper__label">Organisation</span></li>
    <li class="stepper__step" data-state="current"><span class="stepper__n">2</span><span class="stepper__label">Research information</span></li>
    <li class="stepper__step" data-state="todo"><span class="stepper__n">3</span><span class="stepper__label">Purchasing</span></li>
    <li class="stepper__step" data-state="todo"><span class="stepper__n">4</span><span class="stepper__label">Review</span></li>
  </ol>

  <form data-validate data-success="Application received. A confirmation has been sent to your email.">
    <fieldset class="fieldset">
      <legend>Organisation</legend>
      <div class="form-grid">
        <label class="field"><span class="field__label">Organisation name<span class="field__req" aria-hidden="true">*</span></span><input class="input" required value="Kendall Institute"></label>
        <label class="field"><span class="field__label">Website</span><input class="input" type="url" placeholder="https://" value="https://kendall-institute.org"></label>
        <label class="field field--full"><span class="field__label">Business address<span class="field__req" aria-hidden="true">*</span></span><input class="input" required value="77 Binney Street, Cambridge, MA 02142"></label>
        <label class="field"><span class="field__label">Contact person<span class="field__req" aria-hidden="true">*</span></span><input class="input" required value="Dr. Amara Osei"></label>
        <label class="field"><span class="field__label">Role</span><input class="input" value="Principal Investigator"></label>
        <label class="field"><span class="field__label">Email<span class="field__req" aria-hidden="true">*</span></span><input class="input" type="email" required value="a.osei@kendall-institute.org"><span class="field__hint">An institutional address speeds up verification.</span></label>
        <label class="field"><span class="field__label">Phone<span class="field__req" aria-hidden="true">*</span></span><input class="input" type="tel" required></label>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Research information</legend>
      <div class="form-grid">
        <label class="field"><span class="field__label">Organisation type<span class="field__req" aria-hidden="true">*</span></span>
          <select class="select" required>
            <option value="">Select a type</option>
            <option selected>Academic research institution</option><option>Hospital or clinical research unit</option>
            <option>Contract research organisation</option><option>Commercial R&amp;D laboratory</option>
            <option>Government or public laboratory</option><option>Other</option>
          </select>
        </label>
        <label class="field"><span class="field__label">Primary research field<span class="field__req" aria-hidden="true">*</span></span>
          <select class="select" required>
            <option value="">Select a field</option><option selected>Cell biology</option><option>Biochemistry</option>
            <option>Neuroscience</option><option>Immunology</option><option>Endocrinology</option><option>Analytical chemistry</option><option>Other</option>
          </select>
        </label>
        <fieldset class="field field--full" style="border:0;padding:0;margin:0 0 24px">
          <legend class="field__label" style="padding:0">Expected product categories</legend>
          <div class="grid grid-3" style="gap:0 24px">
            ${['Research peptides', 'Protein research', 'Metabolic research', 'Cellular research', 'Cognitive research', 'Blends']
              .map((c, i) => `<label class="check"><input type="checkbox"${i < 2 ? ' checked' : ''}><span>${esc(c)}</span></label>`)
              .join('')}
          </div>
        </fieldset>
        <label class="field field--full"><span class="field__label">Intended research use<span class="field__req" aria-hidden="true">*</span></span>
          <textarea class="textarea" required placeholder="A short description of the work these materials will support."></textarea>
          <span class="field__hint">Used to confirm research context. It is not shared outside the review team.</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Purchasing</legend>
      <div class="form-grid">
        <label class="field"><span class="field__label">Estimated monthly spend</span>
          <select class="select"><option>Under $1,000</option><option selected>$1,000 – $4,999</option><option>$5,000 – $14,999</option><option>$15,000 +</option></select>
        </label>
        <label class="field"><span class="field__label">Preferred payment method</span>
          <select class="select"><option>Card at checkout</option><option selected>Purchase order, net 30</option><option>Bank transfer</option></select>
        </label>
        <label class="field field--full"><span class="field__label">Comments</span>
          <textarea class="textarea" placeholder="Anything else the review team should know - existing order history, procurement requirements, specific materials."></textarea>
        </label>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Confirmation</legend>
      <div class="card" style="padding:20px;border-left:3px solid var(--warn)">
        <label class="check"><input type="checkbox" required><span><strong>Research use confirmation.</strong> I confirm this organisation will use these materials exclusively for laboratory research, and not for human or veterinary use.</span></label>
        <label class="check"><input type="checkbox" required><span>I am authorised to open a purchasing account on behalf of this organisation, and accept the <a class="link" href="/terms/">terms of sale</a>.</span></label>
      </div>
    </fieldset>

    <div class="row" style="justify-content:space-between;gap:12px">
      <button class="btn btn--secondary" type="button">Back</button>
      <div class="row" style="gap:12px">
        <button class="btn btn--ghost" type="submit" formnovalidate data-toast="Application saved. Return any time from the link in your email.">Save and finish later</button>
        <button class="btn btn--primary btn--lg" type="submit">Submit application</button>
      </div>
    </div>
  </form>

  <div class="card" style="padding:24px;margin-top:48px;background:var(--mist)">
    <h2 style="font-size:var(--t-h4);margin-bottom:8px">After you submit</h2>
    <p class="small muted" style="max-width:64ch">
      You will see a confirmation on screen and receive an email recording the application. The review team
      verifies the organisation and research context, and may email one or two follow-up questions. Once the
      account is active, tiered pricing applies automatically at checkout and previous order history is linked
      to the organisation where it exists.
    </p>
  </div>
</div>`;

  return page({
    title: 'Wholesale application',
    description: 'Apply for a Purely Peptides Hub wholesale account: organisation details, research context and purchasing preferences.',
    canonical: '/wholesale/apply/',
    active: 'Wholesale',
    body,
  });
}

module.exports = { wholesale, apply };
