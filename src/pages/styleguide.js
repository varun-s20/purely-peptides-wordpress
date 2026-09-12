'use strict';

const { page, esc } = require('../layout');
const C = require('../components');
const { icons, chromatogram, productShot, categoryPhoto } = require('../art');
const { products, lots, articles, categories } = require('../data');

const swatch = (name, token, hex, note) => `
  <div style="border:1px solid var(--rule);border-radius:var(--r-md);overflow:hidden">
    <div style="height:72px;background:${hex};border-bottom:1px solid var(--rule)"></div>
    <div style="padding:12px 14px">
      <div style="font-size:var(--t-small);font-weight:600">${esc(name)}</div>
      <div class="mono micro muted" style="margin-top:4px">${esc(token)}</div>
      <div class="mono micro" style="color:var(--slate)">${esc(hex)}</div>
      ${note ? `<div class="micro muted" style="margin-top:6px">${esc(note)}</div>` : ''}
    </div>
  </div>`;

const specimen = (label, cls, text, meta) => `
  <div class="specimen">
    <div>
      <div class="label">${esc(label)}</div>
      <div class="mono micro muted" style="margin-top:6px">${esc(meta)}</div>
    </div>
    <div class="${cls}">${esc(text)}</div>
  </div>`;

module.exports = function styleguide() {
  const sections = [
    'Colour', 'Typography', 'Spacing & grid', 'Buttons', 'Forms & states',
    'Status & badges', 'Cards', 'Tables', 'Navigation', 'Feedback', 'Icons', 'Art direction',
  ];

  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Design system' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Internal reference</span>
    <h1>Design system</h1>
    <p>
      Every token, component and state used across the site, rendered from the same source the pages
      use. If something here changes, it changes everywhere.
    </p>
  </div>
</div>

<div class="wrap policy">
  <nav class="article__toc" aria-label="Contents">
    <h2>Contents</h2>
    ${sections.map((s, i) => `<a href="#sg-${i}"${i === 0 ? ' class="is-active"' : ''}>${esc(s)}</a>`).join('')}
  </nav>

  <div>
    <!-- ─────────────────────────────────────────────────────── colour -->
    <section id="sg-0" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:8px">Colour</h2>
      <p class="muted" style="margin-bottom:24px;max-width:60ch">
        Roughly 75% neutral, 15% tinted background, 10% accent, over near-black ink. The accents
        carry interaction, call to action and verification state - never decoration.
      </p>

      <h3 class="label" style="margin-bottom:12px">Neutrals</h3>
      <div class="grid grid-4" style="margin-bottom:32px">
        ${swatch('Paper', '--paper', '#FFFFFF', 'Default canvas')}
        ${swatch('Mist', '--mist', '#F6F6F4', 'Alternating section ground')}
        ${swatch('Mist deep', '--mist-deep', '#E8F7FA', 'Table zebra, hover fill')}
        ${swatch('Rule', '--rule', '#D7D7D7', 'Hairline divider')}
        ${swatch('Rule input', '--rule-input', '#828894', 'Form boundary, 3:1')}
        ${swatch('Ink', '--ink', '#051214', 'Headings, 18.9:1')}
        ${swatch('Body ink', '--body-ink', '#3B3B3B', 'Running body copy, 10.9:1')}
        ${swatch('Slate', '--slate', '#5C6E71', 'Secondary text, 5.3:1')}
        ${swatch('Slate light', '--slate-light', '#5C6E71', 'Tertiary text, 5.0:1 on mist')}
      </div>

      <h3 class="label" style="margin-bottom:12px">Accent</h3>
      <p class="small muted" style="margin-bottom:16px;max-width:60ch">
        Two accents with separate jobs. Teal carries interaction - links, controls, selected state.
        Orange carries the single call to action on a screen, plus the arrows and chevrons that
        signal movement. Each accent has a light-ground text variant: bright orange reads at 2.7:1
        on paper, so words use <span class="mono">--orange-text</span> and fills use
        <span class="mono">--orange</span>. Orange is never a surface behind body copy.
      </p>
      <div class="grid grid-4" style="margin-bottom:32px">
        ${swatch('Teal', '--teal', '#1DAFCB', 'Filled buttons, rules')}
        ${swatch('Teal deep', '--teal-deep', '#2C656B', 'Link text, bands, hover')}
        ${swatch('Teal tint', '--teal-tint', '#E8F7FA', 'Selected state wash')}
        ${swatch('Aqua', '--aqua', '#64E4F9', 'Accent on dark grounds')}
        ${swatch('Orange', '--orange', '#C7E119', 'CTA fill, arrows, rules')}
        ${swatch('Orange deep', '--orange-deep', '#E25D10', 'Hover on filled surfaces')}
        ${swatch('Orange text', '--orange-text', '#BE4A0A', 'Accent words, 5.0:1')}
        ${swatch('Bottle', '--bottle', '#051214', 'Dark sections, utility bar')}
      </div>

      <h3 class="label" style="margin-bottom:12px">Status</h3>
      <p class="small muted" style="margin-bottom:16px;max-width:60ch">
        Status colour never carries meaning alone. Every status pairs a hue with a glyph and a word,
        so the information survives greyscale, colour blindness and print.
      </p>
      <div class="grid grid-3" style="margin-bottom:16px">
        ${swatch('Available', '--ok', '#3F7E27', 'Verified, in stock')}
        ${swatch('Attention', '--warn', '#A8501A', 'Low stock, in transit')}
        ${swatch('Blocked', '--stop', '#C5221F', 'Backorder, form error')}
      </div>
      <div class="row" style="gap:8px">
        ${C.stockBadge('in-stock')}${C.stockBadge('low-stock')}${C.stockBadge('out-of-stock')}
        <span class="status status--flat">${icons.doc}Neutral</span>
      </div>
    </section>

    <!-- ─────────────────────────────────────────────────── typography -->
    <section id="sg-1" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:8px">Typography</h2>
      <p class="muted" style="margin-bottom:24px;max-width:60ch">
        Two families with one clean split. <strong>Rokkitt</strong>, a geometric slab, carries every
        heading and nothing else - it is the loudest thing on the page and stays rationed to
        headings for that reason. <strong>Noto Sans</strong> carries everything else: body copy,
        interface labels, technical labels and data values, using its tabular figures so measured
        values and identifiers still align in a column.
      </p>
      <div style="border-top:1px solid var(--ink)">
        ${specimen('Display', 'display', 'Verified at the lot level', 'Rokkitt 600 · 40–56px · −0.012em')}
        ${specimen('Heading 1', '', 'Research materials', 'Rokkitt 600 · 34–52px')}
        ${specimen('Heading 2', 'h2-demo', 'Explore research materials', 'Rokkitt 600 · 26–36px')}
        ${specimen('Heading 3', 'h3-demo', 'Batch documentation', 'Rokkitt 600 · 20–24px')}
        ${specimen('Body', '', 'Each eligible production lot is connected to its own testing record.', 'Noto Sans 400 · 16px · 1.55')}
        ${specimen('Lede', 'lede', 'A purity figure is a summary of a chromatogram, not a substitute for it.', 'Noto Sans 400 · 18px · 1.6')}
        ${specimen('Small', 'small muted', 'Documentation is issued against an individual production lot.', 'Noto Sans 400 · 14px')}
        ${specimen('Technical label', 'label', 'Molecular weight', 'Noto Sans 500 · 11px · 0.1em · uppercase')}
        ${specimen('Data value', 'mono', '1419.53 g/mol · CAS 137525-51-0 · LOT BP-260910', 'Noto Sans 400 · tabular figures')}
      </div>
      <div class="notice" style="margin-top:24px">
        ${icons.info}
        <div>Uppercase labels are used for <strong>field names on data</strong>, never as decorative eyebrows above body copy. The one exception is the section eyebrow, which names a content area.</div>
      </div>
      <style>.h2-demo{font-size:var(--t-h2);font-weight:600}.h3-demo{font-size:var(--t-h3);font-weight:600}</style>
    </section>

    <!-- ────────────────────────────────────────────────── spacing/grid -->
    <section id="sg-2" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:8px">Spacing &amp; grid</h2>
      <p class="muted" style="margin-bottom:24px;max-width:60ch">
        An 8px base scale. Content maxes at 1280px inside a 1440px page frame, on a 12-column grid
        with 24px gutters.
      </p>
      <div style="display:grid;gap:10px;margin-bottom:32px">
        ${[8, 16, 24, 32, 48, 64, 80, 96, 128]
          .map(
            (n, i) => `<div style="display:flex;align-items:center;gap:16px">
          <span class="mono micro muted" style="width:64px">--s-${i + 1}</span>
          <span class="mono micro" style="width:48px">${n}px</span>
          <span style="height:14px;width:${n}px;background:var(--verdigris);border-radius:2px"></span>
        </div>`
          )
          .join('')}
      </div>
      <div style="border:1px solid var(--rule);border-radius:var(--r-md);padding:16px;background:var(--mist)">
        <div class="label" style="margin-bottom:12px">12-column grid, 24px gutter</div>
        <div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px">
          ${Array.from({ length: 12 }, () => '<div style="height:56px;background:var(--verdigris-tint);border:1px solid #CBE4BC;border-radius:3px"></div>').join('')}
        </div>
      </div>
      <table class="spec" style="margin-top:24px">
        <tbody>
          <tr><th scope="row">Breakpoints</th><td class="mono">1440 desktop · 1200 product rows stack · 1080 nav collapse · 900 stack · 768 tablet · 390 mobile</td></tr>
          <tr><th scope="row">Corner radii</th><td class="mono">Full round on buttons, search and pills · 4px small controls · 6px cards · 8px feature panels</td></tr>
          <tr><th scope="row">Motion</th><td class="mono">140ms press · 160ms hover · 220ms base · 300ms ceiling · ease-out cubic-bezier(.23,1,.32,1)</td></tr>
        </tbody>
      </table>
    </section>

    <!-- ──────────────────────────────────────────────────────── buttons -->
    <section id="sg-3" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:24px">Buttons</h2>
      <div class="grid grid-2" style="gap:32px">
        <div>
          <div class="label" style="margin-bottom:12px">On light</div>
          <div class="row" style="gap:10px;margin-bottom:16px">
            <button class="btn btn--primary">Add to order</button>
            <button class="btn btn--accent">Sign up now</button>
            <button class="btn btn--secondary">View certificate</button>
            <button class="btn btn--dark">Search</button>
          </div>
          <div class="row" style="gap:10px;margin-bottom:16px">
            <button class="btn btn--primary btn--lg">Large primary</button>
            <button class="btn btn--secondary btn--sm">Small secondary</button>
            <button class="btn btn--ghost">Ghost</button>
          </div>
          <div class="row" style="gap:10px">
            <button class="btn btn--primary" disabled>Disabled</button>
            <button class="btn btn--primary"><span class="spinner"></span>Working</button>
            <a class="link-arrow" href="#sg-3"><span>Tertiary link</span>${icons.arrow}</a>
          </div>
        </div>
        <div class="on-dark" style="padding:24px;border-radius:var(--r-md)">
          <div class="label" style="margin-bottom:12px">On dark</div>
          <div class="row" style="gap:10px">
            <button class="btn btn--onDark">Verify</button>
            <button class="btn btn--outlineDark">Contact support</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ────────────────────────────────────────────────── forms/states -->
    <section id="sg-4" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:24px">Forms &amp; states</h2>
      <div class="grid grid-2" style="gap:32px">
        <div>
          <label class="field">
            <span class="field__label">Default</span>
            <input class="input" placeholder="Placeholder text">
            <span class="field__hint">Helper text sits below the control.</span>
          </label>
          <label class="field">
            <span class="field__label">Focused <span class="muted" style="font-weight:400">(click to see)</span></span>
            <input class="input" value="BP-260910">
          </label>
          <div class="field field--error">
            <label class="field__label" for="sg-err">Error</label>
            <input class="input" id="sg-err" value="BP-2609" aria-invalid="true" aria-describedby="sg-err-msg">
            <span class="field__error" id="sg-err-msg">${icons.alert} Lot numbers are two letters followed by six digits.</span>
          </div>
          <label class="field">
            <span class="field__label">Disabled</span>
            <input class="input" value="Not editable" disabled style="background:var(--mist);color:var(--slate-light)">
          </label>
          <label class="field">
            <span class="field__label">Select</span>
            <select class="select"><option>Sort: Featured</option><option>Name A–Z</option></select>
          </label>
        </div>
        <div>
          <div class="label" style="margin-bottom:8px">Choice controls</div>
          <label class="check"><input type="checkbox" checked><span>Certificate available<span class="check__count">20</span></span></label>
          <label class="check"><input type="checkbox"><span>Multiple lots on file<span class="check__count">6</span></span></label>
          <label class="check"><input type="radio" name="sg-r" checked><span>Purchase order, net 30</span></label>
          <label class="check"><input type="radio" name="sg-r"><span>Card at checkout</span></label>

          <div class="label" style="margin:24px 0 8px">Quantity &amp; options</div>
          <div class="row" style="gap:12px;align-items:flex-start">
            <div class="qty" data-qty>
              <button type="button" aria-label="Decrease" data-step="-1">−</button>
              <input type="number" value="1" aria-label="Quantity">
              <button type="button" aria-label="Increase" data-step="1">+</button>
            </div>
            <div class="optset">
              <button class="opt" type="button" aria-pressed="true"><span class="opt__size">5 mg</span><span class="opt__price">$46.00</span></button>
              <button class="opt" type="button" aria-pressed="false"><span class="opt__size">10 mg</span><span class="opt__price">$78.00</span></button>
              <button class="opt" type="button" disabled><span class="opt__size">25 mg</span><span class="opt__price">Backorder</span></button>
            </div>
          </div>

          <div class="label" style="margin:24px 0 8px">Search</div>
          <form class="searchbar" onsubmit="return false">
            <span class="searchbar__icon">${icons.search}</span>
            <label class="visually-hidden" for="sg-search">Search</label>
            <input id="sg-search" type="search" placeholder="Search products, CAS, SKU or lot">
            <button class="btn btn--dark" type="submit">Search</button>
          </form>
        </div>
      </div>
    </section>

    <!-- ───────────────────────────────────────────────────── badges -->
    <section id="sg-5" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:24px">Status, chips &amp; notices</h2>
      <div class="row" style="gap:8px;margin-bottom:20px">
        ${C.stockBadge('in-stock')}${C.stockBadge('low-stock')}${C.stockBadge('out-of-stock')}
        <span class="status status--ok">${icons.checkCircle}Verified</span>
        <span class="status status--flat">${icons.clock}Archived</span>
      </div>
      <div class="row" style="gap:8px;margin-bottom:24px">
        <span class="chip">In stock<button type="button" aria-label="Remove filter">${icons.close}</button></span>
        <span class="chip">Certificate available<button type="button" aria-label="Remove filter">${icons.close}</button></span>
      </div>
      <div style="display:grid;gap:12px;max-width:70ch">
        <div class="notice">${icons.info}<div>Neutral notice for supporting context.</div></div>
        <div class="notice notice--accent">${icons.doc}<div>Accent notice for documentation and verification messages.</div></div>
        ${C.researchNotice()}
      </div>
    </section>

    <!-- ────────────────────────────────────────────────────────── cards -->
    <section id="sg-6" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:24px">Cards &amp; rows</h2>
      <div class="label" style="margin-bottom:12px">Product card</div>
      <div class="grid grid-3" style="margin-bottom:32px">${products.slice(0, 3).map(C.productCard).join('')}</div>

      <div class="label" style="margin-bottom:12px">Product list row</div>
      <div style="margin-bottom:32px">${C.productRow(products[0])}</div>

      <div class="label" style="margin-bottom:12px">Category panel &amp; research card</div>
      <div class="grid grid-2" style="margin-bottom:32px">
        ${C.categoryPanel(categories[0])}
        ${C.researchCard(articles[0])}
      </div>

      <div class="label" style="margin-bottom:12px">Verification result</div>
      <div style="max-width:520px">${C.verifyResultCard(lots[0])}</div>
    </section>

    <!-- ───────────────────────────────────────────────────────── tables -->
    <section id="sg-7" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:24px">Tables</h2>
      <div class="label" style="margin-bottom:12px">Specification table - label / value pairs</div>
      <table class="spec" style="margin-bottom:32px">
        <tbody>
          <tr><th scope="row">CAS number</th><td class="mono">137525-51-0</td></tr>
          <tr><th scope="row">Molecular weight</th><td class="mono">1419.53 g/mol</td></tr>
          <tr><th scope="row">Purity</th><td class="mono">99.4% - RP-HPLC / MS</td></tr>
        </tbody>
      </table>
      <div class="label" style="margin-bottom:12px">Data table - stacks to key/value rows below 640px</div>
      <table class="dtable dtable--zebra dtable--stack">
        <thead><tr><th>Product</th><th>Lot</th><th>Size</th><th>Test date</th><th>Purity</th><th>Status</th><th>Certificate</th></tr></thead>
        <tbody>${lots.slice(0, 3).map(C.lotRow).join('')}</tbody>
      </table>
    </section>

    <!-- ───────────────────────────────────────────────────── navigation -->
    <section id="sg-8" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:24px">Navigation</h2>
      <div class="label" style="margin-bottom:12px">Tabs</div>
      <div class="tabs" style="margin-bottom:32px" role="tablist">
        <button role="tab" aria-selected="true">Overview</button>
        <button role="tab" aria-selected="false">Specifications</button>
        <button role="tab" aria-selected="false">Documentation</button>
      </div>
      <div class="label" style="margin-bottom:12px">Stepper</div>
      <ol class="stepper" style="list-style:none;padding:0;margin:0 0 32px">
        <li class="stepper__step" data-state="done"><span class="stepper__n">${icons.check}</span><span class="stepper__label">Organisation</span></li>
        <li class="stepper__step" data-state="current"><span class="stepper__n">2</span><span class="stepper__label">Research</span></li>
        <li class="stepper__step" data-state="todo"><span class="stepper__n">3</span><span class="stepper__label">Purchasing</span></li>
      </ol>
      <div class="label" style="margin-bottom:12px">Accordion &amp; pagination</div>
      <div style="max-width:60ch;margin-bottom:24px">
        ${C.accordion([{ q: 'Open by default', a: 'Panels animate on grid-template-rows so no fixed heights are needed.' }, { q: 'Collapsed', a: 'Every trigger is a real button with aria-expanded.' }], 'sg-acc')}
      </div>
      ${C.pager(2, 5, '#sg-8')}
    </section>

    <!-- ────────────────────────────────────────────────────── feedback -->
    <section id="sg-9" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:24px">Feedback &amp; empty states</h2>
      <div class="row" style="gap:10px;margin-bottom:24px">
        <button class="btn btn--secondary" type="button" data-toast="BPC-157 added to your order (1)">Trigger a toast</button>
        <button class="btn btn--secondary" type="button" data-modal-open="region">Open a modal</button>
        <button class="btn btn--secondary" type="button" data-cart-open>Open the cart drawer</button>
      </div>
      <div class="label" style="margin-bottom:12px">Loading</div>
      <div style="display:grid;gap:10px;max-width:440px;margin-bottom:32px">
        <div class="skel" style="height:16px;width:70%"></div>
        <div class="skel" style="height:16px;width:90%"></div>
        <div class="skel" style="height:16px;width:45%"></div>
      </div>
      <div class="label" style="margin-bottom:12px">Empty</div>
      <div class="empty">
        <h3>No products match these filters</h3>
        <p>Clear a filter, or tell us what you are looking for and we will confirm whether it can be sourced.</p>
        <a class="btn btn--secondary" href="/contact/">Request a material</a>
      </div>
    </section>

    <!-- ───────────────────────────────────────────────────────── icons -->
    <section id="sg-10" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:8px">Icons</h2>
      <p class="muted small" style="margin-bottom:24px;max-width:60ch">
        One stroke family: 24px grid, 1.6px stroke, round caps and joins, no fills. Icons inherit
        <span class="mono">currentColor</span> and never carry meaning without an adjacent label.
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule);border-radius:var(--r-md);overflow:hidden">
        ${Object.keys(icons)
          .map(
            (k) => `<div style="background:var(--paper);padding:16px 8px;display:grid;place-items:center;gap:8px">
          <span style="color:var(--ink)">${icons[k]}</span>
          <span class="mono" style="font-size:9px;color:var(--slate-light)">${esc(k)}</span>
        </div>`
          )
          .join('')}
      </div>
    </section>

    <!-- ─────────────────────────────────────────────────── art direction -->
    <section id="sg-11" style="margin-bottom:64px">
      <h2 style="font-size:var(--t-h2);margin-bottom:8px">Art direction</h2>
      <p class="muted" style="margin-bottom:24px;max-width:64ch">
        Every image on this build is drawn SVG, generated deterministically from a seed so the same
        lot always renders the same trace. In production, product photography replaces the vial
        renders; the chromatogram and diagram system stays.
      </p>

      <div class="label" style="margin-bottom:12px">Chromatogram - the recurring motif</div>
      <div style="border:1px solid var(--rule);border-radius:var(--r-md);padding:16px;margin-bottom:32px" data-graph>
        ${chromatogram('BP-260910', { w: 720, h: 200 })}
      </div>

      <div class="grid grid-3" style="margin-bottom:32px">
        <div>
          <div class="label" style="margin-bottom:12px">Product photograph</div>
          <div style="border:1px solid var(--rule);border-radius:var(--r-md);overflow:hidden;aspect-ratio:1">${productShot('PP-1001', 'BPC-157')}</div>
        </div>
        <div>
          <div class="label" style="margin-bottom:12px">Category photograph</div>
          <div style="border:1px solid var(--rule);border-radius:var(--r-md);overflow:hidden;aspect-ratio:1;display:grid;place-items:center">${categoryPhoto('protein-research')}</div>
        </div>
        <div>
          <div class="label" style="margin-bottom:12px">Photography direction</div>
          <div class="card" style="padding:16px;height:100%">
            <p class="small muted">Isolated product on a neutral ground, soft realistic shadow, consistent camera height and vial angle across the catalogue. Labels in frame stay blank: the shot shows the format, not a specific compound. Laboratory and analytical detail for editorial, matched to what the piece is actually about.</p>
            <p class="small" style="margin-top:12px;color:var(--stop)"><strong>Never:</strong> syringes or anything implying human administration, branded or recognisable drug products, vaccine vials, people smiling at camera, fitness imagery, neon technology graphics, DNA helices.</p>
            <p class="small muted" style="margin-top:12px">Sources and licences: <span class="mono">public/img/CREDITS.md</span></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>`;

  return page({
    title: 'Design system',
    description: 'Colour, typography, spacing, components and states for the Purely Peptides Hub interface.',
    canonical: '/styleguide/',
    active: null,
    body,
  });
};
