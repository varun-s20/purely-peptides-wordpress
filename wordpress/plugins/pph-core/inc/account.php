<?php
/**
 * My Account additions - the wishlist and saved-orders sections.
 *
 * The wishlist ITSELF needed no new work: public/js/store.js is real,
 * localStorage-backed, client-only logic that already runs site-wide - the
 * heart toggle on every product and catalogue card already saves to it. What
 * was missing was a landing page for it to render into: header.php's
 * "Wishlist" link already points at wc_get_page_permalink('myaccount') .
 * '#wishlist' (see tools/export-wp-theme.js's fixAccountLinks()), but nothing
 * on the account page carried the `[data-wish-list]` / `[data-wish-empty]`
 * containers store.js's renderWishlist() looks for, so the link landed on a
 * page with no matching section at all.
 *
 * Hooked onto woocommerce_account_dashboard - WooCommerce's own extension
 * point for the account OVERVIEW page content - rather than overriding
 * myaccount/dashboard.php. This adds to WooCommerce's own dashboard instead
 * of replacing it: the real "Hello <name> (not you? Log out)" greeting and
 * its real links to orders/addresses/account details stay exactly as
 * WooCommerce renders them, with nothing of that core markup reproduced here
 * to drift out of step with a future WooCommerce update. Priority 20 runs
 * this after WooCommerce's own callback (default priority 10), so the
 * wishlist section appears below the dashboard intro, matching where it sits
 * in the static design (src/pages/account.js's dashboard()).
 *
 * The account page as a whole is still WooCommerce's default template and
 * layout otherwise (the "Explicitly deferred" restyle noted in PROGRESS.md) -
 * this adds the one section that was an actual missing feature, not a
 * restyle of everything else on the page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'woocommerce_account_dashboard', 'pph_account_wishlist_section', 20 );
function pph_account_wishlist_section() {
	?>
	<section id="wishlist" style="margin-top:48px">
		<div class="section-head">
			<div class="section-head__text">
				<h2>Wishlist</h2>
				<p>Materials you have saved. Kept in this browser, so it survives a reload without needing an
				account - but is not shared between devices.</p>
			</div>
		</div>
		<div class="wishlist" data-wish-list></div>
		<div class="empty" data-wish-empty hidden>
			<?php echo pph_icon( 'heart' ); ?>
			<h3>Nothing saved yet</h3>
			<p>Use the heart on any product to keep it here for later.</p>
			<a class="btn btn--secondary" href="<?php echo esc_url( home_url( '/products/' ) ); ?>">Browse the catalogue</a>
		</div>
	</section>
	<?php
}

/**
 * Saved orders - real storage behind the /cart/ page's "Save this order"
 * button (inc/cart-api.php's pph_get_saved_orders() / the REST endpoints).
 * Server-rendered, not JS-rendered like the wishlist above - this data is
 * real per-account state (user meta), not a client-only localStorage list,
 * so there is nothing to hydrate: it is simply whatever this request already
 * has. "Add to cart" / "Remove" still go through cart.js's REST calls
 * (`[data-saved-restore]` / `[data-saved-remove]`) so the cart drawer/badge
 * update immediately without a page reload.
 */
add_action( 'woocommerce_account_dashboard', 'pph_account_saved_orders_section', 21 );
function pph_account_saved_orders_section() {
	$orders = pph_get_saved_orders( get_current_user_id() );
	?>
	<section id="saved-orders" style="margin-top:48px">
		<div class="section-head">
			<div class="section-head__text">
				<h2>Saved orders</h2>
				<p>Carts you saved from the order page for reordering later. Adding one to your cart does not
				place an order by itself.</p>
			</div>
		</div>
		<?php if ( ! $orders ) : ?>
			<div class="empty">
				<?php echo pph_icon( 'box' ); ?>
				<h3>Nothing saved yet</h3>
				<p>Use "Save this order" on your cart page to keep a copy here for later.</p>
				<a class="btn btn--secondary" href="<?php echo esc_url( home_url( '/cart/' ) ); ?>">View your cart</a>
			</div>
		<?php else : ?>
			<div class="grid grid-2" style="gap:16px">
				<?php foreach ( $orders as $order ) : ?>
					<?php
					$lines = array();
					foreach ( $order['items'] as $line ) {
						$product = wc_get_product( $line['variation_id'] ? $line['variation_id'] : $line['product_id'] );
						if ( $product ) {
							/* esc_html() per piece, not on the joined string below - the
							   joined string already carries the raw &times; entity, and
							   esc_html()-ing that too would double-encode it into the
							   literal text "&times;" instead of the × it is meant to
							   render as. */
							$lines[] = esc_html( $product->get_name() ) . ' &times; ' . (int) $line['quantity'];
						}
					}
					if ( ! $lines ) {
						continue; // every product in this saved order has since been deleted or unpublished
					}
					?>
					<article class="card" style="padding:20px" data-saved-order data-saved-order-id="<?php echo esc_attr( $order['id'] ); ?>">
						<span class="label"><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $order['created'] ) ) ); ?></span>
						<p class="small muted" style="margin-top:8px"><?php echo implode( ', ', $lines ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each $lines entry already escaped above ?></p>
						<div class="row" style="gap:16px;margin-top:16px">
							<button class="btn btn--secondary btn--sm" type="button" data-saved-restore="<?php echo esc_attr( $order['id'] ); ?>">Add to cart</button>
							<button class="btn-text" type="button" data-saved-remove="<?php echo esc_attr( $order['id'] ); ?>">Remove</button>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>
	<?php
}
