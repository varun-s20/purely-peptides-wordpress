<?php
/**
 * Field definitions and the meta boxes that edit them.
 *
 * One field table per post type, used by three things: the meta box, the save
 * handler, and tools/import-wp-content.php. A field added here appears in all
 * three - there is no second list to keep in step.
 *
 * ACF is not used. Every field is flat text, the free tier has no Repeater, and
 * a dependency that buys nothing is a dependency that still has to be updated.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * type: text | textarea | url | select
 * A field with `locked => true` renders read-only. Used for the two AllayPay
 * strings and for values that must match the certificate document.
 */
function pph_coa_fields() {
	return array(
		'lot'          => array( 'label' => 'Lot / batch number', 'type' => 'text' ),
		'product'      => array( 'label' => 'Product name', 'type' => 'text' ),
		'product_slug' => array( 'label' => 'Product slug', 'type' => 'text', 'hint' => 'Used to link to /products/&lt;slug&gt;/' ),
		'size'         => array( 'label' => 'Fill size', 'type' => 'text' ),
		'status'       => array(
			'label'   => 'Status',
			'type'    => 'select',
			'options' => array(
				'available' => 'Currently shipping',
				'archived'  => 'Archived lot',
				'pending'   => 'Awaiting COA',
			),
		),
		'date'         => array( 'label' => 'Test date', 'type' => 'text', 'hint' => 'As printed on the certificate, e.g. 3 Apr 2026' ),
		'received'     => array( 'label' => 'Sample received', 'type' => 'text' ),
		'purity'       => array( 'label' => 'Purity', 'type' => 'text' ),
		'content'      => array( 'label' => 'Net peptide content', 'type' => 'text' ),
		'endotoxin'    => array( 'label' => 'Endotoxin', 'type' => 'text' ),
		'heavy_metals' => array( 'label' => 'Heavy metals', 'type' => 'text' ),
		'sterility'    => array( 'label' => 'Sterility', 'type' => 'text' ),
		'retention'    => array( 'label' => 'Retention time', 'type' => 'text' ),
		'method'       => array( 'label' => 'Purity method', 'type' => 'text' ),
		'identity'     => array( 'label' => 'Identity result', 'type' => 'text' ),
		'lab'          => array( 'label' => 'Testing laboratory', 'type' => 'text', 'hint' => 'The laboratory that performed the analysis, not the vendor named on the document' ),
		'vendor'       => array( 'label' => 'Material vendor', 'type' => 'text' ),
		'verify_url'   => array( 'label' => 'Laboratory verification URL', 'type' => 'url' ),
		'accession'    => array( 'label' => 'Document reference', 'type' => 'text', 'hint' => 'Leave blank to use COA-&lt;lot&gt;' ),
		'doc_url'      => array( 'label' => 'Certificate file URL', 'type' => 'url', 'hint' => 'Upload the PDF to the Media Library and paste its URL' ),
		'doc_type'     => array( 'label' => 'File type', 'type' => 'text', 'hint' => 'PDF or Image' ),
		'preview_url'  => array( 'label' => 'First-page preview image URL', 'type' => 'url', 'hint' => 'A rendered image of page one. An inline PDF viewer shows a blank box on most phones.' ),
		'note'         => array( 'label' => 'Note shown on the page', 'type' => 'textarea', 'hint' => 'Use for a discrepancy in the supplied document. Appears as a warning notice.' ),
		'cas'          => array( 'label' => 'CAS number', 'type' => 'text', 'hint' => 'Copied from the product. Leave blank to omit the row.' ),
		'formula'      => array( 'label' => 'Molecular formula', 'type' => 'text' ),
		'mw'           => array( 'label' => 'Molecular weight', 'type' => 'text' ),
	);
}

function pph_article_fields() {
	return array(
		'category'   => array( 'label' => 'Category', 'type' => 'text' ),
		'date_label' => array( 'label' => 'Published (displayed)', 'type' => 'text' ),
		'read_time'  => array( 'label' => 'Reading time', 'type' => 'text' ),
		'author'     => array( 'label' => 'Author', 'type' => 'text' ),
		'role'       => array( 'label' => 'Author role', 'type' => 'text' ),
		'abstract'   => array( 'label' => 'Abstract', 'type' => 'textarea' ),
		'tags'       => array( 'label' => 'Tags', 'type' => 'text', 'hint' => 'Comma separated' ),
		'refs'       => array( 'label' => 'References', 'type' => 'textarea', 'hint' => 'One per line' ),
		'featured'   => array(
			'label'   => 'Featured',
			'type'    => 'select',
			'options' => array( '' => 'No', '1' => 'Yes' ),
		),
		'lead_html'  => array( 'label' => 'Lead image markup', 'type' => 'textarea', 'hint' => 'Generated on import. Edit only if you know what you are changing.' ),
	);
}

/* ------------------------------------------------------------------ boxes */

add_action( 'add_meta_boxes', 'pph_register_meta_boxes' );
function pph_register_meta_boxes() {
	add_meta_box( 'pph-coa-fields', 'Certificate details', 'pph_render_coa_box', 'pph_coa', 'normal', 'high' );
	add_meta_box( 'pph-article-fields', 'Article details', 'pph_render_article_box', 'pph_article', 'normal', 'high' );
}

function pph_render_coa_box( $post ) {
	pph_render_fields( $post, pph_coa_fields(), 'pph_coa' );
}

function pph_render_article_box( $post ) {
	pph_render_fields( $post, pph_article_fields(), 'pph_article' );
}

function pph_render_fields( $post, array $fields, $context ) {
	wp_nonce_field( 'pph_save_' . $context, 'pph_nonce_' . $context );
	echo '<style>.pph-f{margin:0 0 14px}.pph-f label{display:block;font-weight:600;margin-bottom:4px}'
		. '.pph-f input,.pph-f textarea,.pph-f select{width:100%}.pph-f textarea{min-height:70px}'
		. '.pph-f .pph-hint{color:#666;font-size:12px;margin-top:3px}</style>';

	foreach ( $fields as $key => $f ) {
		$value = pph_m( $post->ID, $key );
		$id    = 'pph_' . $key;
		echo '<div class="pph-f">';
		printf( '<label for="%s">%s</label>', esc_attr( $id ), esc_html( $f['label'] ) );

		if ( 'textarea' === $f['type'] ) {
			printf(
				'<textarea id="%s" name="%s">%s</textarea>',
				esc_attr( $id ),
				esc_attr( $id ),
				esc_textarea( $value )
			);
		} elseif ( 'select' === $f['type'] ) {
			printf( '<select id="%s" name="%s">', esc_attr( $id ), esc_attr( $id ) );
			foreach ( $f['options'] as $ov => $ol ) {
				printf(
					'<option value="%s"%s>%s</option>',
					esc_attr( $ov ),
					selected( $value, $ov, false ),
					esc_html( $ol )
				);
			}
			echo '</select>';
		} else {
			printf(
				'<input type="%s" id="%s" name="%s" value="%s">',
				'url' === $f['type'] ? 'url' : 'text',
				esc_attr( $id ),
				esc_attr( $id ),
				esc_attr( $value )
			);
		}

		if ( ! empty( $f['hint'] ) ) {
			echo '<p class="pph-hint">' . wp_kses( $f['hint'], array( 'code' => array() ) ) . '</p>';
		}
		echo '</div>';
	}
}

/* ------------------------------------------------------------------- save */

add_action( 'save_post_pph_coa', 'pph_save_coa', 10, 2 );
function pph_save_coa( $post_id, $post ) {
	pph_save_fields( $post_id, pph_coa_fields(), 'pph_coa' );
}

add_action( 'save_post_pph_article', 'pph_save_article', 10, 2 );
function pph_save_article( $post_id, $post ) {
	pph_save_fields( $post_id, pph_article_fields(), 'pph_article' );
}

function pph_save_fields( $post_id, array $fields, $context ) {
	$nonce = 'pph_nonce_' . $context;

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! isset( $_POST[ $nonce ] ) || ! wp_verify_nonce( sanitize_key( $_POST[ $nonce ] ), 'pph_save_' . $context ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	foreach ( $fields as $key => $f ) {
		$field = 'pph_' . $key;
		if ( ! isset( $_POST[ $field ] ) ) {
			continue;
		}
		$raw = wp_unslash( $_POST[ $field ] );

		if ( 'url' === $f['type'] ) {
			/* esc_url_raw() rather than esc_url(): this is storage, not output. */
			$value = esc_url_raw( $raw );
		} elseif ( 'lead_html' === $key ) {
			/* Markup on purpose - an <img> tag. Only users who may post
			   unfiltered HTML can change it; everyone else gets it stripped. */
			$value = current_user_can( 'unfiltered_html' ) ? $raw : wp_kses_post( $raw );
		} elseif ( 'textarea' === $f['type'] ) {
			$value = sanitize_textarea_field( $raw );
		} else {
			$value = sanitize_text_field( $raw );
		}

		update_post_meta( $post_id, '_pph_' . $key, $value );
	}
}
