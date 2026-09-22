<?php
/**
 * Checkout layout - markup only, restyled to the static design's real
 * .wrap.checkout / .fieldset / .checkout__summary classes. Every hook below
 * is the same one WooCommerce's own stock template fires in the same order;
 * removing any of them would break something real (the "must be logged in"
 * gate, the coupon form, order-review AJAX, a plugin hooked onto one of
 * these actions elsewhere in this build - see inc/checkout.php). Only the
 * wrapping HTML changed.
 *
 * See inc/checkout.php's file header for why the checkout ENGINE (this
 * form's action, its field data, validation, order creation) is untouched.
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_checkout_form', $checkout );

/* If checkout registration is disabled and not logged in, the user cannot checkout. */
if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
	echo '<div class="wrap"><p>' . esc_html( apply_filters( 'woocommerce_checkout_must_be_logged_in_message', __( 'You must be logged in to checkout.', 'woocommerce' ) ) ) . '</p></div>';
	return;
}
?>

<div class="wrap" style="padding-block:24px;border-bottom:1px solid var(--rule)">
	<div class="row" style="justify-content:space-between">
		<h1 style="font-size:var(--t-h3)"><?php esc_html_e( 'Checkout', 'woocommerce' ); ?></h1>
		<span class="row" style="gap:8px;font-size:var(--t-micro);color:var(--slate)"><?php echo pph_icon( 'lock' ); ?> Secure checkout</span>
	</div>
</div>

<?php
/* Unhooked off woocommerce_before_checkout_form in inc/checkout.php - see
   pph_move_coupon_form() there for why. Sibling to the checkout <form> below,
   never nested inside it - the same structural spot WooCommerce itself
   renders it in, just after our own heading instead of before it. */
woocommerce_checkout_coupon_form();
?>

<form name="checkout" method="post" class="wrap checkout woocommerce-checkout" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data">

	<div>
		<?php if ( is_user_logged_in() ) : ?>
			<div class="notice notice--accent" style="margin-bottom:28px">
				<?php echo pph_icon( 'user' ); ?>
				<div>Signed in as <strong><?php echo esc_html( wp_get_current_user()->user_email ); ?></strong>. Order history and lot documentation stay attached to this account.</div>
			</div>
		<?php else : ?>
			<div class="notice notice--accent" style="margin-bottom:28px">
				<?php echo pph_icon( 'user' ); ?>
				<div>
					<strong>An account is required to order.</strong> We do not offer guest checkout. Orders are
					released only to identified research accounts, and your order history and lot documentation
					stay attached to that account. Already registered?
					<a class="link" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">Sign in</a> and these details are filled in for you.
				</div>
			</div>
		<?php endif; ?>

		<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>
		<?php do_action( 'woocommerce_checkout_billing' ); ?>
		<?php do_action( 'woocommerce_checkout_shipping' ); ?>
		<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>

		<?php
		/* Payment + acknowledgements + Place Order, in the MAIN column, below the
		   address fieldsets - the static design's order. WooCommerce's own
		   callback is unhooked from woocommerce_checkout_order_review in
		   pph-core/inc/checkout.php so it does not also render inside the summary
		   aside below. Calling it here is safe: WC_AJAX::update_order_review()
		   invokes woocommerce_checkout_payment() directly, not through that hook,
		   and checkout.js swaps the result in by the .woocommerce-checkout-payment
		   selector, so where it sits in the DOM does not matter. */
		woocommerce_checkout_payment();
		?>
	</div>

	<aside class="checkout__summary">
		<h2>Order summary</h2>
		<div id="order_review" class="woocommerce-checkout-review-order">
			<?php do_action( 'woocommerce_checkout_order_review' ); ?>
		</div>
	</aside>

</form>

<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
