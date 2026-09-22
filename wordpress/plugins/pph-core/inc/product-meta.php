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
