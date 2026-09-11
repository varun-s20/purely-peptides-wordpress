'use strict';

const { page, esc } = require('../layout');
const C = require('../components');
const { icons, chromatogram, articlePhoto } = require('../art');
const { articles, products } = require('../data');

const FILTERS = ['All', 'Research', 'Methods', 'Quality', 'Product Guides', 'Storage', 'Industry'];

/* ------------------------------------------------------------ library page */

function library() {
  const lead = articles[0];
  const rest = articles.slice(1);
  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Research' }])}

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Research library</span>
    <h1>Research &amp; technical resources</h1>
    <p>
      Method notes, quality writing and handling guidance from the team that runs our analytical
      programme. Written for people who need the detail, not the summary.
    </p>
  </div>
</div>

<div class="wrap">
  <div class="tabs" style="margin-top:24px" role="tablist" aria-label="Filter by topic">
    ${FILTERS.map((f, i) => `<a href="/research/${i ? `?filter=${encodeURIComponent(f)}` : ''}" role="tab" ${i === 0 ? 'aria-selected="true"' : 'aria-selected="false"'}>${esc(f)}</a>`).join('')}
  </div>
</div>

<section class="section section--tight">
  <div class="wrap">
    <a href="/research/${lead.slug}/" style="text-decoration:none;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:center" class="feature-lead">
      <div style="border:1px solid var(--rule);border-radius:var(--r-lg);overflow:hidden;background:var(--mist)">
        ${articlePhoto(lead.slug)}
      </div>
      <div>
        <span class="rcard__cat">${esc(lead.category)} · Featured</span>
        <h2 style="margin-bottom:16px">${esc(lead.title)}</h2>
        <p class="prose" style="font-size:1.0625rem;max-width:48ch">${esc(lead.abstract)}</p>
        <div class="row" style="gap:20px;margin-top:24px">
          <span class="rcard__meta">${esc(lead.author)}</span>
          <span class="rcard__meta">${esc(lead.dateLabel)}</span>
          <span class="rcard__meta">${esc(lead.readTime)} read</span>
        </div>
        <span class="link-arrow" style="margin-top:20px"><span>Read article</span>${icons.arrow}</span>
      </div>
    </a>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    ${C.sectionHead({ title: 'All resources', body: `${articles.length} articles across methods, quality and handling.` })}
    <div class="grid grid-3">${rest.map(C.researchCard).join('')}</div>
    ${C.pager(1, 2, '/research/')}
  </div>
</section>

<section class="section on-dark">
  <div class="wrap split split--even" style="align-items:center">
    <div>
      <span class="eyebrow">Technical enquiries</span>
      <h2>Question the library does not answer?</h2>
      <p style="margin-top:14px;max-width:44ch">
        Specification and method questions go to the analytical team directly. Include the product
        and, where relevant, the lot number.
      </p>
    </div>
    <div class="row" style="gap:12px">
      <a class="btn btn--onDark btn--lg" href="/contact/?topic=product">Ask the analytical team</a>
      <a class="btn btn--outlineDark btn--lg" href="/faq/">Read the FAQs</a>
    </div>
  </div>
</section>

<style>
@media (max-width: 900px) { .feature-lead { grid-template-columns: 1fr !important; gap: 24px !important; } }
</style>`;

  return page({
    title: 'Research & technical resources',
    description: 'Analytical methods, quality documentation guidance and peptide handling notes from the Purely Peptides technical team.',
    canonical: '/research/',
    active: 'Research',
    body,
  });
}

/* ----------------------------------------------------------- article bodies */

const BODIES = {
  'reading-an-hplc-purity-result': (a) => ({
    toc: ['What the number measures', 'The separation behind it', 'What HPLC cannot see', 'Checking a chromatogram', 'Practical guidance'],
    html: `
<h2 id="s1">What the number measures</h2>
<p>A purity figure on a peptide certificate is almost always an <em>area percent</em>: the integrated area of the main chromatographic peak divided by the total integrated area of all detected peaks, expressed as a percentage. It is a ratio of detector response, not a ratio of mass.</p>
<p>That distinction matters because the detector does not respond equally to everything. Ultraviolet detection at 220 nm responds to the peptide bond, so it sees peptidic material well. It responds weakly or not at all to species without a strong chromophore at that wavelength - residual salts, water, counterions and many small-molecule process residues. A peptide that is 99% pure by area can still be a substantially smaller fraction of the vial contents by mass.</p>

<h2 id="s2">The separation behind it</h2>
<p>Reversed-phase HPLC separates by hydrophobicity. The sample is loaded onto a non-polar stationary phase, usually C18-bonded silica, and eluted with an increasing proportion of organic solvent, typically acetonitrile with 0.1% trifluoroacetic acid as an ion-pairing agent. More hydrophobic species are retained longer and elute later.</p>
<p>Because the separation depends on the gradient, the column chemistry, the temperature and the ion-pairing agent, two laboratories running the same sample under different conditions can legitimately report different purity figures. A method that co-elutes an impurity with the main peak will report a higher number than a method that resolves them. This is the single most common reason for a discrepancy between certificates.</p>

<figure class="figure">
  <div class="figure__frame" data-graph>${chromatogram('article-fig-1', { w: 720, h: 260 })}</div>
  <figcaption><strong>Figure 1.</strong> A typical peptide chromatogram. The main peak elutes at 13.4 minutes; the smaller features before and after it are synthesis-related impurities. Area percent is computed across every integrated feature on this trace.</figcaption>
</figure>

<h2 id="s3">What HPLC cannot see</h2>
<p>Three categories of content are routinely invisible to a standard RP-HPLC purity method:</p>
<ul>
  <li><strong>Non-chromophoric content.</strong> Water, residual salts and counterions such as trifluoroacetate contribute mass but little absorbance at 220 nm.</li>
  <li><strong>Co-eluting species.</strong> An impurity that shares the retention time of the main peak is integrated as part of it. Deletion sequences differing by a single small residue are the classic case.</li>
  <li><strong>Species that never elute.</strong> Highly hydrophobic aggregates can be retained on the column and never reach the detector within the gradient.</li>
</ul>
<p>None of these are failures of the method. They are the boundary of what a single method can establish, which is why identity is tested separately by mass spectrometry and why net peptide content is a separate determination.</p>

<h2 id="s4">Checking a chromatogram</h2>
<p>When a certificate includes the trace rather than only the number, four things are worth checking before accepting the figure:</p>
<ol>
  <li><strong>Baseline behaviour.</strong> A drifting or noisy baseline makes integration boundaries arbitrary and can inflate or deflate the reported area.</li>
  <li><strong>Peak shape.</strong> A pronounced shoulder or tail on the main peak often indicates an unresolved impurity rather than a chromatographic artefact.</li>
  <li><strong>Run length.</strong> A gradient that ends shortly after the main peak may not have eluted late-running material.</li>
  <li><strong>Integration marks.</strong> Where the software placed the peak boundaries determines the number. Wide boundaries around the main peak absorb neighbouring impurities into it.</li>
</ol>

<h2 id="s5">Practical guidance</h2>
<p>Treat the purity figure as one line in a record rather than a grade. Record the lot number with your experimental data, keep the certificate with it, and note the method conditions if you intend to compare material across suppliers. Where an assay is sensitive to a specific impurity class, ask whether the method resolves it before assuming the headline number covers the question.</p>
<p>If you need net peptide content, an endotoxin figure or a specific residual solvent result, these are separate determinations and should be requested explicitly. They are not implied by an area-percent purity result.</p>`,
    refs: [
      'Mant CT, Chen Y, Hodges RS. Reversed-phase high-performance liquid chromatography of peptides. Journal of Chromatography A, 2007.',
      'European Pharmacopoeia, general chapter on liquid chromatography, current edition.',
      'Snyder LR, Kirkland JJ, Dolan JW. Introduction to Modern Liquid Chromatography, 3rd edition.',
    ],
  }),

  'what-a-certificate-of-analysis-contains': () => ({
    toc: ['The four questions', 'Field by field', 'Weak certificates', 'What to keep on file'],
    html: `
<h2 id="s1">The four questions</h2>
<p>A usable certificate of analysis answers four questions without ambiguity: what was tested, by whom, when, and against what specification. A document that omits any one of these cannot be evaluated, however well presented it is.</p>
<p>The most common omission is the second. A certificate that reports results without naming the testing laboratory places the entire weight of the document on the supplier's own assertion. That is not automatically a problem - many suppliers test in-house competently - but it is a different kind of evidence from an independent report, and the document should make clear which it is.</p>

<h2 id="s2">Field by field</h2>
<p><strong>Product and lot.</strong> The lot number is what makes the document specific. A certificate that names only the product applies to a category, not to the vial in your hand.</p>
<p><strong>Test date.</strong> Establishes when the material was assessed, which bounds any claim about its condition. A test date long before the fill date, or long after, is worth asking about.</p>
<p><strong>Method.</strong> A result without a method is uninterpretable. "Purity 99%" means one thing by RP-HPLC at 220 nm and another by an entirely different technique.</p>
<p><strong>Specification.</strong> The acceptance criterion the result is judged against. Without it, "conforms" is a claim rather than a finding.</p>
<p><strong>Result.</strong> The measured value, ideally alongside the raw trace or spectrum rather than only the derived figure.</p>
<p><strong>Release signature.</strong> A named person accountable for the document, with a role.</p>

<h2 id="s3">Weak certificates</h2>
<p>Several patterns recur in documents that carry less information than they appear to:</p>
<ul>
  <li>Results quoted to a precision the method does not support.</li>
  <li>A generic date range instead of a test date.</li>
  <li>Images of a chromatogram with the axis labels removed or illegible.</li>
  <li>A specification stated as "N/A" while the result is still marked as passing.</li>
  <li>No lot number anywhere on the document.</li>
</ul>

<h2 id="s4">What to keep on file</h2>
<p>Store the certificate alongside the experimental record that used the material, indexed by lot number rather than by product. When a result later needs explaining, the lot is the key that connects the experiment back to the supply.</p>`,
    refs: [
      'ISO/IEC 17025:2017, General requirements for the competence of testing and calibration laboratories.',
      'United States Pharmacopeia, general notices on certificates of analysis, current edition.',
    ],
  }),

  'storage-and-reconstitution-of-lyophilised-peptides': () => ({
    toc: ['Why lyophilised material is stable', 'The four degradation routes', 'Storage practice', 'Reconstitution', 'Aliquoting'],
    html: `
<h2 id="s1">Why lyophilised material is stable</h2>
<p>Freeze-drying removes the water that most degradation chemistry requires. A dry, sealed, cold peptide has very little available to react with, which is why lyophilised material stored correctly can remain within specification for years while the same peptide in solution may degrade within weeks.</p>
<p>Nearly every avoidable loss of integrity in the laboratory comes from reintroducing one of the three things lyophilisation removed: water, warmth, or oxygen.</p>

<h2 id="s2">The four degradation routes</h2>
<p><strong>Hydrolysis.</strong> Water attacks the peptide backbone, with Asp-Pro and Asp-Gly bonds particularly labile. Rate rises sharply with moisture content and temperature.</p>
<p><strong>Oxidation.</strong> Methionine, cysteine and tryptophan residues oxidise on exposure to air, accelerated by light and trace metals.</p>
<p><strong>Deamidation.</strong> Asparagine and glutamine convert to aspartate and glutamate, shifting mass and charge. Strongly pH- and temperature-dependent.</p>
<p><strong>Aggregation.</strong> Hydrophobic sequences associate in solution, often irreversibly, and freeze-thaw cycling drives this efficiently.</p>

<h2 id="s3">Storage practice</h2>
<p>Store sealed lyophilised material at −20 °C or below, desiccated and protected from light. A frost-free freezer that cycles its temperature is a poorer choice than a stable manual-defrost unit, because each cycle drives condensation inside the vial.</p>
<p>Always allow a sealed vial to reach room temperature before breaking the seal. Opening a cold vial in ambient air condenses moisture directly onto the cake, which is the most common way dry material acquires water in ordinary use.</p>

<h2 id="s4">Reconstitution</h2>
<p>Centrifuge briefly before opening so that material dislodged in transit is at the bottom of the vial. Add solvent slowly down the vial wall rather than directly onto the cake, and allow it to dissolve without vigorous agitation - shaking introduces air and promotes aggregation of hydrophobic sequences.</p>
<p>Solvent choice follows the sequence. Strongly basic peptides generally dissolve in dilute acetic acid; acidic peptides in dilute ammonium hydroxide; hydrophobic sequences may need a small volume of DMSO or acetonitrile before dilution into aqueous buffer.</p>

<h2 id="s5">Aliquoting</h2>
<p>Reconstitute once, aliquot into single-use volumes, and freeze. The purpose is to make repeated freeze-thaw cycles unnecessary - the cycle itself does more damage to most peptides than the elapsed storage time.</p>`,
    refs: [
      'Manning MC, Chou DK, Murphy BM, et al. Stability of protein pharmaceuticals: an update. Pharmaceutical Research, 2010.',
      'Carpenter JF, Chang BS, Garzon-Rodriguez W, Randolph TW. Rational design of stable lyophilized protein formulations.',
    ],
  }),
};

function genericBody(a) {
  return {
    toc: ['Background', 'Method considerations', 'Interpretation', 'Summary'],
    html: `
<h2 id="s1">Background</h2>
<p>${esc(a.abstract)}</p>
<p>This note is written for laboratory staff evaluating supplied material rather than for a general audience. It assumes familiarity with routine analytical practice and does not restate it.</p>

<h2 id="s2">Method considerations</h2>
<p>Results are only interpretable alongside the conditions that produced them. Where a figure is quoted in this article, the method, detection and acceptance criterion are given with it; where a supplier quotes a figure without those, the figure should be treated as incomplete rather than as evidence.</p>
<figure class="figure">
  <div class="figure__frame" data-graph>${chromatogram(a.slug, { w: 720, h: 240 })}</div>
  <figcaption><strong>Figure 1.</strong> Representative analytical trace referenced in the discussion below.</figcaption>
</figure>

<h2 id="s3">Interpretation</h2>
<p>Two questions are worth separating whenever analytical data is used to make a purchasing decision. The first is whether the material is what the label says it is, which is an identity question. The second is how much of the vial is that material, which is a purity and content question. Different methods answer each, and a document that addresses only one should not be read as addressing both.</p>

<h2 id="s4">Summary</h2>
<p>Record the lot number with your experimental data, keep the certificate with the record, and request the specific determination you need rather than inferring it from a headline figure.</p>`,
    refs: [
      'European Pharmacopoeia, general chapters on chromatographic separation techniques, current edition.',
      'ISO/IEC 17025:2017, General requirements for the competence of testing and calibration laboratories.',
    ],
  };
}

/* ------------------------------------------------------------ article page */

function articlePage(a) {
  const content = (BODIES[a.slug] || genericBody)(a);
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 2);
  const relatedProducts = products.slice(0, 3);

  const body = `
${C.crumbs([{ label: 'Home', href: '/' }, { label: 'Research', href: '/research/' }, { label: a.title }])}

<div class="wrap article__head">
  <span class="eyebrow">${esc(a.category)}</span>
  <h1>${esc(a.title)}</h1>
  <div class="article__byline">
    <span><span class="label" style="display:inline">Author</span> ${esc(a.author)}, ${esc(a.role)}</span>
    <span><span class="label" style="display:inline">Published</span> <span class="mono">${esc(a.dateLabel)}</span></span>
    <span><span class="label" style="display:inline">Reading time</span> <span class="mono">${esc(a.readTime)}</span></span>
  </div>
  <div class="article__lead">${articlePhoto(a.slug)}</div>
</div>

<div class="wrap article">
  <nav class="article__toc" aria-label="Article contents">
    <h2>Contents</h2>
    ${content.toc.map((t, i) => `<a href="#s${i + 1}"${i === 0 ? ' class="is-active"' : ''}>${esc(t)}</a>`).join('')}
    <a href="#references">References</a>
  </nav>

  <article>
    <p class="article__abstract">${esc(a.abstract)}</p>
    <div class="prose">${content.html}</div>

    <h2 id="references" style="font-size:var(--t-h3);margin:56px 0 20px">References</h2>
    <ol class="refs">${content.refs.map((r) => `<li><span>${esc(r)}</span></li>`).join('')}</ol>

    <div style="margin-top:40px">${C.researchNotice('Technical writing on this site is provided for laboratory context. It does not describe or imply any use of these materials in humans or animals.')}</div>
  </article>

  <aside class="article__aside">
    <div class="card" style="padding:20px">
      <span class="label">Related materials</span>
      <ul style="list-style:none;padding:0;margin:12px 0 0;display:grid;gap:2px">
        ${relatedProducts
          .map(
            (p) => `<li><a href="/products/${p.slug}/" style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--rule);text-decoration:none;font-size:var(--t-small)">
          <span>${esc(p.name)}</span><span class="mono micro muted">${esc(p.sku)}</span></a></li>`
          )
          .join('')}
      </ul>
    </div>
    <div class="card" style="padding:20px">
      <span class="label">Related documentation</span>
      <p class="small muted" style="margin-top:10px">Search certificates by product or lot number.</p>
      <a class="btn btn--secondary btn--block" style="margin-top:14px" href="/certificates/">Certificate library</a>
    </div>
    <div class="card" style="padding:20px">
      <span class="label">Continue reading</span>
      <ul style="list-style:none;padding:0;margin:12px 0 0;display:grid;gap:12px">
        ${related
          .map(
            (r) => `<li><a href="/research/${r.slug}/" style="text-decoration:none;font-size:var(--t-small);font-weight:500;line-height:1.4">${esc(r.title)}</a>
          <div class="rcard__meta" style="margin-top:4px">${esc(r.category)}</div></li>`
          )
          .join('')}
      </ul>
    </div>
  </aside>
</div>`;

  return page({
    title: a.title,
    description: a.excerpt,
    canonical: `/research/${a.slug}/`,
    active: 'Research',
    body,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.excerpt,
      datePublished: a.date,
      author: { '@type': 'Person', name: a.author, jobTitle: a.role },
      publisher: { '@type': 'Organization', name: 'Purely Peptides LLC' },
      articleSection: a.category,
    },
  });
}

module.exports = { library, articlePage };
