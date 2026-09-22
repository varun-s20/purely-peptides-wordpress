<?php
/**
 * "Billing" fieldset - WooCommerce's real "ship to a different address"
 * toggle, kept under its stock id/name/class (checkout.js shows/hides
 * `.shipping_address` off `#ship-to-different-address-checkbox` by exact
 * selector - do not rename either), restyled with the site's fieldset/field
 * classes. Only fires at all when WC()->cart->needs_shipping() - see
 * woocommerce_checkout_shipping().
 */

defined( 'ABSPATH' ) || exit;
?>
<fieldset class="fieldset">
	<legend><?php esc_html_e( 'Billing', 'woocommerce' ); ?></legend>
	<label class="check">
		<input type="checkbox" id="ship-to-different-address-checkbox" class="input-checkbox" name="ship_to_different_address" value="1"
			<?php checked( apply_filters( 'woocommerce_ship_to_different_address_checked', 'shipping' === get_option( 'woocommerce_ship_to_destination' ) ? 1 : 0, $checkout ), 1 ); ?>>
		<span><?php esc_html_e( 'My billing address is different from the shipping address above', 'woocommerce' ); ?></span>
	</label>

	<div class="shipping_address" style="margin-top:16px">
		<?php do_action( 'woocommerce_before_checkout_shipping_form', $checkout ); ?>
		<div class="form-grid">
			<?php
			foreach ( $checkout->get_checkout_fields( 'shipping' ) as $key => $field ) {
				pph_render_checkout_field( $key, $field, $checkout->get_value( $key ) );
			}
			?>
		</div>
		<?php do_action( 'woocommerce_after_checkout_shipping_form', $checkout ); ?>
	</div>
</fieldset>
