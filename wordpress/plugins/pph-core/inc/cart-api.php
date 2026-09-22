<?php
/**
 * The real cart, as a small REST API.
 *
 * The static build's cart drawer, badge and cart page were all driven by
 * localStorage - there was no server to ask. Now there is a real WooCommerce
 * cart, and these three endpoints are the one place that reads or writes it,
 * so the drawer, the badge and the full cart page can never show three
 * different counts.
 *
 * Markup returned by the render functions is byte-for-byte the static
 * build's own `.cart-line` / `.cart-row` shapes (public/js/store.js's old
 * renderDrawer() / renderCartPage()), so the existing CSS needs no changes -
 * only the data source moved, from localStorage to WC()->cart.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* WooCommerce only loads the cart/session on the normal front-end request
   lifecycle. A REST request needs to ask for it explicitly, or WC()->cart is
   null and every call here fatals. This is WooCommerce's own documented
   pattern for cart-aware REST endpoints. */
add_action( 'rest_api_init', 'pph_load_cart_for_rest' );
function pph_load_cart_for_rest() {
	if ( ! WC()->cart ) {
		wc_load_cart();
	}
}

/**
 * Every /pph/v1/cart* response must never be cached, by anything, for any
 * visitor - each one describes ONE visitor's own live cart, not shared,
 * cacheable content. Found live 16 Sep 2026: LiteSpeed Cache was serving
 * `GET /wp-json/pph/v1/cart` with `Cache-Control: public, max-age=604800`
 * (a week) and `x-litespeed-cache: hit` - a single snapshot, taken whenever
 * the cache first filled (an empty cart), handed back to every visitor,
 * cart.js's own refresh() included, silently overwriting whatever the page
 * had actually just rendered. That's the "item added, but /cart/ or the
 * drawer still shows empty" bug.
 *
 * `functions.php`'s pph_never_cache_dynamic_pages() does NOT cover this - it
 * hooks `template_redirect`, which never fires for a REST API request at
 * all, so it silently did nothing here. LiteSpeed's own WooCommerce
 * integration auto-excludes WooCommerce's OWN REST namespaces
 * (`wc/store`, `wc/v3`...) from caching; it has no way to know a CUSTOM
 * namespace like `pph/v1` is cart data too; nothing told it not to cache
 * this one, so it applied its default "cache any GET that doesn't say
 * otherwise" behaviour.
 *
 * Fixed here, not per-endpoint: `rest_post_dispatch` fires for every REST
 * response right before WordPress sends it, so one filter, scoped to the
 * `pph/v1/cart` routes, guarantees no-cache headers on all six endpoints
 * (state/add/update/remove/save/saved-restore/saved-remove) without having
 * to remember to add this to each one individually, or to any new one added
 * later. Cache-Control/Pragma/Expires below are the same values WordPress
 * core's own `nocache_headers()` sends; the `X-LiteSpeed-Cache-Control:
 * no-cache` header is LiteSpeed's own documented origin-to-cache override,
 * read before LiteSpeed decides whether to cache a response at all - not a
 * workaround, the correct way for an app to tell its own host's cache "never
 * cache this", regardless of that cache's own auto-detection gaps.
 */
add_filter( 'rest_post_dispatch', 'pph_cart_rest_never_cache', 10, 3 );
function pph_cart_rest_never_cache( $response, $server, $request ) {
	if ( ! ( $response instanceof WP_REST_Response ) || 0 !== strpos( $request->get_route(), '/pph/v1/cart' ) ) {
		return $response;
	}
	/* Set via the response object, not a raw header() call - WP_REST_Server
	   sends these through its own send_headers() after every filter on this
	   hook has run, which is the documented, race-free way to add headers to
	   a REST response rather than racing WordPress's own header output. */
	$response->header( 'Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0' );
	$response->header( 'Pragma', 'no-cache' );
	$response->header( 'Expires', 'Wed, 11 Jan 1984 05:00:00 GMT' );
	$response->header( 'X-LiteSpeed-Cache-Control', 'no-cache' );
	return $response;
}

add_action( 'rest_api_init', 'pph_register_cart_routes' );
function pph_register_cart_routes() {
	register_rest_route(
		'pph/v1',
		'/cart',
		array(
			'methods'             => 'GET',
			'callback'            => 'pph_rest_cart_state',
			'permission_callback' => '__return_true',
		)
	);
	register_rest_route(
		'pph/v1',
		'/cart/add',
		array(
			'methods'             => 'POST',
			'callback'            => 'pph_rest_cart_add',
			'permission_callback' => '__return_true',
		)
	);
	register_rest_route(
		'pph/v1',
		'/cart/update',
		array(
			'methods'             => 'POST',
			'callback'            => 'pph_rest_cart_update',
			'permission_callback' => '__return_true',
		)
	);
	register_rest_route(
		'pph/v1',
		'/cart/remove',
		array(
			'methods'             => 'POST',
			'callback'            => 'pph_rest_cart_remove',
			'permission_callback' => '__return_true',
		)
	);

	/* Saved orders - "Save this order" on /cart/, restore/remove from the
	   account page's Saved orders section. See pph_get_saved_orders() below
	   for the storage shape. All three require a real account (the snapshot
	   is user meta), unlike add/update/remove above which work for guests too
	   - permission_callback checks is_user_logged_in() rather than __return_true. */
	register_rest_route(
		'pph/v1',
		'/cart/save',
		array(
			'methods'             => 'POST',
			'callback'            => 'pph_rest_cart_save',
			'permission_callback' => 'is_user_logged_in',
		)
	);
	register_rest_route(
		'pph/v1',
		'/cart/saved/restore',
		array(
			'methods'             => 'POST',
			'callback'            => 'pph_rest_saved_order_restore',
			'permission_callback' => 'is_user_logged_in',
		)
	);
	register_rest_route(
		'pph/v1',
		'/cart/saved/remove',
		array(
			'methods'             => 'POST',
			'callback'            => 'pph_rest_saved_order_remove',
			'permission_callback' => 'is_user_logged_in',
		)
	);
}

/**
 * Every mutating request must carry a valid WordPress REST nonce
 * (`X-WP-Nonce`), localised to the page as `PPH_CART.nonce`. The cart itself
 * is guest-accessible by design - that is how e-commerce carts work, and
 * WooCommerce's own session cookie is what ties a cart to a visitor - the
 * nonce only proves the request came from our own page, not a third-party
 * site forging a POST against a logged-in admin's session.
 */
function pph_check_cart_nonce( $request ) {
	$nonce = $request->get_header( 'X-WP-Nonce' );
	return $nonce && wp_verify_nonce( $nonce, 'wp_rest' );
}

/** The whole cart, as JSON + pre-rendered HTML fragments the JS drops in place. */
function pph_rest_cart_state() {
	return new WP_REST_Response( pph_cart_payload(), 200 );
}

function pph_rest_cart_add( $request ) {
	if ( ! pph_check_cart_nonce( $request ) ) {
		return new WP_REST_Response( array( 'message' => 'Bad nonce.' ), 403 );
	}

	$product_id   = absint( $request->get_param( 'productId' ) );
	$variation_id = absint( $request->get_param( 'variationId' ) );
	$quantity     = max( 1, absint( $request->get_param( 'quantity' ) ) );

	if ( ! $product_id ) {
		return new WP_REST_Response( array( 'message' => 'No product specified.' ), 400 );
	}

	$variation_attrs = array();
	if ( $variation_id ) {
		$variation = wc_get_product( $variation_id );
		if ( $variation ) {
			$variation_attrs = $variation->get_variation_attributes();
		}
	}

	$key = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation_attrs );

	if ( ! $key ) {
		/* WooCommerce already queued a notice explaining why (out of stock,
		   invalid variation, etc.) - surface it rather than a bare failure. */
		$notices = wc_get_notices( 'error' );
		wc_clear_notices();
		$message = $notices ? wp_strip_all_tags( $notices[0]['notice'] ) : 'Could not add that to your order.';
		return new WP_REST_Response( array( 'message' => $message ), 400 );
	}

	return new WP_REST_Response( pph_cart_payload(), 200 );
}

function pph_rest_cart_update( $request ) {
	if ( ! pph_check_cart_nonce( $request ) ) {
		return new WP_REST_Response( array( 'message' => 'Bad nonce.' ), 403 );
	}
	$key = sanitize_text_field( (string) $request->get_param( 'key' ) );
	$qty = max( 1, absint( $request->get_param( 'quantity' ) ) );

	if ( ! $key || ! isset( WC()->cart->get_cart()[ $key ] ) ) {
		return new WP_REST_Response( array( 'message' => 'That line is no longer in your order.' ), 404 );
	}
	WC()->cart->set_quantity( $key, $qty, true );

	return new WP_REST_Response( pph_cart_payload(), 200 );
}

function pph_rest_cart_remove( $request ) {
	if ( ! pph_check_cart_nonce( $request ) ) {
		return new WP_REST_Response( array( 'message' => 'Bad nonce.' ), 403 );
	}
	$key = sanitize_text_field( (string) $request->get_param( 'key' ) );
	if ( $key ) {
		WC()->cart->remove_cart_item( $key );
	}
	return new WP_REST_Response( pph_cart_payload(), 200 );
}

/**
 * Saved orders - "Save this order" on the static build's /cart/ page
 * (src/pages/commerce.js) faked this with a client-side toast and nothing
 * behind it (`data-toast="Order saved to your account"`, no real storage -
 * there was no account system for it to save to). This is the real version:
 * a snapshot of the current cart's product/variation/quantity lines, stored
 * as user meta against the signed-in account, restorable later from the
 * account page's Saved orders section (inc/account.php). Not a WooCommerce
 * order - no payment, no stock reservation, nothing WooCommerce Orders needs
 * to know about; it is exactly what the button says, a saved LIST to reorder
 * from, closer to a wishlist scoped to a whole cart at once than to a
 * purchase.
 *
 * Stored as one user meta value (`_pph_saved_orders`, a single serialized
 * array) rather than one row per saved order - the expected count per
 * customer is small (a handful, not hundreds), so this is simpler than a
 * custom table or a meta key per entry, and it reads/writes in one call
 * either way. Capped at 20 entries (oldest dropped) so nothing unbounded
 * accumulates for years on end.
 */
function pph_get_saved_orders( $user_id ) {
	$orders = get_user_meta( $user_id, '_pph_saved_orders', true );
	return is_array( $orders ) ? $orders : array();
}

function pph_set_saved_orders( $user_id, $orders ) {
	update_user_meta( $user_id, '_pph_saved_orders', array_slice( $orders, 0, 20 ) );
}

function pph_rest_cart_save( $request ) {
	if ( ! pph_check_cart_nonce( $request ) ) {
		return new WP_REST_Response( array( 'message' => 'Bad nonce.' ), 403 );
	}
	if ( WC()->cart->is_empty() ) {
		return new WP_REST_Response( array( 'message' => 'There is nothing in your order to save.' ), 400 );
	}

	$items = array();
	foreach ( WC()->cart->get_cart() as $item ) {
		$items[] = array(
			'product_id'   => (int) $item['product_id'],
			'variation_id' => (int) $item['variation_id'],
			'quantity'     => (int) $item['quantity'],
		);
	}

	$user_id = get_current_user_id();
	$orders  = pph_get_saved_orders( $user_id );
	array_unshift(
		$orders,
		array(
			'id'      => wp_generate_uuid4(),
			'created' => current_time( 'mysql' ),
			'items'   => $items,
		)
	);
	pph_set_saved_orders( $user_id, $orders );

	return new WP_REST_Response( array( 'message' => 'Order saved to your account.', 'count' => count( $items ) ), 200 );
}

/**
 * Adds every line from a saved order back into the live cart and returns the
 * same payload shape every other cart endpoint does, so cart.js's existing
 * applyState() updates the drawer/badge/page with no new client code. A
 * product deleted or unpublished since the order was saved is skipped rather
 * than failing the whole restore - `$added`/`$skipped` let the client say
 * so honestly instead of claiming everything came back.
 */
function pph_rest_saved_order_restore( $request ) {
	if ( ! pph_check_cart_nonce( $request ) ) {
		return new WP_REST_Response( array( 'message' => 'Bad nonce.' ), 403 );
	}
	$id      = sanitize_text_field( (string) $request->get_param( 'id' ) );
	$user_id = get_current_user_id();
	$orders  = pph_get_saved_orders( $user_id );
	$order   = null;
	foreach ( $orders as $o ) {
		if ( $o['id'] === $id ) {
			$order = $o;
			break;
		}
	}
	if ( ! $order ) {
		return new WP_REST_Response( array( 'message' => 'That saved order no longer exists.' ), 404 );
	}

	$added   = 0;
	$skipped = 0;
	foreach ( $order['items'] as $line ) {
		/* Same variation_attrs lookup pph_rest_cart_add() does above, for the
		   same reason - a variable product's cart item carries its chosen
		   attributes as line-item meta, which is what the size/lot shown on
		   the cart line and at checkout actually reads. */
		$variation_attrs = array();
		if ( $line['variation_id'] ) {
			$variation = wc_get_product( $line['variation_id'] );
			if ( $variation ) {
				$variation_attrs = $variation->get_variation_attributes();
			}
		}
		$key = WC()->cart->add_to_cart( $line['product_id'], max( 1, $line['quantity'] ), $line['variation_id'], $variation_attrs );
		if ( $key ) {
			++$added;
		} else {
			++$skipped;
			wc_clear_notices(); // a per-line failure notice would otherwise leak into the next real page render
		}
	}

	$payload            = pph_cart_payload();
	$payload['added']   = $added;
	$payload['skipped'] = $skipped;
	return new WP_REST_Response( $payload, 200 );
}

function pph_rest_saved_order_remove( $request ) {
	if ( ! pph_check_cart_nonce( $request ) ) {
		return new WP_REST_Response( array( 'message' => 'Bad nonce.' ), 403 );
	}
	$id      = sanitize_text_field( (string) $request->get_param( 'id' ) );
	$user_id = get_current_user_id();
	$orders  = array_values(
		array_filter(
			pph_get_saved_orders( $user_id ),
			function ( $o ) use ( $id ) {
				return $o['id'] !== $id;
			}
		)
	);
	pph_set_saved_orders( $user_id, $orders );

	return new WP_REST_Response( array( 'message' => 'Removed.' ), 200 );
}

/** Shared shape every endpoint above returns, so the client always re-renders from the same data. */
function pph_cart_payload() {
	WC()->cart->calculate_totals();
	return array(
		/* A page-cache plugin (LiteSpeed Cache, active on this host) serves
		   the same HTML - and the nonce wp_localize_script baked into it at
		   the time that page was cached - to every visitor who hits the
		   cache, not just the one whose request built it. cart.js's very
		   first call on every page load is the uncached GET this function
		   backs, before any user action; taking the nonce from THAT response
		   rather than trusting the one baked into HTML is what keeps
		   add-to-cart working for a cached visitor instead of silently
		   403-ing on their first click. REST API responses are not part of
		   what page-cache plugins cache. */
		'nonce'     => wp_create_nonce( 'wp_rest' ),
		'count'     => WC()->cart->get_cart_contents_count(),
		/* get_cart_subtotal() is WooCommerce's own pre-escaped HTML string -
		   already reflects the volume discount, since inc/pricing.php rewrites
		   each line's price before totals are calculated. */
		'subtotal'  => WC()->cart->get_cart_subtotal(),
		'linesHtml' => pph_render_cart_lines_html(),
		'rowsHtml'  => pph_render_cart_rows_html(),
		'isEmpty'   => WC()->cart->is_empty(),
	);
}

/**
 * A single line's shared facts, read once so the drawer and the full cart
 * page describe the same line the same way.
 */
function pph_cart_line_facts( $key, $item ) {
	$product      = $item['data'];
	$variation_id = ! empty( $item['variation_id'] ) ? $item['variation_id'] : 0;
	$size         = '';
	if ( $variation_id ) {
		$attrs = $product->get_variation_attributes();
		$size  = isset( $attrs['attribute_size'] ) ? $attrs['attribute_size'] : '';
	}
	$parent_id = $variation_id ? $product->get_parent_id() : $product->get_id();
	$lot       = $variation_id ? pph_m( $variation_id, 'lot' ) : '';
	$coa_link  = '';
	if ( $lot ) {
		$coa_posts = get_posts(
			array(
				'post_type'      => 'pph_coa',
				'posts_per_page' => 1,
				'meta_query'     => array( array( 'key' => '_pph_lot', 'value' => $lot ) ),
			)
		);
		if ( $coa_posts ) {
			$coa_link = get_permalink( $coa_posts[0] );
		}
	}

	return array(
		'key'        => $key,
		'name'       => $product->get_name(),
		'sku'        => $product->get_sku(),
		'size'       => $size,
		'lot'        => $lot,
		'coaLink'    => $coa_link,
		'qty'        => (int) $item['quantity'],
		'lineTotal'  => (float) $item['line_total'] + (float) $item['line_tax'],
		'permalink'  => get_permalink( $parent_id ),
		'imageId'    => get_post_thumbnail_id( $parent_id ),
		'volumeRate' => pph_volume_rate_for_qty( $item['quantity'] ),
	);
}

/** `.cart-line` rows - the drawer and the checkout order summary. */
function pph_render_cart_lines_html() {
	if ( WC()->cart->is_empty() ) {
		return '';
	}
	ob_start();
	foreach ( WC()->cart->get_cart() as $key => $item ) {
		$f = pph_cart_line_facts( $key, $item );
		?>
		<div class="cart-line" data-line="<?php echo esc_attr( $f['key'] ); ?>">
			<div class="cart-line__media"><?php echo wp_get_attachment_image( $f['imageId'], array( 80, 80 ) ); ?></div>
			<div>
				<div class="cart-line__name"><?php echo esc_html( $f['name'] ); ?></div>
				<div class="cart-line__meta">
					<?php echo esc_html( $f['size'] ); ?> vial &middot; <?php echo esc_html( $f['sku'] ); ?>
					<?php if ( $f['lot'] ) : ?> &middot; LOT <?php echo esc_html( $f['lot'] ); ?><?php endif; ?>
				</div>
				<div class="cart-line__meta">One-time purchase</div>
				<div class="cart-line__foot">
					<span class="mono small">Qty <?php echo (int) $f['qty']; ?></span>
					<span class="mono"><?php echo wc_price( $f['lineTotal'] ); ?></span>
				</div>
			</div>
		</div>
		<?php
	}
	return ob_get_clean();
}

/** `.cart-row` rows - the full /cart/ page, with its own qty stepper and remove button. */
function pph_render_cart_rows_html() {
	if ( WC()->cart->is_empty() ) {
		return '';
	}
	ob_start();
	foreach ( WC()->cart->get_cart() as $key => $item ) {
		$f = pph_cart_line_facts( $key, $item );
		?>
		<div class="cart-row" data-line="<?php echo esc_attr( $f['key'] ); ?>">
			<div class="cart-row__media"><?php echo wp_get_attachment_image( $f['imageId'], array( 120, 120 ) ); ?></div>
			<div class="cart-row__body">
				<h2 class="cart-row__name"><a href="<?php echo esc_url( $f['permalink'] ); ?>"><?php echo esc_html( $f['name'] ); ?></a></h2>
				<p class="cart-row__meta">
					<span class="mono"><?php echo esc_html( $f['sku'] ); ?></span> &middot; <?php echo esc_html( $f['size'] ); ?> vial
					<?php if ( $f['lot'] && $f['coaLink'] ) : ?>
						&middot; Lot <a class="link" href="<?php echo esc_url( $f['coaLink'] ); ?>"><?php echo esc_html( $f['lot'] ); ?></a>
					<?php elseif ( $f['lot'] ) : ?>
						&middot; Lot <?php echo esc_html( $f['lot'] ); ?>
					<?php endif; ?>
				</p>
				<p class="cart-row__meta">One-time purchase</p>
				<?php if ( $f['volumeRate'] > 0 ) : ?>
					<div class="volume-note">Volume pricing applied - <?php echo (int) $f['volumeRate']; ?>% off</div>
				<?php else : ?>
					<div class="cart-row__hint">Order 5 or more vials of this size for volume pricing</div>
				<?php endif; ?>
			</div>
			<div class="cart-row__actions">
				<div class="qty" data-qty-line="<?php echo esc_attr( $f['key'] ); ?>">
					<button type="button" aria-label="Decrease quantity" data-line-step="-1">&minus;</button>
					<input type="number" value="<?php echo (int) $f['qty']; ?>" min="1" max="999" aria-label="Quantity for <?php echo esc_attr( $f['name'] ); ?>">
					<button type="button" aria-label="Increase quantity" data-line-step="1">+</button>
				</div>
				<span class="cart-row__price"><?php echo wc_price( $f['lineTotal'] ); ?></span>
				<button class="btn-text" type="button" data-line-remove="<?php echo esc_attr( $f['key'] ); ?>">Remove</button>
			</div>
		</div>
		<?php
	}
	return ob_get_clean();
}
