'use strict';

const { page, esc } = require('../layout');
const C = require('../components');
const { icons, labPlate, photo, chromatogram } = require('../art');
const { brand, researchAreas, products, articles } = require('../data');

/* --------------------------------------------------------------- helpers */

function policyPage({ title, slug, updated, intro, sections, note }) {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: title }])}

<div class="pagehead">
  <div class="wrap">
    <h1>${esc(title)}</h1>
    <p>${esc(intro)}</p>
    <p class="mono micro muted" style="margin-top:16px">Last updated ${esc(updated)}</p>
  </div>
</div>

<div class="wrap policy">
  <nav class="article__toc" aria-label="Contents">
    <h2>Contents</h2>
    ${sections.map((s, i) => `<a href="#p${i + 1}"${i === 0 ? ' class="is-active"' : ''}>${esc(s.h)}</a>`).join('')}
  </nav>
  <div>
    ${note ? `<div class="notice notice--warn" style="margin-bottom:32px">${icons.info}<div>${note}</div></div>` : ''}
    <div class="prose">
      ${sections.map((s, i) => `<h2 id="p${i + 1}">${esc(s.h)}</h2>${s.body}`).join('')}
    </div>
    <div class="card" style="padding:24px;margin-top:48px">
      <h2 style="font-size:var(--t-h4);margin-bottom:8px">Questions about this policy</h2>
      <p class="small muted">Write to <a class="link" href="mailto:${brand.email}">${brand.email}</a> or use the <a class="link" href="/contact/">contact form</a>.</p>
    </div>
  </div>
</div>`;
  return page({ title, description: intro, canonical: `/${slug}/`, active: null, body });
}

/* --------------------------------------------------------------- quality */

function quality() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Quality & Testing' }])}

<section class="hero" style="border-bottom:1px solid var(--rule)">
  <div class="wrap hero__inner" style="padding-block:64px 72px">
    <div class="hero__copy">
      <span class="eyebrow">Quality &amp; testing</span>
      <h1 class="hero__title" style="font-size:var(--t-h1)">Testing is recorded against a lot, not a product line.</h1>
      <p class="hero__lede">
        A certificate that applies to a category tells you very little. Ours applies to one production
        run, carries the method that produced each result, and stays retrievable after the lot is gone.
      </p>
      <div class="hero__cta">
        <a class="btn btn--primary btn--lg" href="/certificates/">Search the certificate library</a>
        <a class="btn btn--secondary btn--lg" href="/research/what-a-certificate-of-analysis-contains/">How to read a COA</a>
      </div>
    </div>
    <div class="hero__figure"><div class="hero__frame" style="aspect-ratio:4/5" data-graph>${labPlate()}</div></div>
  </div>
</section>

${C.trustBar()}

<section class="section" id="process">
  <div class="wrap">
    ${C.sectionHead({ title: 'The process, end to end', body: 'What happens between a finished production lot and the certificate you can open before ordering.' })}
    <div class="steps" style="max-width:900px">
      ${[
        ['Receive', 'Material arrives from the synthesis facility with its manufacturing record and lot identifier. Nothing is filled or listed before that identifier exists.'],
        ['Sample', 'A sample is drawn from the finished, filled lot rather than from bulk material, so the tested material is the material that ships.'],
        ['Test', 'Purity by reversed-phase HPLC, identity by electrospray mass spectrometry, appearance by visual inspection against specification.'],
        ['Record', 'Results are written to the lot record with the method conditions, the testing laboratory and the date.'],
        ['Publish', 'The certificate is published to the library and linked from every product page the lot fills.'],
        ['Retain', 'Documents stay searchable after the lot sells out, so an experiment can be traced back years later.'],
      ]
        .map(([h, b], i) => `<div class="step"><span class="step__n">0${i + 1}</span><div><h3>${esc(h)}</h3><p>${esc(b)}</p></div></div>`)
        .join('')}
    </div>
  </div>
</section>

<section class="section section--mist" id="testing">
  <div class="wrap">
    ${C.sectionHead({ title: 'What we test for', body: 'Three determinations appear on every certificate. Each answers a different question.' })}
    <div class="grid grid-3">
      <div class="icard">
        <span class="label">Purity</span>
        <h3>Reversed-phase HPLC</h3>
        <p>Area percent under stated gradient conditions at 220 nm, on a C18 column. Reports how much of the detected material is the main component.</p>
        <div style="border:1px solid var(--rule);border-radius:var(--r-sm);margin-top:12px;padding:8px;background:var(--paper)" data-graph>${chromatogram('quality-hplc', { w: 300, h: 80, axis: false, grid: false })}</div>
      </div>
      <div class="icard">
        <span class="label">Identity</span>
        <h3>Electrospray mass spectrometry</h3>
        <p>Observed mass compared against the calculated mass for the stated sequence. Confirms the main component is the compound on the label.</p>
      </div>
      <div class="icard">
        <span class="label">Appearance</span>
        <h3>Visual inspection</h3>
        <p>Colour and physical form checked against specification. Deviations are recorded rather than corrected, because they can indicate a handling issue upstream.</p>
      </div>
    </div>

    <div class="notice" style="margin-top:32px;max-width:80ch">
      ${icons.info}
      <div><strong>What these methods do not establish.</strong> Area-percent purity does not measure net peptide content, water, residual solvents, counterion load or endotoxin. Where a study depends on one of those, request that determination specifically - it is a separate test, not an inference from the purity figure.</div>
    </div>
  </div>
</section>

<section class="section" id="methods">
  <div class="wrap">
    ${C.sectionHead({ title: 'Method conditions', body: 'Published so a result can be compared like for like against another laboratory.' })}
    <table class="spec" style="max-width:860px">
      <tbody>
        <tr><th scope="row">Instrument class</th><td>Analytical HPLC with UV/DAD detection</td></tr>
        <tr><th scope="row">Column</th><td class="mono">C18, 4.6 × 250 mm, 5 µm, 100 Å</td></tr>
        <tr><th scope="row">Mobile phase A</th><td class="mono">Water + 0.1% TFA</td></tr>
        <tr><th scope="row">Mobile phase B</th><td class="mono">Acetonitrile + 0.1% TFA</td></tr>
        <tr><th scope="row">Gradient</th><td class="mono">5–65% B over 30 min, sequence dependent</td></tr>
        <tr><th scope="row">Flow rate</th><td class="mono">1.0 mL/min</td></tr>
        <tr><th scope="row">Detection</th><td class="mono">220 nm (peptide bond)</td></tr>
        <tr><th scope="row">Identity method</th><td>ESI-MS, positive ion mode</td></tr>
        <tr><th scope="row">Purity specification</th><td class="mono">≥ 98.0% area, unless stated otherwise on the product page</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="section section--mist" id="labs">
  <div class="wrap">
    <div class="qsplit">
      <div>
        <span class="eyebrow">Testing laboratories</span>
        <h2>Independent testing, named on the document</h2>
        <p class="muted" style="margin-top:16px;max-width:52ch">
          Analytical work is contracted to independent laboratories, and the laboratory is named on the
          certificate rather than left implicit. Where testing has been performed in-house, the certificate
          says so - the distinction matters when you are evaluating the document.
        </p>
        <p class="muted" style="margin-top:16px;max-width:52ch">
          Reports are published as received. We do not re-issue a certificate to present a result differently,
          and out-of-specification lots are not released.
        </p>
        <a class="btn btn--secondary" style="margin-top:24px" href="/certificates/">Browse certificates</a>
      </div>
      <div class="qsplit__art" style="aspect-ratio:4/5" data-graph>${labPlate()}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${C.sectionHead({ title: 'Questions we get asked', action: { label: 'All FAQs', href: '/faq/' } })}
    <div style="max-width:840px">
      ${C.accordion(
        [
          { q: 'Why do two suppliers report different purity for the same peptide?', a: 'Because purity is method-dependent. A gradient that co-elutes an impurity with the main peak reports a higher figure than one that resolves it. Compare methods before comparing numbers. <a class="link" href="/research/reading-an-hplc-purity-result/">More on reading a purity result</a>.' },
          { q: 'Do you test every lot?', a: 'Every lot released for sale carries analytical documentation. Where a lot is pending testing, the product page shows that state rather than displaying another lot\'s result.' },
          { q: 'Can I get documentation for a lot I bought previously?', a: 'Yes. Archived lots stay searchable in the <a class="link" href="/certificates/">certificate library</a>, and lots your account has received are listed in your account.' },
          { q: 'Do you provide endotoxin or net peptide content data?', a: 'Not as standard. Both are separate determinations and can be requested for a specific lot - contact the documentation team before ordering so the testing can be arranged.' },
          { q: 'What happens if a lot fails specification?', a: 'It is not released. There is no partial release, and results from a previous lot are never presented in its place.' },
        ],
        'quality-faq'
      )}
    </div>
  </div>
</section>`;

  return page({
    title: 'Quality & testing',
    description: 'How Purely Peptides tests and documents research materials: RP-HPLC purity, mass spectrometry identity, published method conditions and lot-level certificates.',
    canonical: '/quality/',
    active: 'Quality & Testing',
    body,
  });
}

/* ---------------------------------------------------------- applications */

function applications() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Applications' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Applications</span>
    <h1>Research areas</h1>
    <p>
      Materials grouped by the research context they are most often cited in. Grouping reflects published
      literature use, not a claim about what any material does.
    </p>
  </div>
</div>

<section class="section section--tight">
  <div class="wrap">
    <div class="grid grid-2" style="gap:32px">
      ${researchAreas
        .map((area) => {
          const list = products.filter((p) => p.area === area);
          return `<div class="card" style="padding:32px">
          <div class="row" style="justify-content:space-between;align-items:flex-start">
            <h2 style="font-size:var(--t-h3)">${esc(area)}</h2>
            <span class="mono micro muted">${list.length} materials</span>
          </div>
          <p class="muted small" style="margin-top:12px;max-width:48ch">
            ${esc(
              {
                Metabolism: 'Compounds appearing in energy substrate, adipose tissue and mitochondrial signalling studies.',
                'Cell Signalling': 'Materials used as ligands, reference standards and pathway probes in signalling work.',
                'Cellular Repair': 'Peptides cited in migration, matrix remodelling and tissue response models.',
                'Inflammatory Research': 'Materials used in cytokine expression and innate immune signalling studies.',
                Neuroscience: 'Neuropeptides and receptor ligands used in binding and behavioural model research.',
                'Endocrine Research': 'Receptor agonists and hormone fragments used in endocrine pharmacology.',
              }[area]
            )}
          </p>
          <ul style="list-style:none;padding:0;margin:20px 0 0;display:grid;gap:2px">
            ${list
              .slice(0, 5)
              .map(
                (p) => `<li><a href="/products/${p.slug}/" style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--rule);text-decoration:none;font-size:var(--t-small)">
              <span>${esc(p.name)}</span><span class="mono micro muted">${esc(p.sku)}</span></a></li>`
              )
              .join('')}
          </ul>
          <a class="link-arrow" style="margin-top:20px" href="/products/?area=${encodeURIComponent(area)}"><span>All ${esc(area.toLowerCase())} materials</span>${icons.arrow}</a>
        </div>`;
        })
        .join('')}
    </div>
  </div>
</section>

<section class="section section--mist">
  <div class="wrap">
    ${C.sectionHead({ title: 'Technical reading', action: { label: 'Research library', href: '/research/' } })}
    <div class="grid grid-3">${articles.slice(0, 3).map(C.researchCard).join('')}</div>
  </div>
</section>`;

  return page({
    title: 'Research areas & applications',
    description: 'Purely Peptides research materials grouped by research area: metabolism, cell signalling, cellular repair, inflammatory research, neuroscience and endocrine research.',
    canonical: '/applications/',
    active: 'Applications',
    body,
  });
}

/* ------------------------------------------------------------------ about */

function about() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'About' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">About</span>
    <h1>A supplier built around the paperwork.</h1>
    <p>
      Purely Peptides was founded by analytical chemists who spent years chasing suppliers for documents that
      should have arrived with the vial.
    </p>
  </div>
</div>

<section class="section">
  <div class="wrap">
    <div class="qsplit">
      <div class="qsplit__art">${photo('about-lab', 'A working research laboratory, benches lined with instruments', 900, 1125)}</div>
      <div>
        <p class="qsplit__pull">Reproducibility problems are often supply problems.</p>
        <div class="prose" style="margin-top:24px">
          <p>Most research material suppliers treat documentation as an attachment: something produced on request, sometimes for the product rather than the lot, occasionally not at all. That works until an experiment fails to reproduce and nobody can establish what was actually in the vial.</p>
          <p>We built the catalogue the other way round. The lot record exists before the listing does. The certificate is generated against that lot, published to a library anyone can search, and kept after the lot sells out. The product page shows which lot is currently shipping, so you can read the analytical record before deciding to order rather than after.</p>
          <p>We are deliberately narrow. We supply a small catalogue of characterised compounds to laboratories, and we do not sell to consumers. That constraint is what makes the documentation promise possible to keep.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--mist">
  <div class="wrap">
    ${C.sectionHead({ title: 'How we work' })}
    <div class="grid grid-3">
      <div class="icard"><h3>Evidence before claims</h3><p>Product copy describes what a material is and what the literature records. It does not describe effects, and it never suggests a use outside the laboratory.</p></div>
      <div class="icard"><h3>Methods in the open</h3><p>Our testing conditions are published so a result can be compared against another laboratory rather than taken on trust.</p></div>
      <div class="icard"><h3>Records outlive orders</h3><p>Documentation stays retrievable long after a lot is gone, because the question usually arrives later than the order does.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${C.sectionHead({ title: 'Team' })}
    <div class="grid grid-3">
      ${[
        ['Dr. Ines Karlsson', 'Head of Analytical Services', 'Twelve years in peptide analytical chemistry, previously at a contract testing laboratory serving pharmaceutical clients.'],
        ['Marcus Oyelaran', 'Quality Systems Manager', 'Built and maintains the lot record system that links every shipped vial to its documentation.'],
        ['Dr. Peter Nwosu', 'Analytical Chemist', 'Runs method development and writes most of the technical material in the research library.'],
      ]
        .map(
          ([n, r, b]) => `<div class="card" style="padding:28px">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--verdigris-tint);display:grid;place-items:center;color:var(--verdigris);margin-bottom:16px">${icons.user}</div>
        <h3 style="font-size:var(--t-h4)">${esc(n)}</h3>
        <p class="label" style="margin:6px 0 12px">${esc(r)}</p>
        <p class="small muted">${esc(b)}</p>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section on-dark">
  <div class="wrap split split--even" style="align-items:center">
    <div>
      <h2 style="max-width:18ch">Where we are</h2>
      <address class="footer__addr" style="color:#B5BCBD;font-size:var(--t-body)">
        ${brand.address.map(esc).join('<br>')}<br><br>
        <a href="mailto:${brand.email}" style="color:#FFF">${brand.email}</a><br>
        <a href="tel:${brand.phone.replace(/[^+\d]/g, '')}" style="color:#FFF">${brand.phone}</a><br>
        <span style="color:#97A5A7">${esc(brand.hours)}</span>
      </address>
    </div>
    <div class="row" style="gap:12px">
      <a class="btn btn--onDark btn--lg" href="/contact/">Contact us</a>
      <a class="btn btn--outlineDark btn--lg" href="/wholesale/">Wholesale ordering</a>
    </div>
  </div>
</section>`;

  return page({ title: 'About Purely Peptides', description: 'Purely Peptides supplies research materials to laboratories with lot-level analytical documentation as a default, not an add-on.', canonical: '/about/', active: null, body });
}

/* ---------------------------------------------------------------- contact */

function contact() {
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Contact' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Support</span>
    <h1>Contact the team</h1>
    <p>Technical questions reach the analytical team directly. ${esc(brand.hours)}.</p>
  </div>
</div>

<div class="wrap contact">
  <form novalidate>
    <fieldset class="fieldset">
      <legend style="font-size:var(--t-h4)">What is your question about?</legend>
      <div class="grid grid-2" style="gap:0 24px">
        ${[
          ['Product specifications', 'Sequence, purity, solubility or handling', true],
          ['An existing order', 'Status, tracking or amendments', false],
          ['Documentation', 'Finding a certificate for a lot', false],
          ['Wholesale &amp; procurement', 'Accounts, purchase orders, bulk quantities', false],
        ]
          .map(
            ([t, h, sel]) => `<label class="check" style="align-items:flex-start">
          <input type="radio" name="topic" ${sel ? 'checked' : ''}>
          <span><strong style="font-weight:500">${t}</strong><br><span class="muted micro">${h}</span></span>
        </label>`
          )
          .join('')}
      </div>
    </fieldset>

    <div class="form-grid">
      <label class="field"><span class="field__label">Name<span class="field__req" aria-hidden="true">*</span></span><input class="input" required autocomplete="name"></label>
      <label class="field"><span class="field__label">Email<span class="field__req" aria-hidden="true">*</span></span><input class="input" type="email" required autocomplete="email"></label>
      <label class="field"><span class="field__label">Organisation</span><input class="input" autocomplete="organization"></label>
      <label class="field"><span class="field__label">Order or lot number</span><input class="input input--mono" placeholder="PP-84120 or BP-260910"><span class="field__hint">Speeds up documentation and order questions.</span></label>
      <label class="field field--full"><span class="field__label">Message<span class="field__req" aria-hidden="true">*</span></span>
        <textarea class="textarea" required rows="6" placeholder="Include the product name and, where relevant, the lot number."></textarea>
      </label>
    </div>

    <label class="check"><input type="checkbox"><span>Send me a copy of this message.</span></label>

    <button class="btn btn--primary btn--lg" style="margin-top:24px" type="button" data-toast="Message sent. We reply during business hours.">Send message</button>
  </form>

  <aside class="stack-3">
    <div class="card" style="padding:24px">
      <span class="label">Direct contact</span>
      <ul style="list-style:none;padding:0;margin:16px 0 0;display:grid;gap:14px">
        <li class="row" style="gap:10px;color:var(--slate)">${icons.mail}<a class="link" href="mailto:${brand.email}">${brand.email}</a></li>
        <li class="row" style="gap:10px;color:var(--slate)">${icons.building}<a class="link" href="mailto:${brand.procurement}">${brand.procurement}</a></li>
        <li class="row" style="gap:10px;color:var(--slate)">${icons.phone}<a class="link" href="tel:${brand.phone.replace(/[^+\d]/g, '')}">${brand.phone}</a></li>
        <li class="row" style="gap:10px;color:var(--slate)">${icons.clock}<span class="small">${esc(brand.hours)}</span></li>
      </ul>
    </div>
    <div class="card" style="padding:24px">
      <span class="label">Address</span>
      <address class="footer__addr" style="color:var(--ink)">${brand.address.map(esc).join('<br>')}</address>
    </div>
    <div class="notice notice--accent">
      ${icons.doc}
      <div>Looking for a certificate? Search the <a class="link" href="/certificates/">certificate library</a> by lot number first - most documentation questions resolve there.</div>
    </div>
  </aside>
</div>`;

  return page({ title: 'Contact', description: 'Contact Purely Peptides for product specifications, order support, documentation requests or wholesale enquiries.', canonical: '/contact/', active: 'Support', body });
}

/* -------------------------------------------------------------------- FAQ */

function faq() {
  const groups = [
    {
      h: 'Ordering',
      items: [
        { q: 'Who can order from Purely Peptides?', a: 'We supply laboratories, research institutions and organisations conducting in-vitro research. A research-use confirmation is required at checkout, and we do not sell to consumers.' },
        { q: 'Do I need an account to order?', a: 'No. You can order as a guest. An account retains order history and gives access to documentation for lots you have received.' },
        { q: 'Can I order against a purchase order?', a: 'Yes, on an approved wholesale account. <a class="link" href="/wholesale/apply/">Apply for an account</a> to enable PO ordering and net terms.' },
        { q: 'Is there a minimum order?', a: 'No minimum. Volume pricing applies automatically from ten vials of the same size.' },
      ],
    },
    {
      h: 'Documentation',
      items: [
        { q: 'Where do I find the certificate for my vial?', a: 'Enter the lot number from the vial label into the <a class="link" href="/certificates/">certificate library</a>. If you ordered on an account, certificates also appear under your order.' },
        { q: 'How long are certificates kept?', a: 'Indefinitely. Archived lots stay searchable after they are no longer in stock.' },
        { q: 'Can I see documentation before ordering?', a: 'Yes. The lot currently shipping is shown on each product page with its full analytical record.' },
        { q: 'Do you provide additional testing on request?', a: 'Endotoxin, net peptide content and residual solvent determinations can be arranged for a specific lot. Contact the documentation team before ordering.' },
      ],
    },
    {
      h: 'Storage & handling',
      items: [
        { q: 'How should material be stored on arrival?', a: 'Lyophilised material should be stored at −20 °C or below, desiccated and protected from light. Allow sealed vials to reach room temperature before opening. See <a class="link" href="/research/storage-and-reconstitution-of-lyophilised-peptides/">our storage guidance</a>.' },
        { q: 'Does ambient shipping affect the material?', a: 'Short ambient transit is not expected to affect sealed lyophilised material. Cold-chain shipping is available at checkout where a study requires it.' },
        { q: 'How long is material stable after reconstitution?', a: 'It depends on the peptide and the buffer. Aliquot and freeze immediately after reconstitution, and avoid repeated freeze-thaw cycles.' },
      ],
    },
    {
      h: 'Shipping & returns',
      items: [
        { q: 'When do orders ship?', a: 'Orders placed before 14:00 ET on a business day are despatched the same day from Massachusetts.' },
        { q: 'Do you ship internationally?', a: 'Yes, with tracked service and import documentation. Some materials cannot be shipped to every destination; restrictions are applied at checkout.' },
        { q: 'Can I return an order?', a: 'Unopened material in its original packaging can be returned within 14 days. Opened vials cannot be returned, because chain of custody is broken. See <a class="link" href="/shipping/">shipping and returns</a>.' },
      ],
    },
  ];

  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'FAQ' }])}

<div class="pagehead">
  <div class="wrap">
    <h1>Frequently asked questions</h1>
    <p>Ordering, documentation, storage and shipping. If something is missing, <a class="link" href="/contact/">ask us</a>.</p>
  </div>
</div>

<div class="wrap policy">
  <nav class="article__toc" aria-label="Contents">
    <h2>Sections</h2>
    ${groups.map((g, i) => `<a href="#faq-${i}"${i === 0 ? ' class="is-active"' : ''}>${esc(g.h)}</a>`).join('')}
  </nav>
  <div>
    ${groups
      .map(
        (g, i) => `<section id="faq-${i}" style="margin-bottom:56px">
      <h2 style="font-size:var(--t-h3);margin-bottom:16px">${esc(g.h)}</h2>
      ${C.accordion(g.items, `faq-${i}`)}
    </section>`
      )
      .join('')}
    <div class="empty">
      <h3>Still stuck?</h3>
      <p>Send the product name and, where relevant, the lot number. Technical questions reach the analytical team directly.</p>
      <a class="btn btn--primary" href="/contact/">Contact support</a>
    </div>
  </div>
</div>`;

  return page({
    title: 'Frequently asked questions',
    description: 'Answers on ordering, documentation, storage, shipping and returns for Purely Peptides research materials.',
    canonical: '/faq/',
    active: null,
    body,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: groups.flatMap((g) =>
        g.items.map((it) => ({
          '@type': 'Question',
          name: it.q,
          acceptedAnswer: { '@type': 'Answer', text: it.a.replace(/<[^>]+>/g, '') },
        }))
      ),
    },
  });
}

/* --------------------------------------------------------------- shipping */

function shipping() {
  return policyPage({
    title: 'Shipping & returns',
    slug: 'shipping',
    updated: '1 September 2026',
    intro: 'Despatch times, delivery services, packaging and the conditions under which material can be returned.',
    sections: [
      {
        h: 'Despatch',
        body: `<p>Orders placed before 14:00 ET on a business day are despatched the same day from our Massachusetts facility. Orders placed later, or at a weekend, are despatched on the next business day.</p>
        <p>Tracking is issued on despatch and recorded against the order in your account. Where an order contains a material awaiting a lot release, we contact you before splitting the shipment.</p>`,
      },
      {
        h: 'Delivery services',
        body: `<table class="spec"><tbody>
          <tr><th scope="row">Domestic (US)</th><td>1–3 business days, tracked</td></tr>
          <tr><th scope="row">Canada</th><td>2–5 business days, tracked</td></tr>
          <tr><th scope="row">International</th><td>3–7 business days, tracked, import documentation included</td></tr>
          <tr><th scope="row">Cold chain</th><td>Available at checkout. Must be received in person.</td></tr>
        </tbody></table>
        <p>International customers are responsible for import duties, taxes and any institutional import authorisation required at the destination.</p>`,
      },
      {
        h: 'Packaging',
        body: `<p>Material ships in a sealed vial with desiccant inside a tamper-evident outer package. Lyophilised material is stable in short ambient transit; cold-chain packaging is used where the order specifies it.</p>
        <p>The lot number is printed on the vial label and repeated on the packing note, so documentation can be located without opening the vial.</p>`,
      },
      {
        h: 'Restrictions',
        body: `<p>Some materials cannot be shipped to every destination. Restrictions are applied automatically at checkout once a delivery address is entered, and the affected line is identified before payment.</p>
        <p>We do not ship to residential addresses in every region. Where an institutional address is required, checkout will say so.</p>`,
      },
      {
        h: 'Returns',
        body: `<p>Unopened material in its original packaging may be returned within 14 days of delivery for a refund of the material cost. Contact support before returning anything so a return reference can be issued.</p>
        <p>Opened vials cannot be returned. Once a seal is broken the chain of custody is broken, and the material can no longer be attributed to the tested lot.</p>
        <p>Where material arrives damaged or does not match the order, tell us within five business days with photographs of the packaging and the vial label. We replace or refund at your choice, and we do not ask for the damaged material to be returned.</p>`,
      },
    ],
  });
}

/* ------------------------------------------------------------------ legal */

function terms() {
  return policyPage({
    title: 'Terms of sale',
    slug: 'terms',
    updated: '1 September 2026',
    note: '<strong>Draft template.</strong> This page is design placeholder copy and must be replaced with terms drafted and reviewed by qualified legal counsel before the site goes live.',
    intro: 'The conditions under which Purely Peptides supplies research materials.',
    sections: [
      { h: 'Who we sell to', body: '<p>Materials are supplied to laboratories, research institutions and organisations conducting in-vitro research. Placing an order confirms that you are authorised to purchase on behalf of such an organisation and that the material will be used exclusively for laboratory research.</p><p>We may decline or cancel any order, and may request evidence of research context before releasing an order.</p>' },
      { h: 'Orders and pricing', body: '<p>An order is an offer to purchase and is accepted when the order is despatched. Prices are those displayed at the time of order. Account pricing, where applicable, is applied automatically at checkout.</p><p>Where a pricing or specification error is discovered before despatch, we will contact you and either correct the order with your agreement or cancel it without charge.</p>' },
      { h: 'Documentation', body: '<p>Analytical documentation describes testing performed on the stated production lot. It is a record of that testing and is not a warranty of fitness for any particular purpose or application.</p>' },
      { h: 'Delivery and risk', body: '<p>Risk passes on delivery to the address given at checkout. Delivery estimates are estimates, not guarantees.</p>' },
      { h: 'Limitation of liability', body: '<p>To the extent permitted by law, our liability in relation to any order is limited to the price paid for the material concerned. We are not liable for experimental outcomes, consequential loss or any use of the material outside laboratory research.</p>' },
      { h: 'Governing law', body: '<p>These terms are governed by the laws of the Commonwealth of Massachusetts, United States.</p>' },
    ],
  });
}

function privacy() {
  return policyPage({
    title: 'Privacy policy',
    slug: 'privacy',
    updated: '1 September 2026',
    note: '<strong>Draft template.</strong> This page is design placeholder copy. Replace it with a policy reviewed against the jurisdictions you operate in before launch.',
    intro: 'What information we collect, why we collect it, and the choices you have.',
    sections: [
      { h: 'What we collect', body: '<p>Account and order information you provide: name, organisation, email, delivery and billing address, phone number, and the contents of your orders. Payment card details are handled by our payment provider and are not stored by us.</p><p>Technical information generated when you use the site: pages viewed, approximate location derived from IP address, and device or browser type.</p>' },
      { h: 'Why we use it', body: '<p>To process and deliver orders, to provide documentation associated with the lots you receive, to respond to support requests, to meet record-keeping obligations, and to maintain the security of the site.</p>' },
      { h: 'Sharing', body: '<p>We share information with the parties needed to fulfil an order: payment processors, delivery carriers and, where applicable, customs authorities. We do not sell personal information.</p>' },
      { h: 'Retention', body: '<p>Order and documentation records are retained so that material can be traced to its lot after delivery. Marketing preferences are retained until you change them.</p>' },
      { h: 'Your choices', body: '<p>You can access, correct or request deletion of your account information, and unsubscribe from any non-transactional email at any time. Requests relating to records we are required to retain will be answered with an explanation of what can be removed.</p>' },
      { h: 'Cookies', body: '<p>We use cookies necessary for the cart and account session, and analytics cookies to understand site usage. Non-essential cookies are set only with consent.</p>' },
    ],
  });
}

function researchUsePolicy() {
  return policyPage({
    title: 'Research use policy',
    slug: 'research-use-policy',
    updated: '1 September 2026',
    intro: 'Every material supplied by Purely Peptides is for laboratory research use only. This page explains what that means and what it excludes.',
    sections: [
      {
        h: 'Scope',
        body: `<p>All materials listed on this site are supplied exclusively for in-vitro laboratory research and preclinical investigation conducted by qualified professionals in an appropriate facility.</p>
        <p>They are <strong>not</strong> drugs, foods, dietary supplements, cosmetics or medical devices, and they have not been evaluated or approved by any regulatory authority for any therapeutic, diagnostic or preventive purpose.</p>`,
      },
      {
        h: 'Excluded uses',
        body: `<p>Materials supplied by Purely Peptides must not be used for:</p>
        <ul>
          <li>administration to humans, in any form, in any quantity;</li>
          <li>administration to animals outside an approved research protocol;</li>
          <li>diagnostic or therapeutic purposes;</li>
          <li>incorporation into any food, supplement, cosmetic or consumer product;</li>
          <li>resale to individuals, or resale for any of the purposes above.</li>
        </ul>`,
      },
      {
        h: 'Claims',
        body: `<p>We do not make, and will not make, claims about the physiological, therapeutic or performance effects of these materials. Product descriptions summarise published literature for orientation and are not statements about what a material does in any organism.</p>
        <p>If you find copy anywhere on this site that reads as a health claim, tell us and we will correct it.</p>`,
      },
      {
        h: 'Purchaser responsibilities',
        body: `<p>By ordering you confirm that you are purchasing on behalf of a research organisation, that the material will be handled by trained personnel in an appropriate facility, and that you are responsible for compliance with all applicable laws, institutional policies and disposal requirements in your jurisdiction.</p>
        <p>You are responsible for assessing hazards before use. Materials are supplied without a safety data sheet unless one is specifically provided; where a hazard assessment is required, request it before ordering.</p>`,
      },
      {
        h: 'Enforcement',
        body: `<p>We may decline or cancel any order, and may close an account, where we believe material is being obtained for a use outside this policy. Research-use confirmation is required at checkout and is not pre-selected.</p>`,
      },
    ],
  });
}

/* -------------------------------------------------------------------- 404 */

function notFound() {
  const body = `
<div class="wrap notfound">
  <span class="notfound__code">Error 404 - page not found</span>
  <h1 style="max-width:18ch;margin-top:16px">No peak at this retention time.</h1>
  <p class="lede" style="margin-top:16px;max-width:48ch">
    The page you asked for is not here. It may have moved, or the link may be incomplete.
  </p>
  <div class="notfound__trace" data-graph>${chromatogram('not-found', { w: 560, h: 130, minor: 3, mainAt: 0.5, stroke: '#C1C1C1' })}</div>
  <div class="row" style="gap:12px;justify-content:center">
    <a class="btn btn--primary" href="/products/">Browse the catalogue</a>
    <a class="btn btn--secondary" href="/certificates/">Search documentation</a>
  </div>
  <div style="margin-top:56px;width:min(560px,100%)">
    <form class="searchbar" action="/search/" method="get" role="search">
      <span class="searchbar__icon">${icons.search}</span>
      <label class="visually-hidden" for="nf-q">Search the site</label>
      <input id="nf-q" name="q" type="search" placeholder="Search products, CAS, SKU or lot number">
      <button class="btn btn--dark" type="submit">Search</button>
    </form>
  </div>
</div>`;

  return page({ title: 'Page not found', description: 'The requested page could not be found.', canonical: '/404/', active: null, body });
}

module.exports = { quality, applications, about, contact, faq, shipping, terms, privacy, researchUsePolicy, notFound };
