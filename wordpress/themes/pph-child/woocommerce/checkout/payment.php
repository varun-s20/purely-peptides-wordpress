<?php
/**
 * Payment methods + acknowledgements + Place Order - loaded by WooCommerce's
 * own woocommerce_checkout_payment(). #payment / #place_order / the nonce field
 * are WooCommerce's own ids - its JS and the order-processing handler both
 * depend on them and nothing here renames any of them. Gateway box markup
 * (ul.wc_payment_methods, div.payment_box) is Woo's own template one level down
 * (checkout/payment-method.php) - restyled via woo-bridge.css, not rewritten,
 * since gateway plugins render their own fields into it.
 *
 * THE ROOT ELEMENT OF THIS TEMPLATE MUST BE THE .woocommerce-checkout-payment
 * ELEMENT, AND EVERYTHING THIS TEMPLATE OUTPUTS MUST SIT INSIDE IT.
 * WC_AJAX::update_order_review() re-renders this whole template and hands it to
 * checkout.js as the fragment keyed '.woocommerce-checkout-payment'; checkout.js
 * does $( key ).replaceWith( value ). If that class sits on an inner element -
 * or if anything (the acknowledgements fieldset, the Place Order block) sits
 * outside it - then the first refresh, which fires on page load, replaces the
 * inner element with the entire template and leaves every outside section behind
 * as a visible duplicate. That was the "checkout shows the same things twice"
 * bug; do not split this template's output across that element's boundary again.
 *
 * Woo's own woocommerce_checkout_order_review hook for this callback is removed
 * in pph-core/inc/checkout.php so this renders in the main column, below the
 * address fieldsets, the way the static design has it - not inside the
 * order-summary aside. The fragment swap above is selector-based, so where this
 * sits in the DOM does not matter to it.
 */

defined( 'ABSPATH' ) || exit;

if ( ! WC()->cart->needs_payment() ) {
	WC()->checkout()->process_checkout();
	return;
}

$available_gateways = WC()->payment_gateways()->get_available_payment_gateways();
WC()->payment_gateways()->set_current_gateway( $available_gateways );

/* The three required acknowledgements, in the 'order' checkout-fields group
   alongside pph_research_field (already rendered in form-billing.php) - see
   inc/checkout.php's pph_add_acknowledgement_fields(). Rendered here, right
   before Place Order, matching the static design. */
$order_fields = $checkout->get_checkout_fields( 'order' );
unset( $order_fields['pph_research_field'], $order_fields['order_comments'] );
?>
<div id="payment" class="woocommerce-checkout-payment">

	<fieldset class="fieldset">
		<legend>Payment - ACH / e-check</legend>
		<?php if ( $available_gateways ) : ?>
			<ul class="wc_payment_methods payment_methods methods">
				<?php foreach ( $available_gateways as $gateway ) : ?>
					<?php wc_get_template( 'checkout/payment-method.php', array( 'gateway' => $gateway ) ); ?>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<div class="notice notice--warn">
				<?php echo pph_icon( 'alert' ); ?>
				<div><?php echo apply_filters( 'woocommerce_no_available_payment_methods_message', WC()->customer->get_billing_country() ? esc_html__( 'Sorry, it seems that there are no available payment methods for your state. Please contact us if you require assistance or wish to make alternate arrangements.', 'woocommerce' ) : esc_html__( 'Please fill in your details above to see available payment methods.', 'woocommerce' ) ); ?></div>
			</div>
		<?php endif; ?>
	</fieldset>

	<fieldset class="fieldset">
		<legend>Required acknowledgements</legend>
		<?php foreach ( $order_fields as $key => $field ) : ?>
			<?php pph_render_checkout_field( $key, $field, $checkout->get_value( $key ) ); ?>
		<?php endforeach; ?>
	</fieldset>

	<?php /* No `form-row` class here on purpose - woo-bridge.css restyles
	         `.woocommerce form .form-row label` for Woo's own default markup,
	         which would then hit the terms checkbox label inside this block. */ ?>
	<div class="place-order">
		<?php wc_get_template( 'checkout/terms.php' ); ?>

		<?php do_action( 'woocommerce_review_order_before_submit' ); ?>

		<?php
		/* "Place Order - $total", the way the static design's button reads.
		   WC()->cart->get_total() is already a formatted price string.
		   value/data-value carry the SAME label as plain text, not just
		   "Place order": WooCommerce's own scripts restore a button's label
		   from data-value after blocking it, and a shorter data-value would
		   quietly drop the total off the button the first time that happened.
		   Nothing reads the submitted value itself - the checkout handler only
		   tests that woocommerce_checkout_place_order is set. */
		/* data-region-gated - script.js's applyRegion() disables every element
		   carrying this attribute for a restricted destination state (CA/NY/LA).
		   It was already wired onto the cart-drawer's own checkout link, but not
		   onto this button - the only other real path to placing an order, and
		   the one that actually submits it - so a restricted-state visitor who
		   reached /checkout/ (any way other than the drawer link) hit no gate
		   at all. See cart/cart.php's identical fix for its own "Proceed to
		   checkout" link. */
		$pph_order_button_text = apply_filters( 'woocommerce_order_button_text', __( 'Place order', 'woocommerce' ) );
		$pph_order_total       = wp_strip_all_tags( WC()->cart->get_total() );
		$pph_order_button_full = $pph_order_button_text . ' - ' . $pph_order_total;
		echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			'woocommerce_order_button_html',
			sprintf(
				'<button type="submit" class="btn btn--primary btn--lg btn--block" name="woocommerce_checkout_place_order" id="place_order" value="%1$s" data-value="%1$s" data-region-gated>%2$s - <span class="num">%3$s</span></button>',
				esc_attr( $pph_order_button_full ),
				esc_html( $pph_order_button_text ),
				esc_html( $pph_order_total )
			)
		);
		?>

		<?php do_action( 'woocommerce_review_order_after_submit' ); ?>

		<p class="small muted center" style="margin-top:16px">You will receive an order confirmation by email. Certificates for each documented lot appear in your account once the order is despatched.</p>

		<?php wp_nonce_field( 'woocommerce-process_checkout', 'woocommerce-process-checkout-nonce' ); ?>
	</div>

</div>
