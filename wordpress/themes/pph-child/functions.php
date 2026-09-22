<?php
/**
 * Purely Peptides Hub child theme.
 *
 * One stylesheet, five scripts, in the same order the static build loads them.
 * Everything else the site does lives in the pph-core plugin, not here, so a
 * theme change cannot take the client's content types with it.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cache-busting version from the file's own mtime. Hosts cache aggressively and
 * "did the new CSS actually deploy" is a question you will be asked.
 */
function pph_asset_version( $relative ) {
	$file = get_stylesheet_directory() . '/' . ltrim( $relative, '/' );
	return file_exists( $file ) ? (string) filemtime( $file ) : '0';
}

function pph_asset_uri( $relative ) {
	return get_stylesheet_directory_uri() . '/' . ltrim( $relative, '/' );
}

/**
 * Drop every Hello Elementor stylesheet.
 *
 * This is not tidying - it is required. assets/css/styles.css styles elements
 * called `.site-header`, `.site-footer` and `.site-main`, and those are Hello
 * Elementor's own class names too. Hello's rules land on our markup and give
 * the header and footer its container width instead of ours, and its link
 * colour - the pink.
 *
 * Nothing of Hello's is wanted. styles.css was written for a standalone static
 * site and carries its own reset, so it needs no parent stylesheet under it.
 *
 * Deregister as well as dequeue: a merely-dequeued handle gets pulled back in
 * if anything declares it as a dependency.
 */
add_action( 'wp_enqueue_scripts', 'pph_drop_parent_styles', 15 );
function pph_drop_parent_styles() {
	$styles = wp_styles();
	foreach ( array_values( $styles->queue ) as $handle ) {
		if ( 0 === strpos( $handle, 'hello-elementor' ) ) {
			wp_dequeue_style( $handle );
			wp_deregister_style( $handle );
		}
	}
}

/**
 * Drop Elementor's own PLUGIN styles - not the Hello Elementor theme, already
 * handled above - on the pages we know contain zero Elementor content:
 * WooCommerce's shop/category/product/cart/checkout/account pages, our own
 * CPT archives and singles, and the home page. Every element on those pages
 * comes from our own PHP templates; Elementor's framework CSS serves no
 * purpose there and is a live candidate for the same class of bug that
 * caused the earlier "site-header" collision with Hello Elementor -
 * Elementor's own frontend CSS defines broadly-named utility rules too, and
 * we have never checked which ones. Left fully intact everywhere else, since
 * the marketing pages built WITH Elementor still need it.
 *
 * Cart/checkout/account were missing from this list until now - both are
 * ordinary WP Pages rendered through page.php, which calls get_header() like
 * every other page, so Elementor's frontend CSS was loading there same as
 * anywhere else. It fought the real templates the same way it fought the
 * header before this was written: the checkout heading sitting hard against
 * the nav and body copy running edge-to-edge were Elementor's own container/
 * typography resets landing on `.wrap`, `h1`, `p`, unopposed since
 * woo-bridge.css only restyles WooCommerce's own class names, not Elementor's.
 */
add_action( 'wp_enqueue_scripts', 'pph_drop_elementor_on_owned_pages', 15 );
function pph_drop_elementor_on_owned_pages() {
	$owned = is_front_page()
		|| is_singular( 'pph_coa' ) || is_singular( 'pph_article' )
		|| is_post_type_archive( 'pph_coa' ) || is_post_type_archive( 'pph_article' );

	if ( function_exists( 'is_shop' ) ) {
		$owned = $owned || is_shop() || is_product() || is_product_category();
	}
	if ( function_exists( 'is_cart' ) ) {
		$owned = $owned || is_cart() || is_checkout() || is_account_page();
	}

	if ( ! $owned ) {
		return;
	}

	$styles = wp_styles();
	foreach ( array_values( $styles->queue ) as $handle ) {
		if ( 0 === strpos( $handle, 'elementor' ) ) {
			wp_dequeue_style( $handle );
			wp_deregister_style( $handle );
		}
	}
}

/**
 * Cart/checkout/account must never be page-cached - each one shows a
 * different, live thing per visitor (their own cart contents, their own
 * order form, their own account), and LiteSpeed Cache (this host's default,
 * confirmed active - see PROGRESS.md's Gotchas) page-caches everything by
 * default unless told otherwise. Symptom when it slips through: an item
 * added from anywhere else on the site (the drawer, a card's Add button -
 * all AJAX, never touching this cache) is real in the session immediately,
 * but navigating to a fresh /cart/ or /checkout/ page load shows whatever
 * HTML was cached from an earlier visit - often an empty cart - because the
 * request never reached WordPress at all; LiteSpeed served the cached copy
 * straight back.
 *
 * PROGRESS.md documents a manual fix for this (a per-page "Disable Cache"
 * toggle in Pages -> Cart/Checkout/My account -> the LiteSpeed panel), but a
 * manual, per-page, easy-to-forget-or-lose-on-a-resave toggle is exactly the
 * kind of thing that should not be the ONLY thing standing between this bug
 * and every visitor - hence this, a code-level guarantee that holds
 * regardless of whether that toggle is set, ever gets reset, or a future
 * page (My Account's sub-endpoints - orders, addresses...) is added without
 * anyone remembering to toggle it too.
 *
 * `nocache_headers()` is WordPress core's own standard "do not cache this
 * response" headers (Cache-Control/Pragma/Expires). The X-LiteSpeed-Cache-
 * Control header is LiteSpeed's own documented way for an origin app to tell
 * its cache "skip this response", read before LiteSpeed ever considers
 * caching it - not a workaround, the same mechanism WooCommerce's own
 * LiteSpeed integration class uses internally for these exact three page
 * types. Belt-and-braces with the wp-admin toggle, not a replacement for
 * checking it is also set (see PROGRESS.md) - two independent reasons this
 * cannot get re-cached is better than relying on either alone.
 */
add_action( 'template_redirect', 'pph_never_cache_dynamic_pages' );
function pph_never_cache_dynamic_pages() {
	$dynamic = ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) );
	if ( ! $dynamic ) {
		return;
	}
	nocache_headers();
	if ( ! headers_sent() ) {
		header( 'X-LiteSpeed-Cache-Control: no-cache' );
	}
}

/**
 * WooCommerce ships its own default frontend stylesheet (layout, general,
 * smallscreen) on every Woo page, cart/checkout/account included. It was
 * never dequeued, so it has been fighting woo-bridge.css for specificity the
 * whole time checkout "still looked like plain WooCommerce" - that default
 * stylesheet's own grey buttons, table borders and col2-set layout were
 * still winning in places woo-bridge.css did not out-specify them. Every
 * page that needs Woo's markup at all (checkout, account) now has a fully
 * templated, site-styled replacement for it; nothing on the site needs Woo's
 * own CSS. This is WooCommerce's own documented opt-out, not a hack.
 */
add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );

add_action( 'wp_enqueue_scripts', 'pph_enqueue_assets', 20 );
function pph_enqueue_assets() {

	/* TODO(phase 14): self-host Rokkitt and Noto Sans, drop this, and switch
	   Elementor's own Google Fonts loading off. Kept for now so the rendered
	   page is identical to the static build we are porting. */
	wp_enqueue_style(
		'pph-fonts',
		'https://fonts.googleapis.com/css2?family=Rokkitt:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap',
		array(),
		null
	);

	/* No dependencies on purpose - see pph_drop_parent_styles() above. Naming a
	   parent handle here would re-enqueue the stylesheet we just removed. */
	wp_enqueue_style(
		'pph-styles',
		pph_asset_uri( 'assets/css/styles.css' ),
		array(),
		pph_asset_version( 'assets/css/styles.css' )
	);

	/* Checkout (and My Account, whenever it stops being a deliberately
	   deferred default) render through WooCommerce's own bundled templates -
	   see inc/checkout.php's header for why that markup is not rewritten.
	   This restyles Woo's own class names to match everywhere else, without
	   touching the template itself. Not needed elsewhere: every other page on
	   the site already has a fully custom template. */
	if ( function_exists( 'is_checkout' ) && ( is_checkout() || is_account_page() ) ) {
		wp_enqueue_style(
			'pph-woo-bridge',
			pph_asset_uri( 'assets/css/woo-bridge.css' ),
			array( 'pph-styles' ),
			pph_asset_version( 'assets/css/woo-bridge.css' )
		);
	}

	/* Load order matters: catalogue defines window.PP_CATALOGUE, which store.js
	   and catalog.js both read. cart.js owns the real WooCommerce cart and must
	   load before woo.js, which only handles the product-page size picker.
	   script.js must bind its own handlers before woo.js touches its markup. */
	$scripts  = array( 'store', 'script', 'catalog', 'forms', 'woo', 'cart' );
	$previous = 'pph-catalogue';

	/* catalogue.js is no longer a static file - see inc/catalogue.php. A
	   plugin-generated site can change its product data without a rebuild, so
	   a build-time-only file would go stale the first time someone edits a
	   price in wp-admin. `false` for $src registers a handle with nothing to
	   fetch; the actual content is attached below via wp_add_inline_script(). */
	wp_register_script( 'pph-catalogue', false, array(), null, true );
	wp_enqueue_script( 'pph-catalogue' );
	if ( function_exists( 'pph_catalogue_js' ) ) {
		wp_add_inline_script( 'pph-catalogue', pph_catalogue_js() );
	}
	if ( function_exists( 'pph_suggest_js' ) ) {
		wp_add_inline_script( 'pph-catalogue', pph_suggest_js() );
	}

	foreach ( $scripts as $name ) {
		$handle = 'pph-' . $name;
		$path   = 'assets/js/' . $name . '.js';

		wp_enqueue_script(
			$handle,
			pph_asset_uri( $path ),
			array( $previous ),
			pph_asset_version( $path ),
			true
		);
		wp_script_add_data( $handle, 'strategy', 'defer' );

		if ( 'pph-cart' === $handle ) {
			wp_localize_script(
				$handle,
				'PPH_CART',
				array(
					'restUrl' => esc_url_raw( rest_url( 'pph/v1/' ) ),
					'nonce'   => wp_create_nonce( 'wp_rest' ),
				)
			);
		}

		$previous = $handle;
	}
}

/**
 * Head tags the static build carried that Yoast does not own.
 * Title, description, canonical and Open Graph are Yoast's - do not add them here.
 */
add_action( 'wp_head', 'pph_head_tags', 2 );
function pph_head_tags() {
	echo '<meta name="theme-color" content="#051214">' . "\n";
	printf( '<link rel="icon" type="image/png" href="%s">' . "\n", esc_url( pph_asset_uri( 'assets/img/brand/favicon.png' ) ) );
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}

/* Hello Elementor's own header, footer and page title are not disabled here
   because they cannot run: header.php, footer.php, page.php, index.php,
   front-page.php and 404.php are all overridden in this theme. The one thing
   that CAN still replace them is an Elementor Pro Theme Builder header or
   footer - so do not create one. */
