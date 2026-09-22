<?php
/**
 * Small rendering helpers, ported from src/components.js.
 *
 * Only the pieces the certificate and article templates actually use. The rest
 * of components.js stays in the static build until a template needs it.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Read one of our meta fields. Everything we store is prefixed `_pph_` so it
 * stays out of the generic Custom Fields box - editing happens in our own
 * meta box, where the fields have labels.
 */
function pph_m( $post_id, $key, $default = '' ) {
	$value = get_post_meta( $post_id, '_pph_' . $key, true );
	return ( '' === $value || null === $value ) ? $default : $value;
}

/**
 * Breadcrumb trail. $trail is a list of array( 'label' => ..., 'href' => ... );
 * the last entry is the current page and takes no link.
 */
function pph_crumbs( array $trail ) {
	$out   = '<nav class="crumbs" aria-label="Breadcrumb"><div class="wrap"><ol>';
	$last  = count( $trail ) - 1;
	foreach ( $trail as $i => $t ) {
		if ( $i === $last ) {
			$out .= '<li aria-current="page">' . esc_html( $t['label'] ) . '</li>';
		} else {
			$out .= '<li><a href="' . esc_url( $t['href'] ) . '">' . esc_html( $t['label'] ) . '</a></li>'
				. '<li class="sep" aria-hidden="true">/</li>';
		}
	}
	return $out . '</ol></div></nav>';
}

/**
 * The research-use notice. The default wording is an AllayPay condition -
 * do not reword it.
 */
function pph_research_notice( $extra = '' ) {
	$text = $extra ? $extra : 'This material is supplied for laboratory research and in-vitro use by qualified professionals. It is not for human or veterinary use, and no therapeutic claim is made or implied.';
	return '<div class="notice notice--warn">'
		. pph_icon( 'flask' )
		. '<div><strong>Research use only.</strong> ' . esc_html( $text ) . '</div>'
		. '</div>';
}

/**
 * One row of the certificate library table. Ported from components.js lotRow().
 */
function pph_coa_row( $post ) {
	$id     = $post->ID;
	$status = pph_m( $id, 'status', 'available' );

	if ( 'available' === $status ) {
		$badge = '<span class="status status--ok">' . pph_icon( 'check' ) . 'Available</span>';
	} elseif ( 'pending' === $status ) {
		$badge = '<span class="status status--warn">' . pph_icon( 'clock' ) . 'Awaiting COA</span>';
	} else {
		$badge = '<span class="status status--flat">' . pph_icon( 'clock' ) . 'Archived</span>';
	}

	$product_slug = pph_m( $id, 'product_slug' );

	ob_start();
	?>
	<tr>
		<td data-label="Product"><a class="link" href="<?php echo esc_url( home_url( '/products/' . $product_slug . '/' ) ); ?>"><?php echo esc_html( pph_m( $id, 'product' ) ); ?></a></td>
		<td data-label="Lot" class="mono"><?php echo esc_html( pph_m( $id, 'lot' ) ); ?></td>
		<td data-label="Size" class="mono"><?php echo esc_html( pph_m( $id, 'size' ) ); ?></td>
		<td data-label="Test date" class="mono"><?php echo esc_html( pph_m( $id, 'date' ) ); ?></td>
		<td data-label="Purity" class="mono"><?php echo esc_html( pph_m( $id, 'purity' ) ); ?></td>
		<td data-label="Status"><?php echo $badge; ?></td>
		<td data-label="Certificate">
			<?php if ( pph_m( $id, 'doc_url' ) ) : ?>
				<a class="link-arrow" href="<?php the_permalink( $post ); ?>"><span>View</span><?php echo pph_icon( 'arrow' ); ?></a>
			<?php else : ?>
				<span class="muted small">Pending</span>
			<?php endif; ?>
		</td>
	</tr>
	<?php
	return ob_get_clean();
}

/**
 * Build the article table of contents from the body itself.
 *
 * The static build carried a hand-written list alongside the prose. Deriving it
 * from the `<h2 id="sN">` headings instead means it cannot fall out of step
 * when the owner edits an article - which they are meant to be able to do.
 */
function pph_toc_from_content( $html ) {
	if ( ! preg_match_all( '/<h2\s+id="(s\d+)"[^>]*>(.*?)<\/h2>/is', $html, $m, PREG_SET_ORDER ) ) {
		return array();
	}
	$toc = array();
	foreach ( $m as $match ) {
		$toc[] = array(
			'id'    => $match[1],
			'label' => trim( wp_strip_all_tags( $match[2] ) ),
		);
	}
	return $toc;
}

/**
 * Other documented lots of the same product, for the certificate sidebar.
 *
 * @return WP_Post[]
 */
function pph_sibling_lots( $product_slug ) {
	if ( ! $product_slug ) {
		return array();
	}
	return get_posts(
		array(
			'post_type'      => 'pph_coa',
			'posts_per_page' => 20,
			'orderby'        => 'meta_value',
			'meta_key'       => '_pph_lot',
			'order'          => 'ASC',
			'meta_query'     => array(
				array(
					'key'   => '_pph_product_slug',
					'value' => $product_slug,
				),
			),
		)
	);
}

/**
 * A research-article card - ported from components.js researchCard(). Used
 * on the category archive, the single-product page's related-reading section,
 * and the search page - factored here once rather than repeated inline in
 * three templates.
 */
function pph_research_card( $post ) {
	$id = $post->ID;
	ob_start();
	?>
	<a class="rcard" href="<?php echo esc_url( get_permalink( $post ) ); ?>">
		<div class="rcard__media"><?php echo pph_m( $id, 'lead_html' ); ?></div>
		<span class="rcard__cat"><?php echo esc_html( pph_m( $id, 'category' ) ); ?></span>
		<h3 class="rcard__title"><?php echo esc_html( get_the_title( $post ) ); ?></h3>
		<p class="rcard__excerpt"><?php echo esc_html( get_the_excerpt( $post ) ); ?></p>
		<div class="rcard__meta"><?php echo esc_html( pph_m( $id, 'date_label' ) ); ?> &middot; <?php echo esc_html( pph_m( $id, 'read_time' ) ); ?> read</div>
	</a>
	<?php
	return ob_get_clean();
}
