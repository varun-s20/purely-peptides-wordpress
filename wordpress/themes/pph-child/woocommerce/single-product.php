<?php
/**
 * The single-product page wrapper.
 *
 * Without this, WooCommerce falls back to ITS OWN default single-product.php,
 * which fires `woocommerce_before_main_content` before handing off to our
 * content-single-product.php - and WooCommerce hooks its own default
 * breadcrumb onto exactly that action. That produced two breadcrumb rows: the
 * default one from Woo's wrapper, then ours from the content template.
 *
 * Taking over the whole page - same as archive-product.php and
 * taxonomy-product_cat.php already do - means none of WooCommerce's default
 * hooks (breadcrumb, sidebar, related-products-via-hook) fire at all, so there
 * is nothing left to collide with our own markup. content-single-product.php
 * itself is unchanged and still does all the real work; this file's only job
 * is calling the loop exactly once before handing off to it.
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	wc_get_template_part( 'content', 'single-product' );
endwhile;

get_footer();
