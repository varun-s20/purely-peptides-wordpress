<?php
/**
 * A product category archive - /products/category/<slug>/.
 *
 * Ported from src/pages/catalog.js categoryPage(). Shares the filter/toolbar/
 * results markup with archive-product.php via pph_render_catalog_body() in
 * inc/wc-helpers.php - the same sharing the static build itself uses between
 * productsLanding() and categoryPage().
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$term  = get_queried_object();
$count = $term->count;

echo pph_crumbs( array(
	array( 'label' => 'Home', 'href' => home_url( '/' ) ),
	array( 'label' => 'Products', 'href' => get_permalink( wc_get_page_id( 'shop' ) ) ),
	array( 'label' => $term->name ),
) );
?>

<div class="pagehead pagehead--media">
	<div class="wrap pagehead__split">
		<div>
			<span class="eyebrow"><?php echo esc_html( $term->name ); ?></span>
			<h1><?php echo esc_html( $term->name ); ?></h1>
			<p><?php echo esc_html( $term->description ); ?> Every listed material is supplied with the analytical record for its production lot.</p>
			<div class="row" style="margin-top:24px"><span class="results-count"><?php echo (int) $count; ?> products in this category</span></div>
		</div>
		<div class="pagehead__media">
			<img src="<?php echo esc_url( pph_asset_uri( 'assets/img/' . pph_category_photo_file( $term->slug ) . '.jpg' ) ); ?>" alt="" width="760" height="420" loading="lazy">
		</div>
	</div>
</div>

<?php pph_render_catalog_body( $term->slug, 'Search within ' . strtolower( $term->name ) ); ?>

<section class="section section--mist">
	<div class="wrap">
		<div class="section-head" data-reveal>
			<div class="section-head__text"><h2>Related reading</h2></div>
			<a class="link-arrow" href="<?php echo esc_url( get_post_type_archive_link( 'pph_article' ) ); ?>"><span>Research library</span><?php echo pph_icon( 'arrow' ); ?></a>
		</div>
		<div class="grid grid-3">
			<?php
			$related = get_posts( array( 'post_type' => 'pph_article', 'posts_per_page' => 3 ) );
			foreach ( $related as $a ) :
				$aid = $a->ID;
				?>
				<a class="rcard" href="<?php echo esc_url( get_permalink( $a ) ); ?>">
					<div class="rcard__media"><?php echo pph_m( $aid, 'lead_html' ); ?></div>
					<span class="rcard__cat"><?php echo esc_html( pph_m( $aid, 'category' ) ); ?></span>
					<h3 class="rcard__title"><?php echo esc_html( get_the_title( $a ) ); ?></h3>
					<p class="rcard__excerpt"><?php echo esc_html( get_the_excerpt( $a ) ); ?></p>
					<div class="rcard__meta"><?php echo esc_html( pph_m( $aid, 'date_label' ) ); ?> &middot; <?php echo esc_html( pph_m( $aid, 'read_time' ) ); ?> read</div>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<?php
get_footer();
