<?php
/**
 * The site's own content types.
 *
 * URLs match the static build exactly - /certificates/, /certificates/<lot>/,
 * /research/, /research/<slug>/ - so canonicals, the sitemap and any link the
 * client has already shared stay correct.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'pph_register_post_types' );
function pph_register_post_types() {

	register_post_type(
		'pph_coa',
		array(
			'labels'       => array(
				'name'               => 'Certificates',
				'singular_name'      => 'Certificate',
				'add_new_item'       => 'Add certificate',
				'edit_item'          => 'Edit certificate',
				'search_items'       => 'Search certificates',
				'not_found'          => 'No certificates yet',
				'menu_name'          => 'Certificates',
			),
			'public'       => true,
			'has_archive'  => 'certificates',
			'rewrite'      => array( 'slug' => 'certificates', 'with_front' => false ),
			'menu_icon'    => 'dashicons-media-document',
			'menu_position' => 21,
			/* No editor: every value on a certificate page comes from the meta
			   box, because it has to match the issued document. A free-text
			   body would be a place to contradict it. */
			'supports'     => array( 'title' ),
			'show_in_rest' => false,
		)
	);

	register_post_type(
		'pph_article',
		array(
			'labels'       => array(
				'name'          => 'Research articles',
				'singular_name' => 'Research article',
				'add_new_item'  => 'Add article',
				'edit_item'     => 'Edit article',
				'search_items'  => 'Search articles',
				'not_found'     => 'No articles yet',
				'menu_name'     => 'Research',
			),
			'public'       => true,
			'has_archive'  => 'research',
			'rewrite'      => array( 'slug' => 'research', 'with_front' => false ),
			'menu_icon'    => 'dashicons-welcome-learn-more',
			'menu_position' => 22,
			'supports'     => array( 'title', 'editor', 'excerpt', 'revisions' ),
			'show_in_rest' => false,
		)
	);
}

/**
 * Certificates are looked up by lot number, so order the admin list and the
 * archive by lot rather than by date posted.
 */
add_action( 'pre_get_posts', 'pph_order_archives' );
function pph_order_archives( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( $query->is_post_type_archive( 'pph_coa' ) ) {
		$query->set( 'posts_per_page', 50 );
		$query->set( 'meta_key', '_pph_lot' );
		$query->set( 'orderby', 'meta_value' );
		$query->set( 'order', 'ASC' );
	}
	if ( $query->is_post_type_archive( 'pph_article' ) ) {
		$query->set( 'posts_per_page', 20 );

		/* `/research/?filter=Methods` - the topic tabs. */
		$filter = isset( $_GET['filter'] ) ? sanitize_text_field( wp_unslash( $_GET['filter'] ) ) : '';
		if ( '' !== $filter ) {
			$query->set( 'meta_query', array( array( 'key' => '_pph_category', 'value' => $filter ) ) );
		}
	}
}

/**
 * `/certificates/?lot=BP10-0318` - the search box on the library page. Matches
 * the lot number or the product name, so a vial label or a product name both
 * work, which is what somebody standing at a bench will actually type.
 */
add_action( 'pre_get_posts', 'pph_coa_lot_search' );
function pph_coa_lot_search( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ! $query->is_post_type_archive( 'pph_coa' ) ) {
		return;
	}

	$term    = isset( $_GET['lot'] ) ? sanitize_text_field( wp_unslash( $_GET['lot'] ) ) : '';
	$product = isset( $_GET['product'] ) ? sanitize_text_field( wp_unslash( $_GET['product'] ) ) : '';
	$status  = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : '';

	$meta = array( 'relation' => 'AND' );

	if ( '' !== $term ) {
		/* One box, two things people type: the lot number from the vial label,
		   or the product name. Match either. */
		$meta[] = array(
			'relation' => 'OR',
			array( 'key' => '_pph_lot', 'value' => $term, 'compare' => 'LIKE' ),
			array( 'key' => '_pph_product', 'value' => $term, 'compare' => 'LIKE' ),
		);
	}
	if ( '' !== $product ) {
		$meta[] = array( 'key' => '_pph_product', 'value' => $product );
	}
	if ( '' !== $status ) {
		$meta[] = array( 'key' => '_pph_status', 'value' => $status );
	}

	if ( count( $meta ) > 1 ) {
		$query->set( 'meta_query', $meta );
		/* meta_query replaces the ordering meta_key set above, so restate it. */
		$query->set( 'meta_key', '_pph_lot' );
		$query->set( 'orderby', 'meta_value' );
	}
}

/**
 * WordPress applies page-search.php to a Page whose slug is "search" - it
 * needs that page to actually exist first. Created idempotently on admin load
 * rather than left as a manual step, same reasoning as the guest-checkout
 * setting in inc/checkout.php: a plain file upload does not fire the plugin
 * activation hook on an already-active install.
 */
add_action( 'admin_init', 'pph_ensure_search_page_exists' );
function pph_ensure_search_page_exists() {
	if ( get_page_by_path( 'search' ) ) {
		return;
	}
	wp_insert_post(
		array(
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Search',
			'post_name'   => 'search',
		)
	);
}

/* --------------------------------------------------------- admin columns */

add_filter( 'manage_pph_coa_posts_columns', 'pph_coa_columns' );
function pph_coa_columns( $columns ) {
	$new = array(
		'cb'          => isset( $columns['cb'] ) ? $columns['cb'] : '',
		'title'       => 'Lot',
		'pph_product' => 'Product',
		'pph_size'    => 'Size',
		'pph_purity'  => 'Purity',
		'pph_date'    => 'Test date',
		'pph_doc'     => 'File',
	);
	return $new;
}

add_action( 'manage_pph_coa_posts_custom_column', 'pph_coa_column', 10, 2 );
function pph_coa_column( $column, $post_id ) {
	switch ( $column ) {
		case 'pph_product':
			echo esc_html( pph_m( $post_id, 'product' ) );
			break;
		case 'pph_size':
			echo esc_html( pph_m( $post_id, 'size' ) );
			break;
		case 'pph_purity':
			echo esc_html( pph_m( $post_id, 'purity' ) );
			break;
		case 'pph_date':
			echo esc_html( pph_m( $post_id, 'date' ) );
			break;
		case 'pph_doc':
			$doc = pph_m( $post_id, 'doc_url' );
			echo $doc
				? '<a href="' . esc_url( $doc ) . '" target="_blank" rel="noopener">Open</a>'
				: '<span style="color:#b32d2e">Missing</span>';
			break;
	}
}
