<?php
/**
 * Imports the product categories and products (one variation per size)
 * exported by tools/export-wp-products.js.
 *
 * Re-running it applies a new inventory sheet: prices, wholesale prices, lot
 * numbers and on-hand quantities are all overwritten from products.json. That
 * is the point - but it also means a quantity edited by hand in wp-admin since
 * the last import is replaced by the sheet's figure.
 *
 * Used by both the WP-CLI script (tools/import-wp-products.php) and the
 * in-admin zip uploader (Tools -> Import PPH Products), same pattern as
 * inc/importer.php for certificates and articles.
 *
 * Idempotent by SKU: re-running after a re-export updates existing products
 * and variations in place. It does NOT remove a variation whose size was
 * deleted from src/data.js - if a product's size list ever shrinks, the
 * orphaned variation needs removing by hand in wp-admin. Not worth the extra
 * code for something that has not happened once in this catalogue's history.
 *
 * Everything here is built on WooCommerce's own CRUD objects
 * (WC_Product_Variable, WC_Product_Attribute, WC_Product_Variation) rather
 * than writing post meta directly, so WooCommerce's own price-range and
 * stock-status caches stay correct.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A Media Library attachment for an image in the theme's assets folder,
 * returning its ID (0 if the file is missing).
 *
 * This DOES copy the file into wp-content/uploads/pph-products/, rather than
 * pointing the attachment straight at the theme's copy. That was the original
 * approach, and it produced broken image tags: WordPress stores an
 * attachment's file as a path *relative to the uploads directory*
 * (`_wp_attached_file`), then rebuilds the front-end URL from that relative
 * path plus the uploads base URL. A file living outside uploads entirely has
 * no such relative path, so the URL WordPress reconstructs is wrong. Saving
 * ~9 MB by not duplicating the images was the wrong trade - a working image
 * is worth more than the disk space.
 *
 * Safe to call repeatedly: it looks for an existing attachment for the same
 * source file first. An attachment left over from the earlier, broken version
 * of this function - detectable because its `_wp_attached_file` does not sit
 * under the uploads directory - is deleted and recreated correctly rather
 * than left broken.
 */
function pph_theme_image_attachment( $relative_path ) {
	$source_path = trailingslashit( get_stylesheet_directory() ) . 'assets/' . ltrim( $relative_path, '/' );
	if ( ! file_exists( $source_path ) ) {
		return 0;
	}

	$existing = get_posts(
		array(
			'post_type'      => 'attachment',
			'posts_per_page' => 1,
			'meta_key'       => '_pph_source_file',
			'meta_value'     => $relative_path,
		)
	);

	if ( $existing ) {
		$uploads  = wp_upload_dir();
		$attached = get_attached_file( $existing[0]->ID );
		$is_valid = $attached && file_exists( $attached ) && 0 === strpos( $attached, trailingslashit( $uploads['basedir'] ) );
		if ( ! $is_valid ) {
			wp_delete_attachment( $existing[0]->ID, true );
			$existing = array();
		}
	}

	if ( $existing ) {
		$attach_id = $existing[0]->ID;
	} else {
		$uploads   = wp_upload_dir();
		$dest_dir  = trailingslashit( $uploads['basedir'] ) . 'pph-products';
		wp_mkdir_p( $dest_dir );
		$dest_path = $dest_dir . '/' . basename( $source_path );
		if ( ! file_exists( $dest_path ) || filemtime( $source_path ) > filemtime( $dest_path ) ) {
			copy( $source_path, $dest_path );
		}

		$filetype  = wp_check_filetype( basename( $dest_path ), null );
		$attach_id = wp_insert_attachment(
			array(
				'post_mime_type' => $filetype['type'],
				'post_title'     => sanitize_file_name( pathinfo( $dest_path, PATHINFO_FILENAME ) ),
				'post_status'    => 'inherit',
			),
			$dest_path,
			0
		);
		if ( is_wp_error( $attach_id ) ) {
			return 0;
		}
		update_post_meta( $attach_id, '_pph_source_file', $relative_path );

		require_once ABSPATH . 'wp-admin/includes/image.php';
		wp_update_attachment_metadata( $attach_id, wp_generate_attachment_metadata( $attach_id, $dest_path ) );
	}

	return (int) $attach_id;
}

/**
 * Create or update the product categories.
 *
 * @return array{slug: string => term_id: int}
 */
function pph_import_categories( array $categories ) {
	$ids = array();
	foreach ( $categories as $c ) {
		$term = term_exists( $c['slug'], 'product_cat' );
		if ( $term ) {
			$term_id = (int) $term['term_id'];
			wp_update_term( $term_id, 'product_cat', array( 'name' => $c['name'], 'description' => $c['description'], 'slug' => $c['slug'] ) );
		} else {
			$created = wp_insert_term( $c['name'], 'product_cat', array( 'description' => $c['description'], 'slug' => $c['slug'] ) );
			if ( is_wp_error( $created ) ) {
				continue;
			}
			$term_id = (int) $created['term_id'];
		}
		$ids[ $c['slug'] ] = $term_id;
	}
	return $ids;
}

/**
 * Create or update one variable product and its size variations.
 *
 * @return array{ok?: string, error?: string}
 */
function pph_upsert_product( array $row, array $category_ids ) {
	if ( ! class_exists( 'WC_Product_Variable' ) ) {
		return array( 'error' => 'WooCommerce is not active.' );
	}

	$existing_id = wc_get_product_id_by_sku( $row['sku'] );
	$product     = ( $existing_id && 'product' === get_post_type( $existing_id ) )
		? wc_get_product( $existing_id )
		: new WC_Product_Variable();

	$product->set_name( $row['name'] );
	$product->set_slug( $row['slug'] );
	$product->set_sku( $row['sku'] );
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'visible' );
	$product->set_description( $row['overview'] );
	$product->set_short_description( $row['summary'] );
	$product->set_featured( $row['featured'] );
	$product->set_date_created( $row['date'] );

	/* "Size" as a local (per-product) attribute, not a shared taxonomy - sizes
	   and prices differ enough between products (and the blends use compound
	   labels like "50/10/10 mg") that a shared attribute would gain nothing
	   WooCommerce needs it "used for variations" or it cannot back a variable
	   product. */
	$attribute = new WC_Product_Attribute();
	$attribute->set_id( 0 );
	$attribute->set_name( 'Size' );
	$attribute->set_options( wp_list_pluck( $row['sizes'], 'label' ) );
	$attribute->set_position( 0 );
	$attribute->set_visible( true );
	$attribute->set_variation( true );
	$product->set_attributes( array( $attribute ) );

	if ( ! empty( $category_ids[ $row['category_slug'] ] ) ) {
		$product->set_category_ids( array( $category_ids[ $row['category_slug'] ] ) );
	}

	/* Lead photograph as the featured image, the other sizes' photographs as
	   the gallery. Each variation also gets its own below, so the cart line
	   and the product page show the vial for the size actually chosen. */
	if ( ! empty( $row['image'] ) ) {
		$product->set_image_id( pph_theme_image_attachment( $row['image'] ) );
	}
	$product->set_gallery_image_ids( array_filter( array_map( 'pph_theme_image_attachment', isset( $row['gallery'] ) ? $row['gallery'] : array() ) ) );

	$product_id = $product->save();
	if ( ! $product_id ) {
		return array( 'error' => $row['slug'] . ': product save failed' );
	}

	foreach ( array( 'area', 'cas', 'formula', 'mw', 'sequence', 'form', 'purity', 'method', 'storage', 'sds_url', 'sds_ref' ) as $key ) {
		update_post_meta( $product_id, '_pph_' . $key, isset( $row[ $key ] ) ? $row[ $key ] : '' );
	}
	update_post_meta( $product_id, '_pph_verify', $row['verify'] ? '1' : '' );

	foreach ( $row['sizes'] as $position => $size ) {
		$var_id    = wc_get_product_id_by_sku( $size['sku'] );
		$variation = ( $var_id && 'product_variation' === get_post_type( $var_id ) )
			? wc_get_product( $var_id )
			: new WC_Product_Variation();

		$variation->set_parent_id( $product_id );
		$variation->set_sku( $size['sku'] );
		$variation->set_attributes( array( 'size' => $size['label'] ) );
		$variation->set_regular_price( $size['price'] );
		/* Sizes are listed smallest first in src/data.js; without an explicit
		   order a size added later (BPC-157 15 mg) sorts after the old ones. */
		$variation->set_menu_order( $position );
		$variation->set_image_id( empty( $size['image'] ) ? 0 : pph_theme_image_attachment( $size['image'] ) );

		/* Stocked sizes track their real quantity and fall back to backorder -
		   the "To order" state every unstocked size already shows - when they
		   sell through. Unstocked sizes stay orderable on backorder. */
		if ( 'in-stock' === $size['stock'] && ! empty( $size['qty'] ) ) {
			$variation->set_manage_stock( true );
			$variation->set_stock_quantity( (int) $size['qty'] );
			$variation->set_backorders( 'notify' );
		} else {
			$variation->set_manage_stock( false );
			$variation->set_stock_status( 'in-stock' === $size['stock'] ? 'instock' : 'onbackorder' );
		}
		$variation->set_status( 'publish' );
		$variation->save();

		update_post_meta( $variation->get_id(), '_pph_lot', $size['lot'] );
		update_post_meta( $variation->get_id(), '_pph_wholesale_price', null === $size['wholesale'] ? '' : wc_format_decimal( $size['wholesale'] ) );
	}

	/* Recalculates the parent's cached price range and stock status from the
	   variations just written. Skipping this leaves the shop/category listing
	   showing stale or empty price ranges after an update. */
	WC_Product_Variable::sync( $product_id );

	return array( 'ok' => sprintf( 'Product %s (%s) -> %s', $row['slug'], $row['sku'], get_permalink( $product_id ) ) );
}

/**
 * Import every category and product found under $dir, which must contain
 * categories.json and products.json - exactly what
 * tools/export-wp-products.js produces.
 *
 * @return array{log: string[], errors: string[], n_cat: int, n_prod: int}
 */
function pph_run_product_import( $dir ) {
	$log    = array();
	$errors = array();
	$n_cat  = 0;
	$n_prod = 0;

	if ( ! class_exists( 'WooCommerce' ) ) {
		$errors[] = 'WooCommerce is not active. Install and activate it first.';
		return compact( 'log', 'errors', 'n_cat', 'n_prod' );
	}

	$cat_file  = $dir . '/categories.json';
	$prod_file = $dir . '/products.json';

	if ( ! file_exists( $cat_file ) ) {
		$errors[] = 'categories.json not found in ' . $dir;
	}
	if ( ! file_exists( $prod_file ) ) {
		$errors[] = 'products.json not found in ' . $dir;
	}
	if ( $errors ) {
		return compact( 'log', 'errors', 'n_cat', 'n_prod' );
	}

	$categories   = (array) json_decode( (string) file_get_contents( $cat_file ), true );
	$category_ids = pph_import_categories( $categories );
	$n_cat        = count( $category_ids );
	$log[]        = sprintf( '%d categories.', $n_cat );

	$products = (array) json_decode( (string) file_get_contents( $prod_file ), true );
	foreach ( $products as $row ) {
		$r = pph_upsert_product( $row, $category_ids );
		if ( isset( $r['error'] ) ) {
			$errors[] = $r['error'];
		} else {
			$log[] = $r['ok'];
			$n_prod++;
		}
	}

	flush_rewrite_rules();

	return compact( 'log', 'errors', 'n_cat', 'n_prod' );
}
