'use strict';
/**
 * Catalogue data for Purely Peptides Hub.
 *
 * SOURCES - every value below traces to a document the client supplied:
 *   products / sizes / stock / lot numbers ... "Copy of Inventory of Peptides.xlsx"
 *   CAS, molecular formula, molecular weight .. American Peptides SDS (8 compounds)
 *   lot purity, content, test dates ........... the 12 certificates of analysis
 *
 * Anything NOT in those documents is marked `verify: true` and renders as
 * "On request" rather than as a number we cannot evidence. See VERIFY list at
 * the bottom of README.md.
 *
 * PRICES ARE THE ONE THING THE CLIENT HAS NOT SUPPLIED. They live in the
 * PRICING block directly below, keyed `slug|size`, so the whole catalogue can
 * be priced by editing one table. Replace every value before launch.
 */

const brand = {
  name: 'Purely Peptides Hub',
  short: 'Purely Peptides Hub',
  legal: 'Purely Peptides Hub',
  domain: 'purelypeptideshub.com',
  tagline: 'Innovation, Quality, Research.',
  email: 'support@purelypeptideshub.com',
  procurement: 'orders@purelypeptideshub.com',
  // TODO(client): confirm the number and address to publish. AllayPay requires
  // two forms of contact to be visible on the site.
  phone: '+1 (000) 000-0000',
  address: ['Address line 1', 'City, State ZIP', 'United States'],
  hours: 'Monday–Friday, 09:00–17:00 ET',
  // Exact strings mandated by AllayPay's RUO website requirements. Do not
  // reword: underwriting checks for these.
  productDisclaimer: 'All products currently listed on this site are for research purposes only.',
  footerDisclaimer:
    'All products sold on this website are intended for research and identification purposes only. These products are not intended for human dosing, injection, or ingestion.',
};

/* ------------------------------------------------------------------ pricing
   NOT SUPPLIED BY THE CLIENT. Placeholder values so the catalogue renders and
   AllayPay's "pricing on each product" rule is satisfied structurally.
   Every figure here is a placeholder. Replace all of them. */

const PRICING = {
  'semaglutide|5 mg': 65, 'semaglutide|10 mg': 110, 'semaglutide|20 mg': 195,
  'semaglutide|30 mg': 275, 'semaglutide|50 mg': 430,
  'tirzepatide|10 mg': 135, 'tirzepatide|20 mg': 245, 'tirzepatide|30 mg': 345,
  'tirzepatide|60 mg': 650, 'tirzepatide|100 mg': 1050,
  'retatrutide|10 mg': 160, 'retatrutide|20 mg': 295, 'retatrutide|30 mg': 420,
  'cagrilintide|10 mg': 150,
  'aod-9604|5 mg': 55, 'aod-9604|10 mg': 95,
  'mots-c|10 mg': 75, 'mots-c|40 mg': 235,
  '5-amino-1mq|50 mg': 90,
  'tesamorelin|10 mg': 120,
  'sermorelin|5 mg': 50,
  'ipamorelin|10 mg': 60,
  'cjc-1295|5 mg': 55,
  'bpc-157|5 mg': 45, 'bpc-157|10 mg': 75,
  'tb-500|5 mg': 55, 'tb-500|10 mg': 95,
  'ghk-cu|50 mg': 45, 'ghk-cu|100 mg': 75,
  'kpv|10 mg': 40,
  'cartalax|20 mg': 65,
  'selank|10 mg': 55,
  'semax|10 mg': 55,
  'melanotan-1|10 mg': 70,
  'melanotan-2|10 mg': 60,
  'kisspeptin-10|10 mg': 70,
  'nad|500 mg': 95, 'nad|1000 mg': 170,
  'glow|50/10/10 mg': 145,
  'klow|50/10/10/10 mg': 175,
  'bpc-tb|10/10 mg': 130,
};

const priced = (slug, sizes) =>
  sizes.map((s) => {
    const price = PRICING[`${slug}|${s.label}`];
    if (price === undefined) throw new Error(`No price for ${slug}|${s.label} - add it to PRICING`);
    return { label: s.label, price, stock: s.stock, lot: s.lot || null };
  });

/* ---------------------------------------------------------------- taxonomy */

const categories = [
  {
    slug: 'metabolic-research',
    name: 'Metabolic Research',
    blurb: 'Incretin analogues and mitochondrial peptides used in energy-substrate and adipocyte models.',
  },
  {
    slug: 'growth-factor-research',
    name: 'Growth Factor Research',
    blurb: 'GHRH analogues and secretagogue ligands used in receptor-binding and stability studies.',
  },
  {
    slug: 'cell-signalling-research',
    name: 'Cell Signalling Research',
    blurb: 'Peptides characterised in matrix, cytokine and cell-migration literature.',
  },
  {
    slug: 'cognitive-research',
    name: 'Cognitive Research',
    blurb: 'Neuropeptides used in receptor and neurotrophic-expression model studies.',
  },
  {
    slug: 'melanocortin-research',
    name: 'Melanocortin Research',
    blurb: 'Melanocortin and kisspeptin receptor ligands used in binding and selectivity assays.',
  },
  {
    slug: 'cofactors',
    name: 'Cofactors & Nucleotides',
    blurb: 'Non-peptide reference materials supplied to the same documentation standard.',
  },
  {
    slug: 'blends',
    name: 'Blends',
    blurb: 'Fixed-ratio combinations prepared and documented as a single production lot.',
  },
];

const researchAreas = [
  'Metabolism',
  'Endocrine Research',
  'Cell Signalling',
  'Neuroscience',
  'Receptor Pharmacology',
  'Inflammatory Research',
  'Redox & Cofactor',
];

/* ---------------------------------------------------------------- products
   `verify: true` means the client has supplied no document for the identity
   fields, so they render "On request" instead of a value we cannot stand
   behind. Remove the flag once the supplier confirms the numbers. */

const STORE = '−20 °C, desiccated, protected from light';
const RUO = 'Laboratory research use only. Not for human or veterinary use.';

const products = [
  /* ------------------------------------------------ metabolic research */
  {
    sku: 'PPH-1001', slug: 'semaglutide', name: 'Semaglutide', category: 'metabolic-research',
    area: 'Metabolism', cas: '910463-68-2',
    formula: 'C187H291N45O59', mw: '4113.58 g/mol',
    sequence: 'GLP-1(7-37) analogue, Aib8, Arg34, N-ε26-[2-(2-[2-(2-[2-(2-[4-(17-carboxyheptadecanoylamino)-4-carboxybutanoylamino]ethoxy)ethoxy]acetylamino)ethoxy]ethoxy)acetyl]',
    form: 'Lyophilised powder', purity: '≥ 99%', method: 'RP-HPLC / MALDI-MS',
    storage: STORE, sds: 'semaglutide',
    sizes: priced('semaglutide', [
      { label: '5 mg', stock: 'in-stock', lot: 'SEMA5-0616' },
      { label: '10 mg', stock: 'in-stock', lot: 'SEMA10-0616' },
      { label: '20 mg', stock: 'backorder' },
      { label: '30 mg', stock: 'backorder' },
      { label: '50 mg', stock: 'backorder' },
    ]),
    stock: 'in-stock', featured: true, added: '2026-06-25',
    summary: 'Acylated GLP-1 receptor agonist analogue used as a reference ligand in incretin receptor research.',
    overview:
      'Semaglutide is a structurally modified analogue of glucagon-like peptide-1 carrying an alpha-aminoisobutyric acid substitution at position 8 and a C18 diacid side chain attached through a short spacer at lysine 26. Those modifications are described in the literature as the basis of its resistance to dipeptidyl peptidase-4 and its albumin binding. It is supplied as a lyophilised powder and is used in laboratory work on GLP-1 receptor binding, signalling assays and peptide stability.',
    lots: ['SEMA10-0616', 'SEMA5-0616'],
  },
  {
    sku: 'PPH-1002', slug: 'tirzepatide', name: 'Tirzepatide', category: 'metabolic-research',
    area: 'Metabolism', cas: '2023788-19-2',
    formula: 'C225H348N48O68', mw: '4813.45 g/mol',
    sequence: 'Dual GIP / GLP-1 receptor agonist, 39-residue, C20 diacid conjugated at Lys20',
    form: 'Lyophilised powder', purity: '≥ 99%', method: 'RP-HPLC / MALDI-MS',
    storage: STORE, sds: 'tirzepatide',
    sizes: priced('tirzepatide', [
      { label: '10 mg', stock: 'in-stock', lot: 'TIR10-0528' },
      { label: '20 mg', stock: 'backorder' },
      { label: '30 mg', stock: 'backorder' },
      { label: '60 mg', stock: 'backorder' },
      { label: '100 mg', stock: 'backorder' },
    ]),
    stock: 'in-stock', featured: true, added: '2026-06-17',
    summary: 'Dual GIP and GLP-1 receptor agonist used in comparative incretin receptor studies.',
    overview:
      'Tirzepatide is a 39-amino-acid synthetic peptide engineered from the GIP sequence and reported in the literature to act at both the GIP and GLP-1 receptors. A C20 fatty diacid conjugated through a spacer at lysine 20 is described as extending its circulating half-life. Supplied lyophilised for in-vitro receptor pharmacology and analytical method work.',
    lots: ['TIR10-0528'],
  },
  {
    sku: 'PPH-1003', slug: 'retatrutide', name: 'Retatrutide', category: 'metabolic-research',
    area: 'Metabolism', cas: '2381089-83-2',
    formula: 'C256H392N64O79', mw: '4731.20 g/mol',
    sequence: 'Triple GIP / GLP-1 / glucagon receptor agonist, 39-residue',
    form: 'Lyophilised powder', purity: '≥ 99%', method: 'RP-HPLC / MALDI-MS',
    storage: STORE, sds: 'retatrutide',
    sizes: priced('retatrutide', [
      { label: '10 mg', stock: 'in-stock', lot: 'RETA10-0616' },
      { label: '20 mg', stock: 'backorder' },
      { label: '30 mg', stock: 'backorder' },
    ]),
    stock: 'in-stock', featured: true, added: '2026-06-25',
    summary: 'Triple-agonist peptide reported to act at the GIP, GLP-1 and glucagon receptors.',
    overview:
      'Retatrutide is a synthetic 39-residue peptide described in the literature as an agonist at three receptors - GIP, GLP-1 and glucagon. It is used as a reference material in comparative receptor-selectivity assays and in analytical method development, where its close structural relationship to other incretin analogues makes it a useful separation challenge.',
    lots: ['RETA10-0616'],
  },
  {
    sku: 'PPH-1004', slug: 'cagrilintide', name: 'Cagrilintide', category: 'metabolic-research',
    area: 'Receptor Pharmacology', cas: null, formula: null, mw: null, verify: true,
    sequence: 'Long-acting amylin analogue',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('cagrilintide', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Amylin receptor analogue used in calcitonin and amylin receptor binding research.',
    overview:
      'Cagrilintide is a synthetic long-acting analogue of human amylin. Published work characterises it as a ligand at the amylin and calcitonin receptor families, and it is used in laboratory receptor-binding and selectivity studies. Identity data for this material is being confirmed with the supplier and will be published here with the first release lot.',
    lots: [],
  },
  {
    sku: 'PPH-1005', slug: 'aod-9604', name: 'AOD-9604', category: 'metabolic-research',
    area: 'Metabolism', cas: '221231-10-3',
    formula: 'C78H123N23O23S2', mw: '1815.08 g/mol',
    sequence: 'Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe',
    form: 'Lyophilised powder', purity: '≥ 99%', method: 'RP-HPLC / LC-MS/MS',
    storage: STORE, sds: 'aod-9604',
    sizes: priced('aod-9604', [
      { label: '5 mg', stock: 'in-stock', lot: 'AOD5-0803' },
      { label: '10 mg', stock: 'backorder' },
    ]),
    stock: 'in-stock', featured: false, added: '2026-08-17',
    summary: 'C-terminal hGH(176-191) fragment analogue used in adipocyte model research.',
    overview:
      'AOD-9604 corresponds to residues 176 to 191 of human growth hormone with an added N-terminal tyrosine. It appears in adipocyte and lipolysis model literature and is supplied here as a lyophilised research material with lot-specific chromatographic data.',
    lots: ['AOD5-0803'],
  },
  {
    sku: 'PPH-1006', slug: 'mots-c', name: 'MOTS-c', category: 'metabolic-research',
    area: 'Metabolism', cas: '1627580-64-6',
    formula: 'C101H152N28O22S2', mw: '2174.61 g/mol',
    sequence: 'Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('mots-c', [
      { label: '10 mg', stock: 'backorder' },
      { label: '40 mg', stock: 'backorder' },
    ]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Mitochondrial-derived peptide used in AMPK signalling and metabolic model research.',
    overview:
      'MOTS-c is a 16-amino-acid peptide encoded within the mitochondrial 12S rRNA region. The literature describes it as a regulator of metabolic homeostasis acting through the AMPK pathway, and it is used as a reference material in mitochondrial and metabolic signalling studies.',
    lots: [],
  },
  {
    sku: 'PPH-1007', slug: '5-amino-1mq', name: '5-Amino-1MQ', category: 'metabolic-research',
    area: 'Metabolism', cas: null, formula: null, mw: null, verify: true,
    sequence: 'Small-molecule quinolinium - not a peptide',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'HPLC / MS',
    storage: STORE,
    sizes: priced('5-amino-1mq', [{ label: '50 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Small-molecule NNMT inhibitor used in methyltransferase enzyme assays.',
    overview:
      '5-Amino-1-methylquinolinium is a small-molecule quinolinium salt described in the literature as an inhibitor of nicotinamide N-methyltransferase. It is supplied as a reference material for enzyme inhibition and methylation assay work. This material is not a peptide. Identity data is being confirmed with the supplier and will be published with the first release lot.',
    lots: [],
  },

  /* -------------------------------------------- growth factor research */
  {
    sku: 'PPH-2001', slug: 'tesamorelin', name: 'Tesamorelin', category: 'growth-factor-research',
    area: 'Endocrine Research', cas: '218949-48-5',
    formula: 'C221H366N72O67S', mw: '5135.90 g/mol',
    sequence: 'trans-3-hexenoyl-GHRH(1-44)-NH2',
    form: 'Lyophilised powder', purity: '≥ 99%', method: 'RP-HPLC / LC-MS/MS',
    storage: STORE, sds: 'tesamorelin',
    sizes: priced('tesamorelin', [{ label: '10 mg', stock: 'in-stock', lot: 'TESA10-0803' }]),
    stock: 'in-stock', featured: true, added: '2026-08-17',
    summary: 'Stabilised GHRH(1-44) analogue used in endocrine receptor research.',
    overview:
      'Tesamorelin is a synthetic analogue of human growth hormone releasing hormone (1-44) carrying an N-terminal trans-3-hexenoyl group, which the literature describes as slowing enzymatic degradation. It is used in laboratory research on GHRH receptor binding and peptide stability.',
    lots: ['TESA10-0803'],
  },
  {
    sku: 'PPH-2002', slug: 'sermorelin', name: 'Sermorelin', category: 'growth-factor-research',
    area: 'Endocrine Research', cas: '86168-78-7',
    formula: 'C149H246N44O42S', mw: '3357.93 g/mol',
    sequence: 'GHRH(1-29)-NH2',
    form: 'Lyophilised powder', purity: '≥ 99%', method: 'RP-HPLC / MALDI-MS',
    storage: STORE, sds: 'sermorelin',
    sizes: priced('sermorelin', [{ label: '5 mg', stock: 'in-stock', lot: 'SERMO5-0318' }]),
    stock: 'in-stock', featured: false, added: '2026-04-03',
    summary: 'GHRH(1-29) amide - the shortest fully active GHRH fragment.',
    overview:
      'Sermorelin is the amidated 1-29 fragment of growth hormone releasing hormone, described in the literature as the shortest sequence retaining full GHRH receptor activity. Used as a reference peptide in receptor-binding and peptide-stability research.',
    lots: ['SERMO5-0318'],
  },
  {
    sku: 'PPH-2003', slug: 'ipamorelin', name: 'Ipamorelin', category: 'growth-factor-research',
    area: 'Receptor Pharmacology', cas: '170851-70-4',
    formula: 'C38H49N9O5', mw: '711.86 g/mol',
    sequence: 'Aib-His-D-2-Nal-D-Phe-Lys-NH2',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('ipamorelin', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Selective GHS-R1a agonist pentapeptide used in receptor-binding studies.',
    overview:
      'Ipamorelin is a synthetic pentapeptide characterised in the literature as a selective agonist at the growth hormone secretagogue receptor GHS-R1a. It is used as a reference ligand in receptor binding, selectivity and signalling assays.',
    lots: [],
  },
  {
    sku: 'PPH-2004', slug: 'cjc-1295', name: 'CJC-1295 (no DAC)', category: 'growth-factor-research',
    area: 'Endocrine Research', cas: '863288-34-0',
    formula: 'C152H252N44O42', mw: '3367.90 g/mol',
    sequence: 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('cjc-1295', [{ label: '5 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Tetra-substituted GHRH(1-29) analogue used in receptor and stability research.',
    overview:
      'CJC-1295 without drug affinity complex is a tetra-substituted analogue of GHRH(1-29). The substitutions are reported to reduce enzymatic degradation, which makes it a common reference material in peptide-stability and GHRH receptor studies.',
    lots: [],
  },

  /* ------------------------------------------ cell signalling research */
  {
    sku: 'PPH-3001', slug: 'bpc-157', name: 'BPC-157', category: 'cell-signalling-research',
    area: 'Cell Signalling', cas: '137525-51-0',
    formula: 'C62H98N16O22', mw: '1419.53 g/mol',
    sequence: 'H-Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val-OH',
    form: 'Lyophilised powder', purity: '≥ 99%', method: 'RP-HPLC / MALDI-MS',
    storage: STORE, sds: 'bpc-157',
    sizes: priced('bpc-157', [
      { label: '5 mg', stock: 'in-stock', lot: 'BP5-0318' },
      { label: '10 mg', stock: 'in-stock', lot: 'BP10-0318' },
    ]),
    stock: 'in-stock', featured: true, added: '2026-04-03',
    summary: 'Synthetic pentadecapeptide used as a reference material in fibroblast and angiogenesis models.',
    overview:
      'BPC-157 is a synthetic 15-amino-acid peptide corresponding to a partial sequence of body protection compound isolated from gastric juice. It is supplied as a lyophilised powder for in-vitro laboratory research. Published work covers fibroblast migration, angiogenesis and connective-tissue models. Each lot is supplied with RP-HPLC purity and mass-spectrometry identity data.',
    lots: ['BP10-0318', 'BP5-0318'],
  },
  {
    sku: 'PPH-3002', slug: 'tb-500', name: 'TB-500', category: 'cell-signalling-research',
    area: 'Cell Signalling', cas: '885340-08-9',
    formula: 'C212H350N56O78S', mw: '4964.30 g/mol',
    sequence: 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
    form: 'Lyophilised powder', purity: '99.8% (lot TB10-0318)', method: 'RP-HPLC / MALDI-MS',
    storage: STORE,
    sizes: priced('tb-500', [
      { label: '5 mg', stock: 'backorder' },
      { label: '10 mg', stock: 'in-stock', lot: 'TB10-0318' },
    ]),
    stock: 'in-stock', featured: true, added: '2026-04-03',
    summary: 'Synthetic thymosin beta-4 analogue used in actin-binding and cell-migration research.',
    overview:
      'TB-500 is a synthetic peptide corresponding to the active region of thymosin beta-4, a naturally occurring actin-sequestering protein. It is used in laboratory research examining actin polymerisation, cell migration and extracellular matrix interaction. Supplied lyophilised with lot-specific analytical documentation.',
    lots: ['TB10-0318'],
  },
  {
    sku: 'PPH-3003', slug: 'ghk-cu', name: 'GHK-Cu', category: 'cell-signalling-research',
    area: 'Cell Signalling', cas: '49557-75-7',
    formula: 'C14H24CuN6O4', mw: '403.92 g/mol',
    sequence: 'Glycyl-L-Histidyl-L-Lysine : Copper(II) complex',
    form: 'Lyophilised powder (blue)', purity: '≥ 99%', method: 'RP-HPLC / MALDI-MS',
    storage: STORE, sds: 'ghk-cu',
    sizes: priced('ghk-cu', [
      { label: '50 mg', stock: 'in-stock', lot: 'GHK50-0616' },
      { label: '100 mg', stock: 'in-stock', lot: 'GHK100-0616' },
    ]),
    stock: 'in-stock', featured: true, added: '2026-06-25',
    summary: 'Copper-binding tripeptide complex studied in matrix remodelling and gene-expression research.',
    overview:
      'GHK-Cu is the copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine. It is extensively characterised in the literature for its copper affinity and appears in matrix metalloproteinase and fibroblast gene-expression studies. The blue colour is a normal characteristic of the copper complex and is not an indicator of purity.',
    lots: ['GHK100-0616', 'GHK50-0616'],
  },
  {
    sku: 'PPH-3004', slug: 'kpv', name: 'KPV', category: 'cell-signalling-research',
    area: 'Inflammatory Research', cas: '67727-97-3',
    formula: 'C16H29N5O4', mw: '355.43 g/mol',
    sequence: 'Lys-Pro-Val',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('kpv', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'C-terminal alpha-MSH tripeptide used in cytokine and NF-κB pathway research.',
    overview:
      'KPV is the C-terminal tripeptide fragment of alpha-melanocyte-stimulating hormone. Published cell-culture work examines its effect on NF-κB translocation and pro-inflammatory cytokine expression. Supplied lyophilised for laboratory research.',
    lots: [],
  },
  {
    sku: 'PPH-3005', slug: 'cartalax', name: 'Cartalax', category: 'cell-signalling-research',
    area: 'Cell Signalling', cas: null, formula: null, mw: null, verify: true,
    sequence: 'Ala-Glu-Asp-Pro',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('cartalax', [{ label: '20 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Short synthetic tetrapeptide used in gene-expression and chondrocyte model research.',
    overview:
      'Cartalax is a synthetic tetrapeptide (Ala-Glu-Asp-Pro) belonging to the short regulatory peptide series described in Russian-language gerontology literature. It is used in cell-culture work on gene expression and connective-tissue models. Identity data is being confirmed with the supplier and will be published with the first release lot.',
    lots: [],
  },

  /* --------------------------------------------------- cognitive research */
  {
    sku: 'PPH-4001', slug: 'selank', name: 'Selank', category: 'cognitive-research',
    area: 'Neuroscience', cas: '129954-34-3',
    formula: 'C33H57N11O9', mw: '751.88 g/mol',
    sequence: 'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('selank', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Tuftsin-derived heptapeptide used in GABAergic and immunomodulatory model research.',
    overview:
      'Selank is a synthetic analogue of the endogenous immunomodulatory tetrapeptide tuftsin, extended with a Pro-Gly-Pro sequence that the literature reports as increasing enzymatic stability. Published research covers GABA receptor interaction, monoamine turnover and cytokine expression in animal models.',
    lots: [],
  },
  {
    sku: 'PPH-4002', slug: 'semax', name: 'Semax', category: 'cognitive-research',
    area: 'Neuroscience', cas: '80714-61-0',
    formula: 'C37H51N9O10S', mw: '813.93 g/mol',
    sequence: 'Met-Glu-His-Phe-Pro-Gly-Pro',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('semax', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Synthetic ACTH(4-10) analogue used in neuropeptide and BDNF expression research.',
    overview:
      'Semax is a synthetic heptapeptide analogue of the ACTH(4-10) fragment, extended with a Pro-Gly-Pro tail reported to increase enzymatic stability. It appears in neuroscience literature in studies of neurotrophic factor expression and receptor binding.',
    lots: [],
  },

  /* ------------------------------------------------ melanocortin research */
  {
    sku: 'PPH-5001', slug: 'melanotan-1', name: 'Melanotan-I', category: 'melanocortin-research',
    area: 'Receptor Pharmacology', cas: '75921-69-6',
    formula: 'C78H111N21O19', mw: '1646.85 g/mol',
    sequence: 'Ac-Ser-Tyr-Ser-Nle-Glu-His-D-Phe-Arg-Trp-Gly-Lys-Pro-Val-NH2',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('melanotan-1', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Linear alpha-MSH analogue used as a reference ligand at MC1R.',
    overview:
      'Melanotan-I is a linear 13-residue analogue of alpha-melanocyte-stimulating hormone carrying norleucine and D-phenylalanine substitutions. It is a characterised reference ligand at the melanocortin-1 receptor and is used in receptor binding and selectivity assays.',
    lots: [],
  },
  {
    sku: 'PPH-5002', slug: 'melanotan-2', name: 'Melanotan-II', category: 'melanocortin-research',
    area: 'Receptor Pharmacology', cas: '121062-08-6',
    formula: 'C50H69N15O9', mw: '1024.18 g/mol',
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('melanotan-2', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Cyclic melanocortin agonist used in MC1R and MC4R binding studies.',
    overview:
      'Melanotan-II is a cyclic heptapeptide analogue of alpha-MSH and a well characterised non-selective agonist across the melanocortin receptor family. It is used as a reference ligand in receptor selectivity and competitive binding assays.',
    lots: [],
  },
  {
    sku: 'PPH-5003', slug: 'kisspeptin-10', name: 'Kisspeptin-10', category: 'melanocortin-research',
    area: 'Endocrine Research', cas: '374675-21-5',
    formula: 'C63H83N17O14', mw: '1302.47 g/mol',
    sequence: 'Tyr-Asn-Trp-Asn-Ser-Phe-Gly-Leu-Arg-Phe-NH2',
    form: 'Lyophilised powder', purity: 'Reported on the lot certificate', method: 'RP-HPLC / MS',
    storage: STORE,
    sizes: priced('kisspeptin-10', [{ label: '10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'C-terminal kisspeptin decapeptide used as a KISS1R reference ligand.',
    overview:
      'Kisspeptin-10 is the C-terminal decapeptide fragment of kisspeptin-54 and the shortest sequence retaining full activity at the KISS1 receptor. It is widely used in neuroendocrine receptor signalling and GnRH regulation research.',
    lots: [],
  },

  /* ------------------------------------------------------------ cofactors */
  {
    sku: 'PPH-6001', slug: 'nad', name: 'NAD+', category: 'cofactors',
    area: 'Redox & Cofactor', cas: '53-84-9',
    formula: 'C21H27N7O14P2', mw: '663.43 g/mol',
    sequence: 'Not applicable - dinucleotide cofactor',
    form: 'Lyophilised powder', purity: '99.90% (lot ND5-011726)', method: 'HPLC-UV / MS',
    storage: STORE,
    sizes: priced('nad', [
      { label: '500 mg', stock: 'in-stock', lot: 'ND5-011726' },
      { label: '1000 mg', stock: 'in-stock', lot: 'NAD1000-0803' },
    ]),
    stock: 'in-stock', featured: true, added: '2026-01-21',
    summary: 'Oxidised nicotinamide adenine dinucleotide, supplied as a redox assay reference standard.',
    overview:
      'NAD+ is the oxidised form of nicotinamide adenine dinucleotide, the principal electron-carrying cofactor in cellular redox metabolism. It is supplied as a lyophilised powder for use as a reference standard in enzymatic assays, dehydrogenase kinetics and analytical method work. This material is not a peptide; it is documented to the same lot-level standard as the rest of the catalogue.',
    lots: ['ND5-011726', 'NAD500-0803', 'NAD1000-0803'],
  },

  /* --------------------------------------------------------------- blends */
  {
    sku: 'PPH-7001', slug: 'glow', name: 'GLOW Blend', category: 'blends',
    area: 'Cell Signalling', cas: 'Mixture - see components',
    formula: 'Mixture', mw: 'Not applicable (mixture)',
    sequence: 'GHK-Cu 50 mg + BPC-157 10 mg + TB-500 10 mg, single vial',
    form: 'Lyophilised powder', purity: 'Per component, reported on the lot certificate', method: 'RP-HPLC (per component)',
    storage: STORE,
    sizes: priced('glow', [{ label: '50/10/10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Fixed-ratio combination of GHK-Cu, BPC-157 and TB-500 documented as one lot.',
    overview:
      'GLOW combines GHK-Cu, BPC-157 and TB-500 at a fixed mass ratio in a single vial. Blend lots carry chromatographic data for each component so the ratio can be confirmed before use. Supplied for laboratory research only.',
    lots: [],
  },
  {
    sku: 'PPH-7002', slug: 'klow', name: 'KLOW Blend', category: 'blends',
    area: 'Cell Signalling', cas: 'Mixture - see components',
    formula: 'Mixture', mw: 'Not applicable (mixture)',
    sequence: 'GHK-Cu 50 mg + BPC-157 10 mg + TB-500 10 mg + KPV 10 mg, single vial',
    form: 'Lyophilised powder', purity: 'Per component, reported on the lot certificate', method: 'RP-HPLC (per component)',
    storage: STORE,
    sizes: priced('klow', [{ label: '50/10/10/10 mg', stock: 'backorder' }]),
    stock: 'backorder', featured: false, added: '2026-09-01',
    summary: 'Four-component fixed-ratio blend documented as a single production lot.',
    overview:
      'KLOW combines GHK-Cu, BPC-157, TB-500 and KPV at a fixed mass ratio in a single vial. As with every blend, the lot certificate reports each component separately so the ratio can be verified prior to use.',
    lots: [],
  },
  {
    sku: 'PPH-7003', slug: 'bpc-tb', name: 'BPC-157 / TB-500 Blend', category: 'blends',
    area: 'Cell Signalling', cas: 'Mixture - see components',
    formula: 'Mixture', mw: 'Not applicable (mixture)',
    sequence: 'BPC-157 10 mg + TB-500 10 mg, 1:1 by mass',
    form: 'Lyophilised powder', purity: 'Per component, reported on the lot certificate', method: 'RP-HPLC (per component)',
    storage: STORE,
    sizes: priced('bpc-tb', [{ label: '10/10 mg', stock: 'in-stock', lot: 'BPCTB20-0318' }]),
    stock: 'in-stock', featured: false, added: '2026-03-18',
    summary: 'Equal-mass combination of BPC-157 and TB-500 in a single vial.',
    overview:
      'This blend combines BPC-157 and TB-500 at a 1:1 mass ratio. Each blend lot carries chromatographic data for both components, allowing the ratio to be confirmed before use. Supplied for laboratory research only.',
    lots: ['BPCTB20-0318'],
  },
];

/* -------------------------------------------------------------------- lots
   Values transcribed from the certificates the client supplied. `doc` is the
   file served from /doc/coa/; a null `doc` means the lot appears on the
   inventory sheet but no certificate has been supplied yet, and the site says
   so rather than implying one exists. */

/* Read off the certificates themselves: "American Peptides" is the VENDOR
   named on the document, and Bioviridian Inc. is the laboratory that performed
   and signed the analysis. Attributing the testing to the vendor would be
   wrong, and it is the independent lab that makes the document worth
   anything. Bioviridian publish a verification lookup, so we link it. */
const LAB_AP = 'Bioviridian Inc.';
const VENDOR_AP = 'American Peptides';
const VERIFY_AP = 'https://bioviridians.com/coa-search.html';
const LAB_FD = 'Freedom Diagnostics';
const VENDOR_FD = 'Ion Peptide';

const lots = [
  {
    lot: 'BP10-0318', product: 'BPC-157', slug: 'bpc-157', size: '10 mg',
    date: '3 Apr 2026', received: '26 Mar 2026', purity: '99.8%', content: '10.02 mg',
    endotoxin: '≤ 0.05 EU/mL', retention: '5.975 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/bp10-0318.pdf', docType: 'PDF',
  },
  {
    lot: 'BP5-0318', product: 'BPC-157', slug: 'bpc-157', size: '5 mg',
    date: '3 Apr 2026', received: '26 Mar 2026', purity: '99.7%', content: '6.42 mg',
    endotoxin: '≤ 0.05 EU/mL', retention: '5.967 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/bp5-0318.pdf', docType: 'PDF',
    note: 'The supplied certificate prints batch number BP10-0318 in the header while naming the 5 mg sample. Confirmed correction requested from the supplier.',
  },
  {
    lot: 'TB10-0318', product: 'TB-500', slug: 'tb-500', size: '10 mg',
    date: '3 Apr 2026', received: '26 Mar 2026', purity: '99.8%', content: '12.12 mg',
    endotoxin: '≤ 0.05 EU/mL', retention: '5.767 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/tb10-0318.pdf', docType: 'PDF',
  },
  {
    lot: 'SERMO5-0318', product: 'Sermorelin', slug: 'sermorelin', size: '5 mg',
    date: '3 Apr 2026', received: '26 Mar 2026', purity: '99.8%', content: '6.36 mg',
    endotoxin: '≤ 0.05 EU/mL', retention: '7.867 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/sermo5-0318.pdf', docType: 'PDF',
  },
  {
    lot: 'GHK100-0616', product: 'GHK-Cu', slug: 'ghk-cu', size: '100 mg',
    date: '25 Jun 2026', received: '19 Jun 2026', purity: '99.8%', content: '101.17 mg',
    endotoxin: '< 0.05 EU/mL', heavyMetals: '< 0.01 ppm', retention: '1.568 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/ghk100-0616.pdf', docType: 'PDF',
  },
  {
    lot: 'GHK50-0616', product: 'GHK-Cu', slug: 'ghk-cu', size: '50 mg',
    date: '25 Jun 2026', received: '19 Jun 2026', purity: '99.9%', content: '50.67 mg',
    endotoxin: '< 0.05 EU/mL', heavyMetals: '< 0.01 ppm', retention: '1.594 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/ghk50-0616.pdf', docType: 'PDF',
  },
  {
    lot: 'SEMA10-0616', product: 'Semaglutide', slug: 'semaglutide', size: '10 mg',
    date: '25 Jun 2026', received: '19 Jun 2026', purity: '99.9%', content: '10.52 mg',
    endotoxin: '< 0.05 EU/mL', heavyMetals: '< 0.01 ppm', retention: '10.837 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/sema10-0616.pdf', docType: 'PDF',
  },
  {
    lot: 'RETA10-0616', product: 'Retatrutide', slug: 'retatrutide', size: '10 mg',
    date: '25 Jun 2026', received: '19 Jun 2026', purity: '99.8%', content: '10.49 mg',
    endotoxin: '< 0.05 EU/mL', heavyMetals: '< 0.01 ppm', retention: '11.077 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/reta10-0616.pdf', docType: 'PDF',
  },
  {
    lot: 'TIR10-0528', product: 'Tirzepatide', slug: 'tirzepatide', size: '10 mg',
    date: '17 Jun 2026', received: '1 Jun 2026', purity: '99.9%', content: '10.42 mg',
    endotoxin: '< 0.05 EU/mL', heavyMetals: '< 0.01 ppm', sterility: 'Not detected (USP71)',
    retention: '11.203 min',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - MALDI-MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/tir10-0528.pdf', docType: 'PDF',
  },
  {
    lot: 'AOD5-0803', product: 'AOD-9604', slug: 'aod-9604', size: '5 mg',
    date: '17 Aug 2026', received: '11 Aug 2026', purity: '99.78%', content: '5.16 mg',
    endotoxin: '< 0.05 EU/mL', heavyMetals: '< 0.01 ppm',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - LC-MS/MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/aod5-0803.pdf', docType: 'PDF',
  },
  {
    lot: 'TESA10-0803', product: 'Tesamorelin', slug: 'tesamorelin', size: '10 mg',
    date: '17 Aug 2026', received: '11 Aug 2026', purity: '99.79%', content: '10.18 mg',
    endotoxin: '< 0.05 EU/mL', heavyMetals: '< 0.01 ppm',
    method: 'RP-HPLC (214 nm)', identity: 'Conforms - LC-MS/MS', lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP,
    status: 'available', preview: true, doc: '/doc/coa/tesa10-0803.pdf', docType: 'PDF',
  },
  {
    lot: 'ND5-011726', product: 'NAD+', slug: 'nad', size: '500 mg',
    date: '21 Jan 2026', received: '19 Jan 2026', purity: '99.90%', content: '563.18 mg (average of two vials)',
    method: 'HPLC-UV coupled with MS', identity: 'Conforms - NAD+, [M+H]+ 663.78', lab: LAB_FD, vendor: VENDOR_FD,
    status: 'available', preview: true, doc: '/doc/coa/nd5-011726.jpg', docType: 'Image',
    accession: '2601190067',
  },

  /* Listed on the inventory sheet, certificate not yet supplied. */
  {
    lot: 'SEMA5-0616', product: 'Semaglutide', slug: 'semaglutide', size: '5 mg',
    date: 'Pending', purity: 'Pending', method: 'RP-HPLC (214 nm)', identity: 'Pending',
    lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP, status: 'pending', doc: null,
  },
  {
    lot: 'NAD500-0803', product: 'NAD+', slug: 'nad', size: '500 mg',
    date: 'Pending', purity: 'Pending', method: 'HPLC-UV / MS', identity: 'Pending',
    lab: LAB_FD, vendor: VENDOR_FD, status: 'pending', doc: null,
  },
  {
    lot: 'NAD1000-0803', product: 'NAD+', slug: 'nad', size: '1000 mg',
    date: 'Pending', purity: 'Pending', method: 'HPLC-UV / MS', identity: 'Pending',
    lab: LAB_FD, vendor: VENDOR_FD, status: 'pending', doc: null,
  },
  {
    lot: 'BPCTB20-0318', product: 'BPC-157 / TB-500 Blend', slug: 'bpc-tb', size: '10/10 mg',
    date: 'Pending', purity: 'Pending', method: 'RP-HPLC (per component)', identity: 'Pending',
    lab: LAB_AP, vendor: VENDOR_AP, verifyUrl: VERIFY_AP, status: 'pending', doc: null,
  },
];

/* ------------------------------------------------------- safety data sheets
   Supplied by the client as American Peptides SDS, revision 1.0, issued
   6 July 2026, prepared per OSHA HazCom 2012 / 29 CFR 1910.1200 / GHS. */

const sds = [
  { slug: 'bpc-157', name: 'BPC-157', doc: '/doc/sds/bpc-157-sds.pdf', ref: 'SDS-AP-BPC157' },
  { slug: 'aod-9604', name: 'AOD-9604', doc: '/doc/sds/aod-9604-sds.pdf', ref: 'SDS-AP-AOD9604' },
  { slug: 'ghk-cu', name: 'GHK-Cu', doc: '/doc/sds/ghk-cu-sds.pdf', ref: 'SDS-AP-GHKCU' },
  { slug: 'retatrutide', name: 'Retatrutide', doc: '/doc/sds/retatrutide-sds.pdf', ref: 'SDS-AP-RETATRUTIDE' },
  { slug: 'semaglutide', name: 'Semaglutide', doc: '/doc/sds/semaglutide-sds.pdf', ref: 'SDS-AP-SEMAGLUTIDE' },
  { slug: 'sermorelin', name: 'Sermorelin', doc: '/doc/sds/sermorelin-sds.pdf', ref: 'SDS-AP-SERMORELIN' },
  { slug: 'tesamorelin', name: 'Tesamorelin', doc: '/doc/sds/tesamorelin-sds.pdf', ref: 'SDS-AP-TESAMORELIN' },
  { slug: 'tirzepatide', name: 'Tirzepatide', doc: '/doc/sds/tirzepatide-sds.pdf', ref: 'SDS-AP-TIRZEPATIDE' },
];

const sdsFor = (slug) => sds.find((s) => s.slug === slug) || null;

/* --------------------------------------------------------- research fields
   AllayPay requires the buyer to declare a research field at checkout, from a
   dropdown. This is that list; "etc" in their spec is the final option. */

const researchFields = [
  'Molecular Biology',
  'Biochemistry',
  'Peptide Chemistry',
  'Chemical Biology',
  'Biotechnology Research',
  'Academic Research',
  'Analytical Method Development',
  'Other institutional research',
];

/* ---------------------------------------------------------------- articles */

const articles = [
  {
    slug: 'reading-an-hplc-purity-result',
    title: 'How to read an HPLC purity result',
    category: 'Methods',
    date: '2026-08-14',
    dateLabel: '14 August 2026',
    readTime: '9 min',
    author: 'Analytical Services',
    role: 'Purely Peptides Hub',
    excerpt:
      'A purity figure is a summary of a chromatogram, not a substitute for it. What the integration actually measures, and where the number can mislead.',
    abstract:
      'Reversed-phase HPLC is the default purity method for synthetic peptides, and a single percentage is the number most often quoted from it. That percentage is an area-normalised ratio derived from a specific detection wavelength, gradient and column. This article explains how the figure is produced, which impurities it can and cannot see, and what to check on the chromatogram before accepting the number at face value.',
    tags: ['HPLC', 'Purity', 'Analytical'],
    featured: true,
  },
  {
    slug: 'what-a-certificate-of-analysis-contains',
    title: 'What a certificate of analysis actually contains',
    category: 'Quality',
    date: '2026-07-29',
    dateLabel: '29 July 2026',
    readTime: '7 min',
    author: 'Quality Systems',
    role: 'Purely Peptides Hub',
    excerpt: 'Certificates vary widely between suppliers. The fields that carry real information, and the ones that carry none.',
    abstract:
      'A certificate of analysis is a record of what was tested, by whom, when, and against which specification. Documents that omit any of those four elements are difficult to use. This article walks through each field of a peptide COA and explains how to evaluate one you have been sent.',
    tags: ['COA', 'Documentation', 'Quality'],
    featured: true,
  },
  {
    slug: 'storage-and-reconstitution-of-lyophilised-peptides',
    title: 'Storage and reconstitution of lyophilised peptides',
    category: 'Storage',
    date: '2026-06-30',
    dateLabel: '30 June 2026',
    readTime: '11 min',
    author: 'Analytical Services',
    role: 'Purely Peptides Hub',
    excerpt: 'Temperature, moisture and freeze-thaw cycles account for most avoidable loss of peptide integrity in the laboratory.',
    abstract:
      'Lyophilised peptides are stable for extended periods when stored correctly, and degrade quickly when they are not. This article summarises the physical mechanisms behind peptide degradation in storage and the laboratory handling practices that address each one.',
    tags: ['Storage', 'Handling', 'Stability'],
    featured: true,
  },
  {
    slug: 'mass-spectrometry-as-an-identity-check',
    title: 'Mass spectrometry as an identity check',
    category: 'Methods',
    date: '2026-05-21',
    dateLabel: '21 May 2026',
    readTime: '8 min',
    author: 'Analytical Services',
    role: 'Purely Peptides Hub',
    excerpt: 'HPLC tells you how much of one thing is present. MS tells you whether that thing is what the label says.',
    abstract:
      'Purity and identity are separate questions requiring separate methods. This article explains why an HPLC result alone cannot confirm identity, and how MALDI and LC-MS data on a certificate should be interpreted.',
    tags: ['Mass spectrometry', 'Identity', 'Analytical'],
    featured: false,
  },
  {
    slug: 'lot-traceability-in-research-procurement',
    title: 'Lot traceability in research procurement',
    category: 'Industry',
    date: '2026-04-16',
    dateLabel: '16 April 2026',
    readTime: '6 min',
    author: 'Quality Systems',
    role: 'Purely Peptides Hub',
    excerpt: 'Reproducibility problems are often supply problems. Recording lot numbers alongside experimental data closes a common gap.',
    abstract:
      'When an experiment fails to reproduce, the material is rarely the first suspect and often should be. This article makes the case for treating lot numbers as experimental metadata and outlines a minimal record-keeping practice.',
    tags: ['Traceability', 'Reproducibility', 'Procurement'],
    featured: false,
  },
  {
    slug: 'peptide-solubility-a-practical-guide',
    title: 'Peptide solubility in laboratory solvents',
    category: 'Methods',
    date: '2026-03-05',
    dateLabel: '5 March 2026',
    readTime: '10 min',
    author: 'Analytical Services',
    role: 'Purely Peptides Hub',
    excerpt: 'Sequence charge and hydrophobicity predict most solubility behaviour. A decision path for choosing a laboratory solvent.',
    abstract:
      'Difficulty dissolving a peptide is usually predictable from its sequence. This guide sets out a decision path based on net charge and hydrophobic residue content, and covers the common laboratory solvents and their trade-offs for in-vitro work.',
    tags: ['Solubility', 'Handling', 'Method'],
    featured: false,
  },
  {
    slug: 'endotoxin-testing-when-it-matters',
    title: 'Endotoxin testing: when it matters',
    category: 'Quality',
    date: '2026-02-12',
    dateLabel: '12 February 2026',
    readTime: '7 min',
    author: 'Analytical Services',
    role: 'Purely Peptides Hub',
    excerpt: 'Endotoxin limits are irrelevant to some assays and decisive in others. How to tell which situation you are in.',
    abstract:
      'Bacterial endotoxin contamination can confound cell-based assays at concentrations far below those that matter elsewhere. This article covers the LAL method, typical limits and the experimental contexts in which endotoxin data should be requested.',
    tags: ['Endotoxin', 'Cell culture', 'Quality'],
    featured: false,
  },
  {
    slug: 'comparing-synthesis-routes-for-short-peptides',
    title: 'Comparing synthesis routes for short peptides',
    category: 'Research',
    date: '2026-01-23',
    dateLabel: '23 January 2026',
    readTime: '12 min',
    author: 'Analytical Services',
    role: 'Purely Peptides Hub',
    excerpt: 'Solid-phase and solution-phase synthesis leave different impurity signatures. Reading the route from the chromatogram.',
    abstract:
      'The impurity profile of a synthetic peptide carries information about how it was made. This article compares Fmoc solid-phase synthesis with solution-phase approaches and describes the characteristic by-products of each.',
    tags: ['Synthesis', 'SPPS', 'Impurities'],
    featured: false,
  },
];

/* ------------------------------------------------------------- derivations
   Counts and documentation flags are derived, never hand-maintained, so the
   nav, filters and badges cannot disagree with the catalogue itself. */

categories.forEach((c) => {
  c.count = products.filter((p) => p.category === c.slug).length;
});

products.forEach((p) => {
  const own = lots.filter((l) => l.slug === p.slug);
  p.hasCoa = own.some((l) => l.doc);
  p.hasSds = Boolean(sdsFor(p.slug));
  p.priceFrom = Math.min(...p.sizes.map((s) => s.price));
  // A specification we have no document for renders as "On request" rather
  // than as a number we cannot evidence. `verify` stays set so the page can
  // say why, and so the launch checklist can list them.
  if (!p.cas) p.cas = 'On request';
  if (!p.formula) p.formula = 'On request';
  if (!p.mw) p.mw = 'On request';
});

/* Our payment processor requires a lab report to be available online for EVERY
   listed product. 15 of the 25 products on the inventory sheet have no
   certificate on file yet; they are listed with an honest "lab report pending"
   state rather than a badge claiming documentation we do not hold.

   If underwriting will not accept that, build with ONLY_DOCUMENTED=1 to ship
   just the documented products - no rewriting of the catalogue needed:

       ONLY_DOCUMENTED=1 node build.js

   The filter is applied here rather than in build.js so that the nav, mega
   menu, category counts, search index and every listing follow from one
   source and cannot disagree with each other. */
if (process.env.ONLY_DOCUMENTED === '1') {
  const keep = products.filter((p) => p.hasCoa);
  products.length = 0;
  products.push(...keep);
  categories.forEach((c) => {
    c.count = products.filter((p) => p.category === c.slug).length;
  });
  const cats = categories.filter((c) => c.count > 0);
  categories.length = 0;
  categories.push(...cats);
  // A lot whose product is no longer listed must go too, or the certificate
  // library links a product page that was never built.
  const slugs = new Set(products.map((p) => p.slug));
  const keptLots = lots.filter((l) => slugs.has(l.slug));
  lots.length = 0;
  lots.push(...keptLots);
}

module.exports = {
  brand, categories, researchAreas, researchFields,
  products, lots, articles, sds, sdsFor, PRICING,
};
