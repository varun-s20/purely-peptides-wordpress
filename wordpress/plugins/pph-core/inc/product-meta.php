<?php
/**
 * The spec-table fields on a WooCommerce product - CAS, formula, sequence,
 * purity method, storage - that WooCommerce itself has no field for.
 *
 * Same shape as inc/meta.php's certificate/article field tables: one table
 * used by the meta box, the save handler, and the importer, so a field added
 * here appears in all three.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function pph_product_fields() {
	return array(
		'area'     => array( 'label' => 'Research area', 'type' => 'text' ),
		'cas'      => array( 'label' => 'CAS number', 'type' => 'text', 'hint' => '"On request" for materials with no supporting document - do not invent a number.' ),
		'formula'  => array( 'label' => 'Molecular formula', 'type' => 'text' ),
		'mw'       => array( 'label' => 'Molecular weight', 'type' => 'text' ),
		'sequence' => array( 'label' => 'Sequence / composition', 'type' => 'textarea' ),
		'form'     => array( 'label' => 'Form', 'type' => 'text' ),
		'purity'   => array( 'label' => 'Purity', 'type' => 'text' ),
		'method'   => array( 'label' => 'Test method', 'type' => 'text' ),
		'storage'  => array( 'label' => 'Storage', 'type' => 'text' ),
		'sds_url'  => array( 'label' => 'Safety data sheet URL', 'type' => 'url', 'hint' => 'Leave blank if none exists yet.' ),
		'sds_ref'  => array( 'label' => 'SDS reference number', 'type' => 'text' ),
		'verify'   => array(
			'label'   => 'Identity unverified',
			'type'    => 'select',
			'options' => array( '' => 'No - CAS/formula/MW confirmed', '1' => 'Yes - render as "On request"' ),
		),
	);
}

add_action( 'add_meta_boxes', 'pph_register_product_meta_box' );
function pph_register_product_meta_box() {
	add_meta_box( 'pph-product-fields', 'Research material specification', 'pph_render_product_box', 'product', 'normal', 'high' );
}

function pph_render_product_box( $post ) {
	pph_render_fields( $post, pph_product_fields(), 'pph_product' );
}

add_action( 'save_post_product', 'pph_save_product_fields', 10, 2 );
function pph_save_product_fields( $post_id, $post ) {
	pph_save_fields( $post_id, pph_product_fields(), 'pph_product' );
}

/**
 * Per-size fields on each variation's panel (Product data -> Variations):
 * the lot currently shipping for that size, and its wholesale price. Both
 * change every time new stock arrives, so the client edits them here rather
 * than waiting on a re-import. The lot is what the certificate lookup and the
 * "Lab report" badge key off; the wholesale price is what inc/wholesale.php
 * charges an approved wholesale account.
 */
add_action( 'woocommerce_variation_options_pricing', 'pph_render_variation_fields', 10, 3 );
function pph_render_variation_fields( $loop, $variation_data, $variation ) {
	woocommerce_wp_text_input(
		array(
			'id'            => "pph_wholesale_price_{$loop}",
			'name'          => "pph_wholesale_price[{$loop}]",
			'label'         => 'Wholesale price ($)',
			'value'         => get_post_meta( $variation->ID, '_pph_wholesale_price', true ),
			'data_type'     => 'price',
			'wrapper_class' => 'form-row form-row-first',
			'desc_tip'      => true,
			'description'   => 'Charged to approved wholesale accounts, minimum 10 of this size. Blank = they pay the regular price.',
		)
	);
	woocommerce_wp_text_input(
		array(
			'id'            => "pph_lot_{$loop}",
			'name'          => "pph_lot[{$loop}]",
			'label'         => 'Current lot number',
			'value'         => get_post_meta( $variation->ID, '_pph_lot', true ),
			'wrapper_class' => 'form-row form-row-last',
			'desc_tip'      => true,
			'description'   => 'The lot now shipping for this size, exactly as on the vial label and its certificate.',
		)
	);
}

add_action( 'woocommerce_save_product_variation', 'pph_save_variation_fields', 10, 2 );
function pph_save_variation_fields( $variation_id, $loop ) {
	/* WooCommerce verifies its own nonce before firing this action. */
	if ( isset( $_POST['pph_wholesale_price'][ $loop ] ) ) {
		update_post_meta( $variation_id, '_pph_wholesale_price', wc_format_decimal( wp_unslash( $_POST['pph_wholesale_price'][ $loop ] ) ) );
	}
	if ( isset( $_POST['pph_lot'][ $loop ] ) ) {
		update_post_meta( $variation_id, '_pph_lot', strtoupper( sanitize_text_field( wp_unslash( $_POST['pph_lot'][ $loop ] ) ) ) );
	}
}
