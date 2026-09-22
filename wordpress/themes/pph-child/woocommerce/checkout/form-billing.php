<?php
/**
 * "Your research account" - WooCommerce's billing fields, its account
 * (password) fields, and our own research-field custom field, drawn as one
 * fieldset with pph_render_checkout_field() instead of Woo's own
 * woocommerce-billing-fields / create-account markup. Same field keys, same
 * $checkout->get_value()/get_checkout_fields() data, same
 * is_registration_enabled() gate Woo's stock template uses for the password
 * fields - only the HTML changed.
 */

defined( 'ABSPATH' ) || exit;

$fields        = $checkout->get_checkout_fields( 'billing' );
$account_field = $checkout->get_checkout_fields( 'account' );
$research      = isset( $checkout->get_checkout_fields( 'order' )['pph_research_field'] )
	? array( 'pph_research_field' => $checkout->get_checkout_fields( 'order' )['pph_research_field'] )
	: array();

/* Full name from first/last, company, research field last - matches the
   static design's field order without needing two separate name inputs
   side by side to look intentional. */
$order = array( 'billing_email' );
if ( $account_field ) {
	$order = array_merge( $order, array_keys( $account_field ) );
}
$order = array_merge( $order, array( 'billing_first_name', 'billing_last_name', 'billing_company' ), array_keys( $research ) );

$all = array_merge( $fields, $account_field, $research );
?>
<fieldset class="fieldset">
	<legend>Your research account</legend>
	<div class="form-grid">
		<?php
		foreach ( $order as $key ) {
			if ( ! isset( $all[ $key ] ) ) {
				continue;
			}
			pph_render_checkout_field( $key, $all[ $key ], $checkout->get_value( $key ) );
		}
		?>
	</div>
</fieldset>

<fieldset class="fieldset">
	<legend><?php echo ( WC()->cart->needs_shipping() && WC()->cart->show_shipping() ) ? esc_html__( 'Shipping address', 'woocommerce' ) : esc_html__( 'Address', 'woocommerce' ); ?></legend>
	<div class="form-grid">
		<?php
		/* No visible Country field, matching the static design - this store
		   sells to a single country (WooCommerce > Settings > General >
		   "Selling location(s)"), so WC_Customer defaults billing_country to
		   it without the customer needing to pick anything. If that setting
		   is ever widened to more than one country, add billing_country back
		   into this list; pph_render_checkout_field() already knows how to
		   draw it (see inc/checkout.php). */
		foreach ( array( 'billing_address_1', 'billing_address_2', 'billing_city', 'billing_state', 'billing_postcode', 'billing_phone' ) as $key ) {
			if ( ! isset( $fields[ $key ] ) ) {
				continue;
			}
			pph_render_checkout_field( $key, $fields[ $key ], $checkout->get_value( $key ) );
		}
		?>
	</div>
</fieldset>
