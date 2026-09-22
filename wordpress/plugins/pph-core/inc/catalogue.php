<?php
/**
 * window.PP_CATALOGUE, regenerated live instead of shipped as a static file.
 *
 * The static build generated this once, at build time, from src/data.js -
 * fine for a site with no backend. Now that products live in WooCommerce and
 * change without a rebuild, a stale copy would drift the moment someone edits
 * a price in wp-admin. Cheap enough to build fresh per request at 25
 * products; add a transient cache here first if the catalogue ever grows
 * enough for that to matter.
 *
 * Shape matches the static build's own catalogue.js (slug, sku, name, img,
 * href, sizes[]) plus the two fields nothing static ever needed: the real
 * product and variation IDs, which is what the real add-to-cart calls need to
 * talk to WooCommerce.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function pph_catalogue_data() {
	$out = array();

	foreach ( wc_get_products( array( 'limit' => -1, 'status' => 'publish' ) ) as $product ) {
		$id    = $product->get_id();
		$sizes = array();
		foreach ( $product->get_children() as $vid ) {
			$v = wc_get_product( $vid );
			if ( ! $v ) {
				continue;
			}
			$attrs    = $v->get_variation_attributes();
			$sizes[]  = array(
				'label'       => isset( $attrs['attribute_size'] ) ? $attrs['attribute_size'] : '',
				'price'       => (float) $v->get_price(),
				'variationId' => $vid,
				/* Matches the values public/js/catalog.js's bulk-order parser
				   already checks for ('out-of-stock'), so that feature - and
				   the search/facet code that reads a product's overall stock -
				   keeps working unchanged against this live feed. */
				'stock'       => 'instock' === $v->get_stock_status() ? 'in-stock' : 'out-of-stock',
			);
		}
		if ( ! $sizes ) {
			continue;
		}

		$thumb_id  = get_post_thumbnail_id( $id );
		$img_url   = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'medium' ) : '';
		$any_stock = false;
		foreach ( $sizes as $s ) {
			if ( 'in-stock' === $s['stock'] ) {
				$any_stock = true;
				break;
			}
		}

		$out[] = array(
			'id'              => $id,
			'slug'            => $product->get_slug(),
			'sku'             => $product->get_sku(),
			'name'            => $product->get_name(),
			'img'             => $img_url,
			'href'            => get_permalink( $id ),
			'leadVariationId' => $sizes[0]['variationId'],
			'stock'           => $any_stock ? 'in-stock' : 'out-of-stock',
			'sizes'           => $sizes,
		);
	}

	return $out;
}

function pph_catalogue_js() {
	return 'window.PP_CATALOGUE = ' . wp_json_encode( pph_catalogue_data() ) . ';';
}

/**
 * The header search box's typeahead dropdown (public/js/script.js's
 * renderSuggest()) reads a `SUGGEST` object with the same three groups this
 * builds. In the static build that object was hand-written sample data - five
 * products, two lots, two articles, permanently, even on the live static
 * site. Generating it from the real catalogue instead means every real
 * product, certificate and article is actually searchable, not just whichever
 * five someone typed in as an example a year ago.
 */
function pph_suggest_data() {
	$products = array();
	foreach ( wc_get_products( array( 'limit' => -1, 'status' => 'publish' ) ) as $p ) {
		$lead = pph_product_lead_variation( $p );
		$products[] = array(
			'label' => $p->get_name(),
			'meta'  => trim( $lead['label'] . ' &middot; ' . $p->get_sku() ),
			'href'  => get_permalink( $p->get_id() ),
		);
	}

	$documentation = array();
	foreach ( get_posts( array( 'post_type' => 'pph_coa', 'posts_per_page' => -1, 'meta_key' => '_pph_lot', 'orderby' => 'meta_value', 'order' => 'ASC' ) ) as $c ) {
		$documentation[] = array(
			'label' => 'Lot ' . pph_m( $c->ID, 'lot' ),
			'meta'  => trim( pph_m( $c->ID, 'product' ) . ' &middot; ' . pph_m( $c->ID, 'purity' ) ),
			'href'  => get_permalink( $c ),
		);
	}

	$research = array();
	foreach ( get_posts( array( 'post_type' => 'pph_article', 'posts_per_page' => -1 ) ) as $a ) {
		$research[] = array(
			'label' => get_the_title( $a ),
			'meta'  => pph_m( $a->ID, 'category' ),
			'href'  => get_permalink( $a ),
		);
	}

	return array( 'products' => $products, 'documentation' => $documentation, 'research' => $research );
}

function pph_suggest_js() {
	return 'window.PP_SUGGEST = ' . wp_json_encode( pph_suggest_data() ) . ';';
}
