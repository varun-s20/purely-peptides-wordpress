<?php
/**
 * The shop landing page - /products/.
 *
 * Ported from src/pages/catalog.js productsLanding(). WooCommerce's own hooks
 * (woocommerce_before_shop_loop etc.) are not used - this renders the exact
 * static markup directly, same approach as the certificate and article
 * templates, so the existing CSS applies with no theme-specific overrides.
 *
 * Handles the shop landing page ONLY. Category archives are
 * woocommerce/taxonomy-product_cat.php - WooCommerce picks whichever one
 * matches, so this file never runs for a category URL.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$total_products = wp_count_posts( 'product' )->publish;
$documented     = count(
	get_posts(
		array(
			'post_type'      => 'pph_coa',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => array( array( 'key' => '_pph_status', 'value' => 'available' ) ),
		)
	)
);

echo pph_crumbs( array(
	array( 'label' => 'Home', 'href' => home_url( '/' ) ),
	array( 'label' => 'Products' ),
) );
?>

<div class="pagehead">
	<div class="wrap">
		<span class="eyebrow">Catalogue</span>
		<h1>Research materials</h1>
		<p>
			Synthetic peptides and related compounds supplied to laboratories for in-vitro and preclinical
			research. Specifications, available sizes and lot documentation are published on every product page.
		</p>
		<div class="row" style="margin-top:24px;gap:8px">
			<span class="results-count"><?php echo (int) $total_products; ?> products</span>
			<span class="utility__sep" style="background:var(--rule)"></span>
			<span class="results-count"><?php echo (int) $documented; ?> lots documented</span>
		</div>
	</div>
</div>

<?php
/* "Browse by category" (a hero grid of category tiles) and "Quick order"
   (the SKU/bulk-paste box, id="quick-order") both dropped from the page body
   on request - the products page goes straight into the catalogue instead of
   two hero sections above it. Neither feature is lost: every category these
   tiles linked to is still one click away in the header's mega menu AND is
   the first filter group in the catalogue body directly below
   (pph_render_catalog_body()'s `data-facet="cat"` checkboxes) - category
   browsing lives in the nav and as a filter now, not as its own page section.
   Quick order (catalog.js's data-bulk / data-bulk-add) has no remaining
   entry point on this page; header.php's "Quick order" icon link, which
   pointed at this section's #quick-order anchor, is removed alongside it. */
pph_render_catalog_body( '', 'Search within products' );

get_footer();
