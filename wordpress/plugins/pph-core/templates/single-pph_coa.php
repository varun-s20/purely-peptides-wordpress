<?php
/**
 * A single certificate of analysis.
 *
 * Ported from src/pages/certificates.js coaDetail(). The markup is meant to be
 * identical to the static build's - verify with:
 *   node tools/diff-wp.js https://staging.example/certificates/bp10-0318/ certificate-bp10-0318
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();

	$id        = get_the_ID();
	$lot       = pph_m( $id, 'lot' );
	$product   = pph_m( $id, 'product' );
	$p_slug    = pph_m( $id, 'product_slug' );
	$lab       = pph_m( $id, 'lab' );
	$vendor    = pph_m( $id, 'vendor' );
	$doc       = pph_m( $id, 'doc_url' );
	$doc_type  = pph_m( $id, 'doc_type', 'PDF' );
	$status    = pph_m( $id, 'status', 'available' );
	$identity  = pph_m( $id, 'identity' );
	$method    = pph_m( $id, 'method' );
	$accession = pph_m( $id, 'accession' );
	$reference = $accession ? 'COA ' . $accession : 'COA-' . $lot;

	echo pph_crumbs(
		array(
			array( 'label' => 'Home', 'href' => home_url( '/' ) ),
			array( 'label' => 'Certificates', 'href' => get_post_type_archive_link( 'pph_coa' ) ),
			array( 'label' => $product, 'href' => add_query_arg( 'lot', $product, get_post_type_archive_link( 'pph_coa' ) ) ),
			array( 'label' => $lot ),
		)
	);
	?>

<div class="wrap coa-detail">
  <div>
    <div class="row" style="justify-content:space-between;margin-bottom:20px">
      <div>
        <span class="eyebrow">Certificate of analysis</span>
        <h1 style="font-size:var(--t-h2)"><?php echo esc_html( $product ); ?></h1>
        <p class="mono muted" style="margin-top:8px">Lot <?php echo esc_html( $lot ); ?> &middot; <?php echo esc_html( pph_m( $id, 'size' ) ); ?></p>
      </div>
      <span class="status status--ok"><?php echo pph_icon( 'checkCircle' ); ?><?php echo 'available' === $status ? 'Currently shipping' : 'Archived lot'; ?></span>
    </div>

    <div class="coa-doc">
      <div class="coa-doc__head">
        <div>
          <span class="label">Document</span>
          <strong class="mono">COA-<?php echo esc_html( $lot ); ?></strong>
        </div>
        <div class="row" style="gap:8px">
          <button class="btn btn--secondary btn--sm" type="button" onclick="window.print()">Print</button>
          <a class="btn btn--primary btn--sm" href="<?php echo esc_url( $doc ); ?>" target="_blank" rel="noopener"><?php echo pph_icon( 'download' ); ?> Download <?php echo esc_html( $doc_type ); ?></a>
        </div>
      </div>

      <div class="coa-doc__page">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div>
            <span class="label">Analysis performed by</span>
            <strong style="font-size:var(--t-h4);display:block;margin-top:4px"><?php echo esc_html( $lab ); ?></strong>
            <p class="small muted" style="margin-top:6px">
              Independent analytical laboratory.<?php echo $vendor ? ' Material supplied by ' . esc_html( $vendor ) . '.' : ''; ?>
              <?php if ( pph_m( $id, 'verify_url' ) ) : ?>
                <br><a class="link" href="<?php echo esc_url( pph_m( $id, 'verify_url' ) ); ?>" target="_blank" rel="noopener">Verify this certificate with the laboratory</a>
              <?php endif; ?>
            </p>
          </div>
          <div style="text-align:right">
            <span class="label">Issued</span>
            <span class="mono"><?php echo esc_html( pph_m( $id, 'date' ) ); ?></span>
            <?php if ( pph_m( $id, 'received' ) ) : ?>
              <div style="margin-top:8px"><span class="label">Sample received</span><span class="mono"><?php echo esc_html( pph_m( $id, 'received' ) ); ?></span></div>
            <?php endif; ?>
          </div>
        </div>

        <div class="coa-doc__rule"></div>

        <table class="spec">
          <tbody>
            <tr><th scope="row">Product</th><td><?php echo esc_html( $product ); ?></td></tr>
            <tr><th scope="row">Batch / lot number</th><td class="mono"><?php echo esc_html( $lot ); ?></td></tr>
            <tr><th scope="row">Fill size</th><td class="mono"><?php echo esc_html( pph_m( $id, 'size' ) ); ?></td></tr>
            <?php if ( pph_m( $id, 'cas' ) ) : ?>
            <tr><th scope="row">CAS number</th><td class="mono"><?php echo esc_html( pph_m( $id, 'cas' ) ); ?></td></tr>
            <tr><th scope="row">Molecular formula</th><td class="mono"><?php echo esc_html( pph_m( $id, 'formula' ) ); ?></td></tr>
            <tr><th scope="row">Molecular weight</th><td class="mono"><?php echo esc_html( pph_m( $id, 'mw' ) ); ?></td></tr>
            <tr><th scope="row">Appearance</th><td>White to off-white lyophilised powder</td></tr>
            <?php endif; ?>
            <tr><th scope="row">Testing laboratory</th><td><?php echo esc_html( $lab ); ?></td></tr>
            <tr><th scope="row">Test date</th><td class="mono"><?php echo esc_html( pph_m( $id, 'date' ) ); ?></td></tr>
          </tbody>
        </table>

        <div class="coa-doc__rule"></div>

        <h2 style="font-size:var(--t-h4);margin-bottom:16px">Analytical results</h2>
        <table class="dtable dtable--stack" style="margin-bottom:24px">
          <thead><tr><th>Test</th><th>Method</th><th>Result</th><th>Status</th></tr></thead>
          <tbody>
            <tr>
              <td data-label="Test">Identity</td>
              <td data-label="Method" class="mono"><?php echo false !== strpos( $identity, 'LC-MS' ) ? 'LC-MS/MS' : 'MALDI-MS'; ?></td>
              <td data-label="Result"><strong><?php echo esc_html( $product ); ?></strong></td>
              <td data-label="Status"><span class="status status--ok"><?php echo pph_icon( 'check' ); ?>Conforms</span></td>
            </tr>
            <tr>
              <td data-label="Test">Overall purity</td>
              <td data-label="Method" class="mono"><?php echo esc_html( $method ); ?></td>
              <td data-label="Result"><strong class="mono"><?php echo esc_html( pph_m( $id, 'purity' ) ); ?></strong></td>
              <td data-label="Status"><span class="status status--ok"><?php echo pph_icon( 'check' ); ?>Conforms</span></td>
            </tr>
            <?php
            /* label, meta key, method, status word */
            $rows = array(
            	array( 'Net peptide content', 'content', 'HPLC quantitation', 'Conforms' ),
            	array( 'Endotoxin', 'endotoxin', 'USP &lt;85&gt;', 'Pass' ),
            	array( 'Heavy metals', 'heavy_metals', 'USP &lt;232&gt;', 'Conforms' ),
            	array( 'Sterility', 'sterility', 'USP &lt;71&gt;', 'Conforms' ),
            );
            foreach ( $rows as $row ) :
            	$value = pph_m( $id, $row[1] );
            	if ( ! $value ) {
            		continue;
            	}
            	?>
            <tr>
              <td data-label="Test"><?php echo esc_html( $row[0] ); ?></td>
              <td data-label="Method" class="mono"><?php echo $row[2]; ?></td>
              <td data-label="Result"><strong class="mono"><?php echo esc_html( $value ); ?></strong></td>
              <td data-label="Status"><span class="status status--ok"><?php echo pph_icon( 'check' ); ?><?php echo esc_html( $row[3] ); ?></span></td>
            </tr>
            <?php endforeach; ?>
            <?php if ( pph_m( $id, 'retention' ) ) : ?>
            <tr>
              <td data-label="Test">Retention time</td>
              <td data-label="Method" class="mono"><?php echo esc_html( $method ); ?></td>
              <td data-label="Result"><strong class="mono"><?php echo esc_html( pph_m( $id, 'retention' ) ); ?></strong></td>
              <td data-label="Status"><span class="muted small">Recorded</span></td>
            </tr>
            <?php endif; ?>
          </tbody>
        </table>

        <?php if ( pph_m( $id, 'note' ) ) : ?>
          <div class="notice notice--warn" style="margin-bottom:24px"><?php echo pph_icon( 'info' ); ?><div><?php echo esc_html( pph_m( $id, 'note' ) ); ?></div></div>
        <?php endif; ?>

        <span class="label" style="margin-bottom:10px">Issued document</span>
        <p class="small muted" style="margin-bottom:12px">
          The values above are transcribed from the document issued by <?php echo esc_html( $lab ); ?>. That document,
          including the chromatogram and mass spectrum, is the record of testing - open it below.
        </p>
        <figure class="coa-doc__embed">
          <a href="<?php echo esc_url( $doc ); ?>" target="_blank" rel="noopener" aria-label="Open the full certificate for lot <?php echo esc_attr( $lot ); ?>">
            <img src="<?php echo esc_url( pph_m( $id, 'preview_url' ) ); ?>"
                 alt="Certificate of analysis for lot <?php echo esc_attr( $lot ); ?>, issued by <?php echo esc_attr( $lab ); ?>"
                 loading="lazy" width="1020" height="1320">
          </a>
          <figcaption>
            <span>Page 1 of the certificate issued by <?php echo esc_html( $lab ); ?>.</span>
            <a class="link-arrow" href="<?php echo esc_url( $doc ); ?>" target="_blank" rel="noopener"><span>Open the full <?php echo 'Image' === $doc_type ? 'certificate' : 'PDF'; ?></span><?php echo pph_icon( 'arrow' ); ?></a>
          </figcaption>
        </figure>

        <div class="coa-doc__rule"></div>

        <div class="row" style="justify-content:space-between;align-items:flex-end;gap:24px">
          <div>
            <span class="label">Testing laboratory</span>
            <p class="small" style="margin-top:6px"><?php echo esc_html( $lab ); ?><?php echo $vendor ? '<br><span class="muted">Material vendor: ' . esc_html( $vendor ) . '</span>' : ''; ?></p>
          </div>
          <div style="text-align:right">
            <span class="label">Document reference</span>
            <span class="mono small"><?php echo esc_html( $reference ); ?></span>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top:24px"><?php echo pph_research_notice( 'This certificate records analytical testing performed on the stated lot. It is not a certificate of suitability for any application, and the material is supplied for laboratory research use only.' ); ?></div>
  </div>

  <aside class="coa-aside">
    <div class="card" style="padding:24px">
      <span class="label">Summary</span>
      <dl style="margin:14px 0 0;display:grid;gap:12px">
        <?php
        $summary = array(
        	array( 'Lot', $lot ),
        	array( 'Purity', pph_m( $id, 'purity' ) ),
        	array( 'Method', $method ),
        	array( 'Identity', $identity ),
        	array( 'Tested', pph_m( $id, 'date' ) ),
        	array( 'Laboratory', $lab ),
        );
        if ( $vendor ) {
        	$summary[] = array( 'Vendor', $vendor );
        }
        foreach ( $summary as $pair ) :
        	?>
          <div style="display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid var(--rule);padding-bottom:10px">
            <dt class="small muted"><?php echo esc_html( $pair[0] ); ?></dt><dd class="mono small" style="margin:0;text-align:right"><?php echo esc_html( $pair[1] ); ?></dd></div>
        <?php endforeach; ?>
      </dl>
      <a class="btn btn--primary btn--block" style="margin-top:20px" href="<?php echo esc_url( home_url( '/products/' . $p_slug . '/' ) ); ?>">View product</a>
    </div>

    <div class="card" style="padding:24px">
      <span class="label">Other lots of this product</span>
      <ul style="list-style:none;padding:0;margin:14px 0 0;display:grid;gap:2px">
        <?php foreach ( pph_sibling_lots( $p_slug ) as $sib ) : ?>
          <li><a href="<?php echo esc_url( get_permalink( $sib ) ); ?>" style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;text-decoration:none;border-bottom:1px solid var(--rule)">
            <span class="mono small"<?php echo $sib->ID === $id ? ' style="color:var(--verdigris);font-weight:500"' : ''; ?>><?php echo esc_html( pph_m( $sib->ID, 'lot' ) ); ?></span>
            <span class="mono small muted"><?php echo esc_html( pph_m( $sib->ID, 'date' ) ); ?></span></a></li>
        <?php endforeach; ?>
      </ul>
    </div>

    <div class="notice">
      <?php echo pph_icon( 'help' ); ?>
      <div>Documentation query about this lot? <a class="link" href="<?php echo esc_url( home_url( '/contact/?topic=documentation' ) ); ?>">Contact the documentation team</a>.</div>
    </div>
  </aside>
</div>

	<?php
endwhile;

get_footer();
