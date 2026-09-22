<?php
/**
 * The certificate library.
 *
 * Ported from src/pages/certificates.js coaLibrary(), with one deliberate
 * change: the static build's filter bar was presentation only. Here the search,
 * product and status controls actually filter. The two date inputs are gone -
 * test dates are stored as they are printed on the certificate ("3 Apr 2026"),
 * which cannot be range-queried, and shipping a control that does nothing is
 * worse than not shipping it. See PROGRESS.md.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$archive     = get_post_type_archive_link( 'pph_coa' );
$q_lot       = isset( $_GET['lot'] ) ? sanitize_text_field( wp_unslash( $_GET['lot'] ) ) : '';
$q_product   = isset( $_GET['product'] ) ? sanitize_text_field( wp_unslash( $_GET['product'] ) ) : '';
$q_status    = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : '';
$total       = wp_count_posts( 'pph_coa' )->publish;
$found       = (int) $GLOBALS['wp_query']->found_posts;
$filtered    = ( '' !== $q_lot || '' !== $q_product || '' !== $q_status );

/* The product list comes from the certificates themselves, so it stays correct
   whether or not WooCommerce is installed yet. */
$product_names = array();
foreach ( get_posts( array( 'post_type' => 'pph_coa', 'posts_per_page' => -1, 'fields' => 'ids' ) ) as $pid ) {
	$name = pph_m( $pid, 'product' );
	if ( $name ) {
		$product_names[ $name ] = true;
	}
	if ( 'available' === pph_m( $pid, 'status', 'available' ) ) {
		$available = isset( $available ) ? $available + 1 : 1;
	}
}
$product_names = array_keys( $product_names );
sort( $product_names );
$available = isset( $available ) ? $available : 0;

echo pph_crumbs(
	array(
		array( 'label' => 'Home', 'href' => home_url( '/' ) ),
		array( 'label' => 'Certificates' ),
	)
);
?>

<section class="coa-hero" id="verify">
  <div class="wrap">
    <span class="eyebrow">Documentation</span>
    <h1>Certificates &amp; batch documentation</h1>
    <p>
      Search available documentation by product or by the lot number printed on your vial label.
      Records for archived lots stay retrievable after a lot is no longer in stock.
    </p>
    <form class="coa-search" action="<?php echo esc_url( $archive ); ?>" method="get" role="search">
      <div class="searchbar searchbar--lg">
        <span class="searchbar__icon"><?php echo pph_icon( 'doc' ); ?></span>
        <label class="visually-hidden" for="coa-q">Product name or lot number</label>
        <input id="coa-q" class="input--mono" name="lot" type="search" value="<?php echo esc_attr( $q_lot ); ?>" placeholder="BP10-0318 or BPC-157" spellcheck="false">
        <button class="btn btn--onDark" type="submit">Search documentation</button>
      </div>
      <p class="verify__hint"><?php echo (int) $total; ?> lots on file &middot; <?php echo (int) $available; ?> currently shipping</p>
    </form>
  </div>
</section>

<div class="wrap">
  <form class="coa-filters" action="<?php echo esc_url( $archive ); ?>" method="get">
    <div>
      <label class="visually-hidden" for="f-product">Product</label>
      <select class="select" id="f-product" name="product">
        <option value="">All products</option>
        <?php foreach ( $product_names as $name ) : ?>
          <option value="<?php echo esc_attr( $name ); ?>"<?php selected( $q_product, $name ); ?>><?php echo esc_html( $name ); ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div>
      <label class="visually-hidden" for="f-status">Status</label>
      <select class="select" id="f-status" name="status">
        <option value="">All lots</option>
        <option value="available"<?php selected( $q_status, 'available' ); ?>>Currently shipping</option>
        <option value="archived"<?php selected( $q_status, 'archived' ); ?>>Archived</option>
      </select>
    </div>
    <button class="btn btn--secondary" type="submit">Apply</button>
    <a class="btn-text" style="margin-left:auto" href="<?php echo esc_url( $archive ); ?>">Reset</a>
  </form>

  <div class="section--tight">
    <div class="row" style="justify-content:space-between;margin-bottom:16px">
      <span class="results-count"><?php echo (int) $found; ?> document<?php echo 1 === $found ? '' : 's'; ?></span>
    </div>

    <?php if ( $filtered ) : ?>
      <p class="small muted" style="margin-bottom:12px">Filtered from <?php echo (int) $total; ?> records. <a class="link" href="<?php echo esc_url( $archive ); ?>">Show all</a>.</p>
    <?php endif; ?>

    <?php if ( ! have_posts() ) : ?>
      <div class="empty" style="margin:24px 0">
        <?php echo pph_icon( 'doc' ); ?>
        <h2>No records match that search</h2>
        <p>Check the lot number printed on the vial label, or search by product name instead.</p>
      </div>
    <?php else : ?>
      <table class="dtable dtable--zebra dtable--stack">
        <caption>Certificates are issued per production lot. Purity is reported as chromatographic area percent.</caption>
        <thead>
          <tr><th>Product</th><th>Lot</th><th>Size</th><th>Test date</th><th>Purity</th><th>Status</th><th>Certificate</th></tr>
        </thead>
        <tbody>
          <?php
          while ( have_posts() ) :
          	the_post();
          	echo pph_coa_row( get_post() );
          endwhile;
          ?>
        </tbody>
      </table>

      <?php
      $links = paginate_links(
      	array(
      		'type'      => 'array',
      		'prev_text' => 'Previous',
      		'next_text' => 'Next',
      	)
      );
      if ( $links ) :
      	?>
        <nav class="pager" aria-label="Pagination"><?php echo implode( '', $links ); ?></nav>
      <?php endif; ?>
    <?php endif; ?>
  </div>
</div>

<section class="section section--mist">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <div class="section-head__text">
        <h2>Reading the documentation</h2>
        <p>What each field on a Purely Peptides Hub certificate records, and how to interpret it.</p>
      </div>
    </div>
    <div class="grid grid-3">
      <div class="icard"><h3>Purity is method-specific</h3><p>The reported figure is area percent under stated chromatographic conditions. Different methods can return different numbers for the same material.</p><a class="link-arrow" href="<?php echo esc_url( home_url( '/research/reading-an-hplc-purity-result/' ) ); ?>"><span>How to read a result</span><?php echo pph_icon( 'arrow' ); ?></a></div>
      <div class="icard"><h3>Identity is a separate test</h3><p>Purity says how much of one component is present. Mass spectrometry confirms that component is the sequence on the label.</p><a class="link-arrow" href="<?php echo esc_url( home_url( '/research/mass-spectrometry-as-an-identity-check/' ) ); ?>"><span>Identity testing</span><?php echo pph_icon( 'arrow' ); ?></a></div>
      <div class="icard"><h3>Lots are the unit of record</h3><p>A certificate applies to one production run. Two lots of the same product carry separate documents and separate results.</p><a class="link-arrow" href="<?php echo esc_url( home_url( '/quality/' ) ); ?>"><span>Our quality process</span><?php echo pph_icon( 'arrow' ); ?></a></div>
    </div>
  </div>
</section>

<?php
get_footer();
