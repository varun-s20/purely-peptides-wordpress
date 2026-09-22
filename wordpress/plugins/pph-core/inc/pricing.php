<?php
/**
 * Volume pricing.
 *
 * The product page prints a volume ladder ("5-9 vials -8%, 10+ -16%"). This
 * makes that arithmetic true at checkout instead of decorative: without it the
 * page would quote a discount the cart never applies, which is a pricing
 * misrepresentation rather than a cosmetic gap - and precisely the kind of
 * thing an AllayPay underwriting review looks for.
 *
 * Rates come from PPH Settings, so the client can change them without a
 * developer, and the page and the cart always read the same numbers.
 *
 * NOT the subscription discount. That one needs a real subscription engine
 * (phase 9, blocked on AllayPay confirming tokenisation), so Subscribe & Save
 * renders disabled on the product page until it exists - see
 * pph_render_purchase_box().
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The discount rate, as a percentage, for a given line quantity.
 * Tier boundaries (5 and 10) mirror the ladder the product page prints.
 */
function pph_volume_rate_for_qty( $qty ) {
	$qty = (int) $qty;
	if ( $qty >= 10 ) {
		return (float) pph_setting( 'volume_discount_10' );
	}
	if ( $qty >= 5 ) {
		return (float) pph_setting( 'volume_discount_5' );
	}
	return 0.0;
}

add_action( 'woocommerce_before_calculate_totals', 'pph_apply_volume_pricing', 20 );
function pph_apply_volume_pricing( $cart ) {
	if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
		return;
	}

	/* WooCommerce can fire this more than once per request; recalculating from
	   the regular price each time keeps it idempotent either way, but there is
	   no reason to do the work twice. */
	if ( did_action( 'woocommerce_before_calculate_totals' ) >= 2 ) {
		return;
	}

	foreach ( $cart->get_cart() as $item ) {
		if ( empty( $item['data'] ) ) {
			continue;
		}
		$rate = pph_volume_rate_for_qty( $item['quantity'] );
		if ( $rate <= 0 ) {
			continue;
		}

		/* Always from the regular price, never from the current one - reading
		   the current price would compound the discount on every recalculation. */
		$base = (float) $item['data']->get_regular_price();
		if ( $base <= 0 ) {
			continue;
		}
		$item['data']->set_price( round( $base * ( 1 - $rate / 100 ), 2 ) );
	}
}

/**
 * Say so on the cart line, rather than leaving the buyer to notice a number
 * changed. Same reasoning as the product page showing its arithmetic.
 */
add_filter( 'woocommerce_get_item_data', 'pph_show_volume_discount_on_line', 10, 2 );
function pph_show_volume_discount_on_line( $item_data, $cart_item ) {
	$rate = pph_volume_rate_for_qty( isset( $cart_item['quantity'] ) ? $cart_item['quantity'] : 0 );
	if ( $rate > 0 ) {
		$item_data[] = array(
			'key'   => 'Volume discount',
			'value' => '-' . rtrim( rtrim( number_format( $rate, 2, '.', '' ), '0' ), '.' ) . '%',
		);
	}
	return $item_data;
}
