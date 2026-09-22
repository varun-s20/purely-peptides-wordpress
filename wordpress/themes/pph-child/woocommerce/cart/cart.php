<?php
/**
 * The real order/cart page.
 *
 * Ported from src/pages/commerce.js cart(). The rows are server-rendered on
 * load (pph_render_cart_rows_html(), the real WooCommerce cart) and re-render
 * after every change through cart.js - the same split as everywhere else in
 * this build: markup matches the static design exactly, the data behind it is
 * real.
 *
 * The shipping/tax estimate box from the static design (destination picker,
 * a client-side guess at shipping and tax) is NOT ported. WooCommerce
 * calculates real shipping and tax once a zone and a rate table exist
 * (phase 11, blocked on the client's real rates and nexus states) - showing a
 * fake estimate next to a cart that is otherwise entirely real numbers would
 * undercut the one thing this page is for.
 *
 * NO get_header() / get_footer() HERE - unlike the Woo templates that own a
 * whole page (archive-product.php, single-product.php), the Cart page is an
 * ordinary WordPress Page whose content is the [woocommerce_cart] shortcode.
 * That shortcode runs during the_content(), which is already inside our
 * theme's own header/footer call - this file is a partial, the same as
 * content-single-product.php, not a full-page template. Adding them here
 * would nest a second <html>/<head>/<body> mid-page, which is what actually
 * broke this page's layout the first time - not a missing stylesheet.
 */

defined( 'ABSPATH' ) || exit;

if ( ! WC()->cart ) {
	wc_load_cart();
}
WC()->cart->calculate_totals();

$is_empty = WC()->cart->is_empty();
$related  = wc_get_products( array( 'limit' => 3, 'status' => 'publish', 'orderby' => 'rand' ) );

echo pph_crumbs( array(
	array( 'label' => 'Home', 'href' => home_url( '/' ) ),
	array( 'label' => 'Order' ),
) );
?>

<div class="pagehead">
	<div class="wrap">
		<h1>Your order</h1>
		<p data-cart-summaryline><?php echo $is_empty ? 'Nothing in your order yet.' : 'Documentation for each lot is attached automatically.'; ?></p>
	</div>
</div>

<div class="wrap cart">
	<div>
		<div data-cart-rows><?php echo pph_render_cart_rows_html(); ?></div>

		<div class="empty" data-cart-empty <?php echo $is_empty ? '' : 'hidden'; ?>>
			<?php echo pph_icon( 'cart' ); ?>
			<h2>Your order is empty</h2>
			<p>Nothing has been added yet. Every material you add arrives with the analytical record for the lot that ships.</p>
			<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/products/' ) ); ?>">Browse the catalogue</a>
		</div>

		<div class="notice notice--warn" style="margin-top:24px">
			<?php echo pph_icon( 'flask' ); ?>
			<div><strong><?php echo esc_html( pph_locked_disclaimers()['product'] ); ?></strong> They are not intended for human dosing,
			injection, or ingestion, and may not be resold for any such purpose.</div>
		</div>

		<div class="row" style="justify-content:space-between;margin-top:24px">
			<a class="link-arrow" href="<?php echo esc_url( home_url( '/products/' ) ); ?>"><?php echo pph_icon( 'arrow' ); ?><span>Continue browsing the catalogue</span></a>
			<?php
			/* "Save this order" - real (inc/cart-api.php's /cart/save), unlike the
			   static build's fake toast-only version. Needs a real account to save
			   against, so it only renders as a working button when one exists;
			   a guest sees where to get one instead of a button that would just
			   403. Hidden entirely when the cart is empty - nothing to save. */
			if ( ! $is_empty ) :
				if ( is_user_logged_in() ) :
					?>
					<button class="btn btn--secondary btn--sm" type="button" data-save-order>Save this order</button>
					<?php
				else :
					?>
					<a class="btn-text" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">Sign in to save this order</a>
					<?php
				endif;
			endif;
			?>
		</div>

		<?php if ( $related ) : ?>
			<section style="margin-top:64px">
				<div class="section-head" data-reveal>
					<div class="section-head__text"><h2>Frequently ordered together</h2></div>
				</div>
				<div class="grid grid-3">
					<?php foreach ( $related as $p ) : echo pph_product_card( $p ); endforeach; ?>
				</div>
			</section>
		<?php endif; ?>
	</div>

	<aside class="checkout__summary" <?php echo $is_empty ? 'hidden' : ''; ?>>
		<h2>Order summary</h2>
		<div class="checkout__totals" style="background:var(--paper);border-top:0">
			<div class="trow"><span>Subtotal</span><span class="num" data-cart-subtotal><?php echo WC()->cart->get_cart_subtotal(); ?></span></div>
			<p class="small muted" style="margin-top:4px">Shipping and tax are calculated at checkout, once a delivery address is entered.</p>
			<?php /* data-region-gated - script.js's applyRegion() disables every element carrying this
			         attribute when the stored destination is a restricted state (CA/NY/LA). This is the
			         compliance gate footer.php's own region modal describes as "blocks checkout rather
			         than failing after payment" - it was only ever wired onto the cart-DRAWER's own
			         checkout link, never this page's. A restricted-state visitor who reached /cart/
			         directly (never opened the drawer) hit no gate at all. */ ?>
			<a class="btn btn--primary btn--block btn--lg" style="margin-top:20px" href="<?php echo esc_url( wc_get_checkout_url() ); ?>" data-region-gated>Proceed to checkout</a>
			<p class="small muted center" style="margin-top:10px">A research account is required to complete an order.</p>
			<ul class="pdp__assur" style="list-style:none;padding:0;margin-top:20px">
				<li><?php echo pph_icon( 'truck' ); ?>Tracked despatch and order tracking</li>
				<li><?php echo pph_icon( 'doc' ); ?>Lot documentation retained in your account</li>
			</ul>
		</div>
	</aside>
</div>
