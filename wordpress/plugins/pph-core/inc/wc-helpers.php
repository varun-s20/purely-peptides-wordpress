<?php
/**
 * WooCommerce rendering helpers, ported from src/components.js and
 * src/pages/catalog.js.
 *
 * public/js/catalog.js needs no changes at all: it already works by reading
 * data-* attributes off server-rendered .pcard / .prow elements and
 * hiding/showing/reordering them client-side - "the catalogue page already
 * ships every product in the DOM" per its own top comment. So the only job
 * here is emitting exactly those attributes and exactly that markup from live
 * WooCommerce products, the same discipline as every other template in this
 * plugin: match the prototype's HTML, then the existing CSS and JS need no
 * changes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* Same table as src/art.js CATEGORY_PHOTOS - static presentation metadata,
   7 entries, changes about as often as the category list itself. */
function pph_category_photo_file( $slug ) {
	$map = array(
		'metabolic-research'      => 'cat-metabolic',
		'growth-factor-research'  => 'cat-protein',
		'cell-signalling-research' => 'cat-cellular',
		'cognitive-research'      => 'cat-cognitive',
		'melanocortin-research'   => 'cat-peptides',
		'cofactors'               => 'cat-protein',
		'blends'                  => 'cat-blends',
	);
	return isset( $map[ $slug ] ) ? $map[ $slug ] : 'cat-peptides';
}

function pph_stock_badge( $stock ) {
	if ( 'in-stock' === $stock ) {
		return '<span class="status status--ok">' . pph_icon( 'check' ) . 'In stock</span>';
	}
	return '<span class="status status--stop">' . pph_icon( 'close' ) . 'Backorder</span>';
}

/**
 * Reflects whether a certificate actually exists for the product's current
 * lots - same reasoning as the static build's docBadge(): AllayPay require a
 * lab report per product, and a badge claiming one where none is on file is
 * the kind of thing that fails an underwriting review.
 */
function pph_doc_badge( $has_coa ) {
	return $has_coa
		? '<span class="status status--flat">' . pph_icon( 'doc' ) . 'Lab report</span>'
		: '<span class="status status--warn">' . pph_icon( 'clock' ) . 'Lab report pending</span>';
}

/**
 * Does any of this product's current lots have a certificate on file?
 * Mirrors the static build's `hasCoa`, computed there at build time from
 * src/data.js; computed here at render time from the pph_coa CPT, since that
 * is what an admin can add to without a rebuild.
 */
function pph_product_has_coa( $product_id ) {
	$lots = array();
	$product = wc_get_product( $product_id );
	if ( ! $product ) {
		return false;
	}
	foreach ( $product->get_children() as $variation_id ) {
		$lot = pph_m( $variation_id, 'lot' );
		if ( $lot ) {
			$lots[] = $lot;
		}
	}
	if ( ! $lots ) {
		return false;
	}
	$found = get_posts(
		array(
			'post_type'      => 'pph_coa',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_query'     => array(
				array( 'key' => '_pph_lot', 'value' => $lots, 'compare' => 'IN' ),
			),
		)
	);
	return ! empty( $found );
}

/**
 * The lowest-priced variation's price and size label - what the card and row
 * templates show in the footer ("$65.00 / 5 mg"), matching the static
 * build's use of `sizes[0]`.
 */
function pph_product_lead_variation( $product ) {
	$children = $product->get_children();
	$best     = null;
	foreach ( $children as $vid ) {
		$v = wc_get_product( $vid );
		if ( ! $v ) {
			continue;
		}
		if ( null === $best || (float) $v->get_price() < (float) $best->get_price() ) {
			$best = $v;
		}
	}
	if ( ! $best ) {
		return array( 'price' => 0, 'label' => '' );
	}
	$attrs = $best->get_variation_attributes();
	$label = isset( $attrs['attribute_size'] ) ? $attrs['attribute_size'] : '';
	return array( 'price' => (float) $best->get_price(), 'label' => $label );
}

/** All size labels, in variation order, joined "5 mg · 10 mg · 20 mg". */
function pph_product_size_labels( $product ) {
	$labels = array();
	foreach ( $product->get_children() as $vid ) {
		$v = wc_get_product( $vid );
		if ( ! $v ) {
			continue;
		}
		$attrs    = $v->get_variation_attributes();
		$labels[] = isset( $attrs['attribute_size'] ) ? $attrs['attribute_size'] : '';
	}
	return array_filter( $labels );
}

/** Overall stock state used for the badge and the `data-stock` filter facet. */
function pph_product_stock_state( $product ) {
	foreach ( $product->get_children() as $vid ) {
		$v = wc_get_product( $vid );
		if ( $v && 'instock' === $v->get_stock_status() ) {
			return 'in-stock';
		}
	}
	return 'backorder';
}

/**
 * The data-* attribute string public/js/catalog.js reads to filter, sort and
 * search - unchanged from the static build's facets() in components.js.
 */
function pph_product_facets_attr( $product ) {
	$id       = $product->get_id();
	$lead     = pph_product_lead_variation( $product );
	$cat      = '';
	$terms    = get_the_terms( $id, 'product_cat' );
	if ( $terms && ! is_wp_error( $terms ) ) {
		$cat = $terms[0]->slug;
	}

	return sprintf(
		'data-slug="%s" data-cat="%s" data-area="%s" data-form="%s" data-stock="%s" data-price="%s" data-name="%s" data-sku="%s" data-cas="%s" data-added="%s" data-sizes="%s"',
		esc_attr( $product->get_slug() ),
		esc_attr( $cat ),
		esc_attr( pph_m( $id, 'area' ) ),
		esc_attr( pph_m( $id, 'form' ) ),
		esc_attr( pph_product_stock_state( $product ) ),
		esc_attr( $lead['price'] ),
		esc_attr( $product->get_name() ),
		esc_attr( $product->get_sku() ),
		esc_attr( pph_m( $id, 'cas' ) ),
		esc_attr( get_the_date( 'Y-m-d', $id ) ),
		esc_attr( implode( '|', pph_product_size_labels( $product ) ) )
	);
}

/** Grid card - ported from components.js productCard(). */
function pph_product_card( $product ) {
	$id      = $product->get_id();
	$lead    = pph_product_lead_variation( $product );
	$stock   = pph_product_stock_state( $product );
	$sizes   = pph_product_size_labels( $product );
	$cat_names = wp_get_post_terms( $id, 'product_cat', array( 'fields' => 'names' ) );
	$cat_name  = $cat_names ? $cat_names[0] : 'Research material';

	ob_start();
	?>
	<article class="pcard" <?php echo pph_product_facets_attr( $product ); ?>>
		<div class="pcard__media">
			<?php echo wp_get_attachment_image( get_post_thumbnail_id( $id ), 'medium', false, array( 'alt' => esc_attr( $product->get_name() . ' supplied as lyophilised powder in a sealed glass vial' ) ) ); ?>
			<button class="wishdot" type="button" data-wish-toggle="<?php echo esc_attr( $product->get_slug() ); ?>" data-wish-label="<?php echo esc_attr( $product->get_name() ); ?>" aria-pressed="false"><?php echo pph_icon( 'heart' ); ?></button>
			<div class="pcard__quick">
				<button class="btn btn--primary btn--sm btn--block" type="button"
					data-add-to-order data-quick data-slug="<?php echo esc_attr( $product->get_slug() ); ?>" data-name="<?php echo esc_attr( $product->get_name() ); ?>"
					<?php disabled( 'backorder', $stock ); ?>>
					<?php echo 'backorder' === $stock ? 'Out of stock' : 'Add to order'; ?>
				</button>
			</div>
		</div>
		<div class="pcard__body">
			<span class="tag"><?php echo esc_html( $cat_name ); ?></span>
			<h3 class="pcard__name"><a href="<?php echo esc_url( get_permalink( $id ) ); ?>"><?php echo esc_html( $product->get_name() ); ?></a></h3>
			<div class="pcard__meta">
				<span>CAS <?php echo esc_html( pph_m( $id, 'cas' ) ); ?></span>
				<span><?php echo esc_html( implode( ' · ', $sizes ) ); ?></span>
			</div>
			<div class="row" style="gap:6px"><?php echo pph_stock_badge( $stock ) . pph_doc_badge( pph_product_has_coa( $id ) ); ?></div>
			<div class="pcard__foot">
				<span class="pcard__price"><?php echo wc_price( $lead['price'] ); ?><small>/ <?php echo esc_html( $lead['label'] ); ?></small></span>
				<span class="link-arrow"><span>View</span><?php echo pph_icon( 'arrow' ); ?></span>
			</div>
		</div>
	</article>
	<?php
	return ob_get_clean();
}

/** List-view row - ported from components.js productRow(). */
function pph_product_row( $product ) {
	$id    = $product->get_id();
	$lead  = pph_product_lead_variation( $product );
	$stock = pph_product_stock_state( $product );

	ob_start();
	?>
	<article class="prow" <?php echo pph_product_facets_attr( $product ); ?>>
		<div class="prow__media"><?php echo wp_get_attachment_image( get_post_thumbnail_id( $id ), 'medium' ); ?></div>
		<div class="prow__head">
			<h3 class="prow__name"><a href="<?php echo esc_url( get_permalink( $id ) ); ?>"><?php echo esc_html( $product->get_name() ); ?></a></h3>
			<p class="prow__desc"><?php echo esc_html( $product->get_short_description() ); ?></p>
			<div class="row" style="gap:6px;margin-top:10px"><?php echo pph_stock_badge( $stock ) . pph_doc_badge( pph_product_has_coa( $id ) ); ?></div>
		</div>
		<div class="prow__cells" style="display:contents">
			<div class="prow__cell"><span class="label">CAS</span><span class="prow__val"><?php echo esc_html( pph_m( $id, 'cas' ) ); ?></span></div>
			<div class="prow__cell"><span class="label">Form</span><span class="prow__val"><?php echo esc_html( str_replace( ' powder', '', pph_m( $id, 'form' ) ) ); ?></span></div>
			<div class="prow__cell"><span class="label">Purity</span><span class="prow__val"><?php echo esc_html( pph_m( $id, 'purity' ) ); ?></span></div>
		</div>
		<div class="prow__buy">
			<span class="pcard__price"><?php echo wc_price( $lead['price'] ); ?><small>/ <?php echo esc_html( $lead['label'] ); ?></small></span>
			<div class="row" style="gap:6px;flex-wrap:nowrap">
				<button class="btn btn--primary btn--sm" type="button" data-add-to-order data-quick
					data-slug="<?php echo esc_attr( $product->get_slug() ); ?>" data-name="<?php echo esc_attr( $product->get_name() ); ?>" <?php disabled( 'backorder', $stock ); ?>>Add</button>
				<a class="btn btn--secondary btn--sm" href="<?php echo esc_url( get_permalink( $id ) ); ?>">View</a>
			</div>
		</div>
	</article>
	<?php
	return ob_get_clean();
}

/**
 * public/js/catalog.js filters the products already in the DOM rather than
 * fetching a new page - the static build's own pager was decorative even
 * there (it linked to a `?page=2` that build.js never generated). So every
 * matching product must render on one request for filtering to work over the
 * whole catalogue. 25 products is nowhere near where that stops being fine;
 * if the catalogue grows enough to matter, catalog.js needs a real fetch-more
 * story before this can go back to being paginated.
 */
add_action( 'pre_get_posts', 'pph_wc_show_all_products' );
function pph_wc_show_all_products( $query ) {
	if ( ! function_exists( 'is_shop' ) || is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( is_shop() || is_product_category() ) {
		$query->set( 'posts_per_page', -1 );
	}
}

/**
 * Real, catalogue-wide counts for the four facets public/js/catalog.js
 * actually wires up (category, research area, form, availability). The other
 * three filter groups in the static design (Available size, Documentation,
 * Product type) were never wired to real data there either - no `data-filter`
 * attribute was ever emitted for them, so checking them did nothing in the
 * original build either. Ported as the same decorative groups rather than
 * quietly making them do more than the design ever did; see PROGRESS.md.
 */
function pph_catalog_facets() {
	$products = wc_get_products( array( 'limit' => -1, 'status' => 'publish' ) );

	$areas = array();
	$forms = array( 'Lyophilised powder' => 0, 'Solution' => 0, 'Blend' => 0 );
	$stock = array( 'in-stock' => 0, 'backorder' => 0 );

	foreach ( $products as $p ) {
		$id   = $p->get_id();
		$area = pph_m( $id, 'area' );
		if ( $area ) {
			$areas[ $area ] = ( isset( $areas[ $area ] ) ? $areas[ $area ] : 0 ) + 1;
		}
		$form = strtolower( pph_m( $id, 'form' ) );
		if ( false !== strpos( $form, 'lyophilised' ) ) {
			$forms['Lyophilised powder']++;
		} elseif ( false !== strpos( $form, 'solution' ) ) {
			$forms['Solution']++;
		} elseif ( false !== strpos( $form, 'blend' ) || false !== strpos( $form, 'mixture' ) ) {
			$forms['Blend']++;
		}
		$stock[ pph_product_stock_state( $p ) ]++;
	}

	return array( 'areas' => $areas, 'forms' => $forms, 'stock' => $stock );
}

/**
 * The filter sidebar, toolbar, results grid/list and pager - shared by the
 * shop landing page and every category archive, exactly as
 * src/pages/catalog.js shares filters()/toolbar()/resultsArea() between
 * productsLanding() and categoryPage(). Facet counts are always
 * catalogue-wide, never scoped to the current category - matching the static
 * build, which reads its global `products` array regardless of which page it
 * is building.
 */
function pph_get_real_categories() {
	/* Every WooCommerce install auto-creates a default "Uncategorized" term.
	   We have our own 7 categories from src/data.js and never assign products
	   to that default one deliberately - it appears in get_terms() anyway and
	   would otherwise show up as an empty 8th tile on the shop page. */
	$cats = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false ) );
	$real = array();
	foreach ( $cats as $c ) {
		if ( 'uncategorized' !== $c->slug ) {
			$real[] = $c;
		}
	}
	return $real;
}

function pph_render_catalog_body( $active_cat_slug = '', $search_placeholder = 'Search within products' ) {
	$facets = pph_catalog_facets();
	$cats   = pph_get_real_categories();
	?>
	<div class="wrap catalog">
		<aside class="filters" data-filters data-open="false" aria-label="Filter products">
			<div class="filters__inner">
				<div class="filters__head">
					<h2>Filters</h2>
					<button class="btn-text" type="button" data-filters-clear>Clear all</button>
					<button class="modal__close filters__close" type="button" data-filters-close aria-label="Close filters"><?php echo pph_icon( 'close' ); ?></button>
				</div>

				<div class="fgroup" data-facet="cat">
					<button class="fgroup__btn" type="button" aria-expanded="true" data-fgroup>Category<span class="acc__icon" aria-hidden="true"></span></button>
					<div class="fgroup__panel" data-open="true"><div><div class="inner">
						<?php foreach ( $cats as $c ) : ?>
							<label class="check">
								<input type="checkbox" data-filter="cat" value="<?php echo esc_attr( $c->slug ); ?>"<?php checked( $c->slug, $active_cat_slug ); ?>>
								<span><?php echo esc_html( $c->name ); ?><span class="check__count"><?php echo (int) $c->count; ?></span></span>
							</label>
						<?php endforeach; ?>
					</div></div></div>
				</div>

				<div class="fgroup" data-facet="area">
					<button class="fgroup__btn" type="button" aria-expanded="true" data-fgroup>Research area<span class="acc__icon" aria-hidden="true"></span></button>
					<div class="fgroup__panel" data-open="true"><div><div class="inner">
						<?php foreach ( $facets['areas'] as $area => $n ) : ?>
							<label class="check">
								<input type="checkbox" data-filter="area" value="<?php echo esc_attr( $area ); ?>">
								<span><?php echo esc_html( $area ); ?><span class="check__count"><?php echo (int) $n; ?></span></span>
							</label>
						<?php endforeach; ?>
					</div></div></div>
				</div>

				<div class="fgroup" data-facet="form">
					<button class="fgroup__btn" type="button" aria-expanded="true" data-fgroup>Form<span class="acc__icon" aria-hidden="true"></span></button>
					<div class="fgroup__panel" data-open="true"><div><div class="inner">
						<?php foreach ( $facets['forms'] as $label => $n ) : ?>
							<label class="check">
								<input type="checkbox" data-filter="form" value="<?php echo esc_attr( $label ); ?>">
								<span><?php echo esc_html( $label ); ?><span class="check__count"><?php echo (int) $n; ?></span></span>
							</label>
						<?php endforeach; ?>
					</div></div></div>
				</div>

				<div class="fgroup" data-facet="stock">
					<button class="fgroup__btn" type="button" aria-expanded="false" data-fgroup>Availability<span class="acc__icon" aria-hidden="true"></span></button>
					<div class="fgroup__panel" data-open="false"><div><div class="inner">
						<label class="check"><input type="checkbox" data-filter="stock" value="in-stock"><span>In stock<span class="check__count"><?php echo (int) $facets['stock']['in-stock']; ?></span></span></label>
						<label class="check"><input type="checkbox" data-filter="stock" value="backorder"><span>Backorder<span class="check__count"><?php echo (int) $facets['stock']['backorder']; ?></span></span></label>
					</div></div></div>
				</div>

				<div class="filters__apply">
					<button class="btn btn--secondary" type="button" data-filters-close>Cancel</button>
					<button class="btn btn--primary" style="flex:1" type="button" data-filters-close data-filters-apply>Show all products</button>
				</div>
			</div>
		</aside>

		<div>
			<div class="toolbar">
				<div class="toolbar__left">
					<button class="btn btn--secondary btn--sm filter-fab" type="button" data-filters-open><?php echo pph_icon( 'filter' ); ?> Filters</button>
					<form class="searchbar" style="flex:1;max-width:340px" action="<?php echo esc_url( home_url( '/search/' ) ); ?>" method="get" role="search">
						<span class="searchbar__icon"><?php echo pph_icon( 'search' ); ?></span>
						<label class="visually-hidden" for="within">Search within results</label>
						<input id="within" name="q" type="search" data-within autocomplete="off" placeholder="<?php echo esc_attr( $search_placeholder ); ?>">
					</form>
				</div>
				<div class="toolbar__right">
					<span class="results-count" data-results-count><?php echo (int) $GLOBALS['wp_query']->found_posts; ?> results</span>
					<label class="visually-hidden" for="sort">Sort products</label>
					<select class="select" id="sort" data-sort style="width:auto;min-width:170px">
						<option value="featured">Sort: Featured</option>
						<option value="name">Name A&ndash;Z</option>
						<option value="newest">Newest first</option>
						<option value="price-asc">Price, low to high</option>
						<option value="price-desc">Price, high to low</option>
					</select>
					<div class="viewtoggle" role="group" aria-label="Result layout">
						<button type="button" aria-pressed="true" data-view="grid" aria-label="Grid view"><?php echo pph_icon( 'grid' ); ?></button>
						<button type="button" aria-pressed="false" data-view="list" aria-label="List view"><?php echo pph_icon( 'list' ); ?></button>
					</div>
				</div>
			</div>

			<div class="empty" data-results-empty hidden style="margin-top:24px">
				<?php echo pph_icon( 'search' ); ?>
				<h3>No products match these filters</h3>
				<p>Clear a filter or widen the search. If a compound is not listed, we will confirm whether it can be sourced.</p>
				<div class="row" style="justify-content:center;gap:10px">
					<button class="btn btn--secondary" type="button" data-filters-clear>Clear all filters</button>
					<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/contact/?topic=product' ) ); ?>">Request a material</a>
				</div>
			</div>

			<?php if ( have_posts() ) : ?>
				<div data-results-grid>
					<div class="product-grid">
						<?php
						while ( have_posts() ) :
							the_post();
							$p = wc_get_product( get_the_ID() );
							if ( $p ) {
								echo pph_product_card( $p );
							}
						endwhile;
						?>
					</div>
				</div>
				<?php
				/* Rebuilt as a second pass so the list view has the same
				   products the grid does - the_post() above already advanced
				   the loop, so rewind it. */
				rewind_posts();
				?>
				<div data-results-list hidden style="padding-top:8px">
					<?php
					while ( have_posts() ) :
						the_post();
						$p = wc_get_product( get_the_ID() );
						if ( $p ) {
							echo pph_product_row( $p );
						}
					endwhile;
					?>
				</div>
			<?php else : ?>
				<div class="empty" style="margin-top:24px">
					<h3>No products in this category yet</h3>
					<p>Tell us what you are looking for and we will confirm whether it can be sourced.</p>
					<a class="btn btn--secondary" href="<?php echo esc_url( home_url( '/contact/?topic=product' ) ); ?>">Request a material</a>
				</div>
			<?php endif; ?>
		</div>
	</div>
	<?php
}

/* ------------------------------------------------------ single product page */

/**
 * Every variation as [ id, label, price, stock ], in the order they were
 * created (which is the order the sizes are listed in src/data.js).
 */
function pph_product_variation_rows( $product ) {
	$rows = array();
	foreach ( $product->get_children() as $vid ) {
		$v = wc_get_product( $vid );
		if ( ! $v ) {
			continue;
		}
		$attrs  = $v->get_variation_attributes();
		$rows[] = array(
			'id'    => $vid,
			'label' => isset( $attrs['attribute_size'] ) ? $attrs['attribute_size'] : '',
			'price' => (float) $v->get_price(),
			'stock' => 'instock' === $v->get_stock_status() ? 'in-stock' : 'backorder',
		);
	}
	return $rows;
}

/**
 * The product gallery - main shot plus the four-thumb strip from
 * src/pages/product.js. There is only one photograph per product (the static
 * build rotates three shared vial shots across the catalogue), so the second
 * thumb repeats it exactly as the original did.
 */
function pph_product_gallery( $product ) {
	$id    = $product->get_id();
	$thumb = get_post_thumbnail_id( $id );
	$alt   = $product->get_name() . ' supplied as lyophilised powder in a sealed glass vial';

	ob_start();
	?>
	<div class="pdp__gallery">
		<div class="pdp__main"><?php echo wp_get_attachment_image( $thumb, 'large', false, array( 'alt' => esc_attr( $alt ) ) ); ?></div>
		<div class="pdp__thumbs">
			<button class="pdp__thumb" type="button" aria-pressed="true" aria-label="Vial, front"><?php echo wp_get_attachment_image( $thumb, 'thumbnail' ); ?></button>
			<button class="pdp__thumb" type="button" aria-label="Vial, second view"><?php echo wp_get_attachment_image( $thumb, 'thumbnail' ); ?></button>
			<button class="pdp__thumb" type="button" aria-label="Chromatogram for the current lot" style="display:grid;place-items:center;padding:8px" data-graph><?php echo pph_chromatogram_svg( 120, 70 ); ?></button>
			<button class="pdp__thumb" type="button" aria-label="Certificate preview" style="display:grid;place-items:center;color:var(--slate)"><?php echo pph_icon( 'doc' ); ?></button>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * The purchase box: size picker, quantity stepper, purchase options, volume
 * ladder and the stacked-price panel - the markup from src/pages/product.js,
 * unchanged, so public/js/script.js drives all of it with no JS edits.
 *
 * The difference from the static build is underneath: this is wrapped in a
 * real WooCommerce add-to-cart form. The size buttons write the chosen
 * variation into the form's hidden inputs (assets/js/pph-woo.js), the
 * quantity field IS Woo's `quantity` field, and the button is a real submit -
 * so what the page shows and what lands in the cart are the same thing.
 *
 * Volume pricing is applied for real on the server in inc/pricing.php, so the
 * ladder's arithmetic is true at checkout, not just on screen.
 *
 * Subscribe & Save renders but is DISABLED, with a note. Its -10% cannot be
 * honoured until phase 9 builds the subscription engine (which is itself
 * blocked on AllayPay confirming card tokenisation), and quoting a price the
 * checkout will not charge is a misrepresentation, not a cosmetic gap - the
 * one thing an underwriting review would actually fail us for. Removing
 * `disabled` and the note is the whole change once the engine exists.
 */
function pph_render_purchase_box( $product ) {
	$rows = pph_product_variation_rows( $product );
	if ( ! $rows ) {
		return '<p class="notice notice--warn">No sizes are configured for this product yet.</p>';
	}

	/* Default to the first in-stock size, falling back to the first listed -
	   the static build always opened on sizes[0]. */
	$lead = $rows[0];
	foreach ( $rows as $r ) {
		if ( 'in-stock' === $r['stock'] ) {
			$lead = $r;
			break;
		}
	}

	$v5  = (float) pph_setting( 'volume_discount_5' );
	$v10 = (float) pph_setting( 'volume_discount_10' );
	$sub = (float) pph_setting( 'subscription_discount' );

	ob_start();
	?>
	<div class="pdp__price">
		<span class="amount" data-price><?php echo esc_html( wp_strip_all_tags( wc_price( $lead['price'] ) ) ); ?></span>
		<span class="per" data-per>per <?php echo esc_html( $lead['label'] ); ?> vial</span>
	</div>

	<?php
	/* class is deliberately NOT "cart" - that is WooCommerce's own reserved
	   class for its default add-to-cart form, styled with floats and inline
	   layout for a totally different (dropdown + quantity + button, all in one
	   row) markup than ours. The static build never wrapped these controls in
	   a <form> at all, so that styling could never reach them; naming ours
	   "cart" pulled WooCommerce's own form.cart CSS in over our layout, which
	   is what put Size next to Quantity and Purchase options next to the
	   Volume ladder - both are direct children of this form. The class has no
	   functional purpose: WooCommerce's cart-handling PHP keys off the
	   `add-to-cart` POST field, not the form's class, and its variation JS
	   targets `form.variations_form`, which we do not use since we drive
	   variation selection ourselves via woo.js. */
	?>
	<form class="pph-buybox-form" method="post" enctype="multipart/form-data" data-pph-cart>
		<input type="hidden" name="add-to-cart" value="<?php echo absint( $product->get_id() ); ?>">
		<input type="hidden" name="variation_id" value="<?php echo absint( $lead['id'] ); ?>" data-pph-variation>
		<input type="hidden" name="attribute_size" value="<?php echo esc_attr( $lead['label'] ); ?>" data-pph-attr>

		<div class="field">
			<span class="field__label" id="size-label">Size</span>
			<div class="optset" role="group" aria-labelledby="size-label">
				<?php foreach ( $rows as $r ) : ?>
					<button class="opt" type="button"
						aria-pressed="<?php echo $r['id'] === $lead['id'] ? 'true' : 'false'; ?>"
						data-size
						data-value="<?php echo esc_attr( $r['price'] ); ?>"
						data-label="<?php echo esc_attr( $r['label'] ); ?>"
						data-variation-id="<?php echo absint( $r['id'] ); ?>"
						<?php echo 'backorder' === $r['stock'] ? ' data-backorder="true"' : ''; ?>>
						<span class="opt__size"><?php echo esc_html( $r['label'] ); ?></span>
						<span class="opt__price"><?php echo wc_price( $r['price'] ); ?></span>
						<span class="opt__stock"><?php echo 'in-stock' === $r['stock'] ? 'In stock' : 'To order'; ?></span>
					</button>
				<?php endforeach; ?>
			</div>
		</div>

		<div class="field">
			<label class="field__label" for="qty">Quantity</label>
			<div class="qty" data-qty>
				<button type="button" aria-label="Decrease quantity" data-step="-1">&minus;</button>
				<input id="qty" name="quantity" type="number" value="1" min="1" max="999" aria-label="Quantity">
				<button type="button" aria-label="Increase quantity" data-step="1">+</button>
			</div>
		</div>

		<div class="field">
			<span class="field__label" id="buy-mode-label">Purchase options</span>
			<div class="buymode" role="radiogroup" aria-labelledby="buy-mode-label">
				<label class="buymode__opt">
					<input type="radio" name="buy-mode" value="once" checked data-buymode>
					<span class="buymode__body">
						<span class="buymode__title">One-time purchase</span>
						<span class="buymode__note">Volume pricing still applies.</span>
					</span>
				</label>
				<label class="buymode__opt">
					<input type="radio" name="buy-mode" value="sub" data-buymode disabled>
					<span class="buymode__body">
						<span class="buymode__title">Subscribe &amp; Save <span class="buymode__save">&minus;<?php echo (int) $sub; ?>%</span></span>
						<span class="buymode__note">Available at launch. Stacks with volume pricing; pause, skip or cancel any time.</span>
					</span>
				</label>
			</div>
		</div>

		<div class="volume" style="margin-bottom:14px" data-volume>
			<div class="volume__tier" data-active="true" data-tier="0">
				<div class="volume__qty">1&ndash;4 vials</div>
				<div class="volume__price"><?php echo wc_price( $lead['price'] ); ?></div>
			</div>
			<div class="volume__tier" data-tier="1">
				<div class="volume__qty">5&ndash;9 vials &middot; &minus;<?php echo (int) $v5; ?>%</div>
				<div class="volume__price"><?php echo wc_price( $lead['price'] * ( 1 - $v5 / 100 ) ); ?></div>
			</div>
			<div class="volume__tier" data-tier="2">
				<div class="volume__qty">10+ vials &middot; &minus;<?php echo (int) $v10; ?>%</div>
				<div class="volume__price"><?php echo wc_price( $lead['price'] * ( 1 - $v10 / 100 ) ); ?></div>
			</div>
		</div>

		<div class="pricecalc" data-pricecalc hidden>
			<div class="pricecalc__row"><span>List price</span><span class="mono" data-calc-list></span></div>
			<div class="pricecalc__row" data-calc-volrow hidden><span data-calc-vollabel>Volume discount</span><span class="mono" data-calc-vol></span></div>
			<div class="pricecalc__row" data-calc-subrow hidden><span>Subscribe &amp; Save</span><span class="mono" data-calc-sub></span></div>
			<div class="pricecalc__row pricecalc__row--total"><span data-calc-totallabel>Total</span><span class="mono" data-calc-total></span></div>
			<p class="pricecalc__note" data-calc-note hidden></p>
		</div>

		<div class="pdp__buy">
			<button class="btn btn--primary btn--lg" type="submit">Add to order</button>
			<button class="btn btn--secondary btn--lg wishbtn" type="button" data-wish-toggle="<?php echo esc_attr( $product->get_slug() ); ?>" data-wish-label="<?php echo esc_attr( $product->get_name() ); ?>" aria-pressed="false"><?php echo pph_icon( 'heart' ); ?></button>
		</div>
	</form>
	<?php
	return ob_get_clean();
}

/**
 * The pph_coa post treated as "the current lot" for this product - the
 * documented lot with the most recent test date among its variations' own
 * lot values. Mirrors src/pages/product.js's own reasoning ("the newest one
 * with a certificate actually on file") without needing a static build-time
 * pass over every lot.
 */
function pph_product_current_lot_post( $product ) {
	$candidates = array();
	foreach ( $product->get_children() as $vid ) {
		$lot = pph_m( $vid, 'lot' );
		if ( ! $lot ) {
			continue;
		}
		$found = get_posts(
			array(
				'post_type'      => 'pph_coa',
				'posts_per_page' => 1,
				'meta_query'     => array( array( 'key' => '_pph_lot', 'value' => $lot ) ),
			)
		);
		if ( $found ) {
			$candidates[] = $found[0];
		}
	}
	if ( ! $candidates ) {
		return null;
	}
	usort(
		$candidates,
		function ( $a, $b ) {
			return strtotime( pph_m( $b->ID, 'date' ) ) <=> strtotime( pph_m( $a->ID, 'date' ) );
		}
	);
	return $candidates[0];
}

/**
 * Lot codes that are in inventory (a variation carries them) but have no
 * certificate yet - shown honestly rather than implying documentation that
 * does not exist, same reasoning as pph_doc_badge().
 */
function pph_product_pending_lots( $product ) {
	$pending = array();
	$seen    = array();
	foreach ( $product->get_children() as $vid ) {
		$lot = pph_m( $vid, 'lot' );
		if ( ! $lot || isset( $seen[ $lot ] ) ) {
			continue;
		}
		$seen[ $lot ] = true;
		$has          = get_posts(
			array(
				'post_type'      => 'pph_coa',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_query'     => array( array( 'key' => '_pph_lot', 'value' => $lot ) ),
			)
		);
		if ( ! $has ) {
			$v     = wc_get_product( $vid );
			$attrs = $v ? $v->get_variation_attributes() : array();
			$pending[] = array(
				'lot'  => $lot,
				'size' => isset( $attrs['attribute_size'] ) ? $attrs['attribute_size'] : '',
			);
		}
	}
	return $pending;
}

/** The 4 FAQ entries from src/pages/product.js, filled with real per-product values. */
function pph_product_faqs( $product ) {
	$id = $product->get_id();
	return array(
		array(
			'q' => 'What is included with the material?',
			'a' => 'Each vial is supplied with the lot number printed on the label. The certificate of analysis for that lot is available in the certificate library and in your account after the order ships. ' . esc_html( pph_m( $id, 'form' ) ) . ' is shipped sealed and desiccated.',
		),
		array(
			'q' => 'How should this material be stored on arrival?',
			'a' => 'Store at ' . esc_html( strtolower( pph_m( $id, 'storage' ) ) ) . '. Short transit at ambient temperature is not expected to affect lyophilised material. Once reconstituted, storage life is substantially shorter and depends on the buffer used.',
		),
		array(
			'q' => 'Can I request documentation for a lot I already have?',
			'a' => 'Yes. Enter the lot number from the vial label into the <a class="link" href="' . esc_url( get_post_type_archive_link( 'pph_coa' ) ) . '">certificate library</a>. Archived lots remain searchable after they are no longer in stock.',
		),
		array(
			'q' => 'Do you supply larger quantities?',
			'a' => 'Gram-scale quantities and custom fills are quoted through the wholesale team. <a class="link" href="' . esc_url( home_url( '/wholesale/' ) ) . '">Wholesale ordering</a> also covers purchase orders and consolidated invoicing.',
		),
	);
}

/** Ported from components.js accordion(). */
function pph_accordion( array $items, $id_prefix ) {
	ob_start();
	?>
	<div class="acc">
		<?php foreach ( $items as $i => $it ) : ?>
			<div class="acc__item">
				<h3 style="margin:0">
					<button class="acc__btn" type="button" aria-expanded="<?php echo 0 === $i ? 'true' : 'false'; ?>" aria-controls="<?php echo esc_attr( $id_prefix . '-' . $i ); ?>" data-acc>
						<?php echo esc_html( $it['q'] ); ?><span class="acc__icon" aria-hidden="true"></span>
					</button>
				</h3>
				<div class="acc__panel" id="<?php echo esc_attr( $id_prefix . '-' . $i ); ?>" data-open="<?php echo 0 === $i ? 'true' : 'false'; ?>"><div><div class="inner"><?php echo $it['a']; ?></div></div></div>
			</div>
		<?php endforeach; ?>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * A generic decorative chromatogram trace. The static build seeds a unique
 * squiggle per lot/SKU; this renders one fixed, reasonable-looking peak
 * instead of porting that generator. Justified by the label already on this
 * element in both versions - "Schematic - measured trace is in the
 * certificate" - it was never meant to represent real data either way.
 */
function pph_chromatogram_svg( $w = 620, $h = 110 ) {
	$base = $h - 2;
	ob_start();
	?>
	<svg viewBox="0 0 <?php echo (int) $w; ?> <?php echo (int) $h; ?>" role="img" aria-label="Schematic chromatogram trace" preserveAspectRatio="none">
		<line x1="0" y1="<?php echo (int) $base; ?>" x2="<?php echo (int) $w; ?>" y2="<?php echo (int) $base; ?>" stroke="#C1C1C1" stroke-width="1"/>
		<path class="trace" fill="none" stroke="#C1C1C1" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"
			d="M0,<?php echo $base; ?> C<?php echo round( $w * 0.32 ); ?>,<?php echo $base; ?> <?php echo round( $w * 0.42 ); ?>,<?php echo $base; ?> <?php echo round( $w * 0.47 ); ?>,<?php echo round( $h * 0.12 ); ?> C<?php echo round( $w * 0.51 ); ?>,<?php echo $base; ?> <?php echo round( $w * 0.6 ); ?>,<?php echo $base; ?> <?php echo (int) $w; ?>,<?php echo $base; ?>"/>
		<text x="0" y="<?php echo (int) $h - 2; ?>" font-family="Noto Sans, sans-serif" font-size="9" fill="#5C6E71" letter-spacing="1">0 MIN</text>
		<text x="<?php echo (int) $w; ?>" y="<?php echo (int) $h - 2; ?>" text-anchor="end" font-family="Noto Sans, sans-serif" font-size="9" fill="#5C6E71" letter-spacing="1">30 MIN</text>
	</svg>
	<?php
	return ob_get_clean();
}

/** Up to $limit other products sharing this one's research area or category. */
function pph_related_products( $product, $limit = 4 ) {
	$id      = $product->get_id();
	$area    = pph_m( $id, 'area' );
	$my_cats = wp_get_post_terms( $id, 'product_cat', array( 'fields' => 'ids' ) );

	$related = array();
	foreach ( wc_get_products( array( 'limit' => -1, 'status' => 'publish', 'exclude' => array( $id ) ) ) as $p ) {
		$pid       = $p->get_id();
		$p_cats    = wp_get_post_terms( $pid, 'product_cat', array( 'fields' => 'ids' ) );
		$same_area = $area && pph_m( $pid, 'area' ) === $area;
		$same_cat  = array_intersect( $my_cats, $p_cats );
		if ( $same_area || $same_cat ) {
			$related[] = $p;
		}
		if ( count( $related ) >= $limit ) {
			break;
		}
	}
	return $related;
}

/** Category tile on the shop landing page - ported from categoryPanel(). */
function pph_category_panel( $term ) {
	$img = pph_asset_uri( 'assets/img/' . pph_category_photo_file( $term->slug ) . '.jpg' );
	ob_start();
	?>
	<a class="cat-panel" href="<?php echo esc_url( get_term_link( $term ) ); ?>">
		<div class="cat-panel__art"><img src="<?php echo esc_url( $img ); ?>" alt="" width="640" height="420" loading="lazy"></div>
		<h3 class="cat-panel__title"><?php echo esc_html( $term->name ); ?></h3>
		<p class="cat-panel__blurb"><?php echo esc_html( $term->description ); ?></p>
		<div class="cat-panel__foot">
			<span class="cat-panel__count"><?php echo (int) $term->count; ?> materials</span>
			<span class="link-arrow"><span>Explore</span><?php echo pph_icon( 'arrow' ); ?></span>
		</div>
	</a>
	<?php
	return ob_get_clean();
}
