<?php
/**
 * Order summary - reuses pph_render_cart_lines_html() (the same `.cart-line`
 * row the cart drawer already renders correctly) for the items, and
 * `.trow` rows - the same pattern the /cart/ page's own summary panel uses -
 * for the totals, instead of Woo's default shop_table markup.
 *
 * THE ROOT ELEMENT MUST CARRY .woocommerce-checkout-review-order-table, even
 * though it is a <div> here and not Woo's own <table>. WC_AJAX::update_order_review()
 * returns this template's output as the fragment keyed by that exact selector and
 * checkout.js does $( selector ).replaceWith( output ). With the class missing the
 * selector matches nothing, the swap silently does nothing, and the totals never
 * update when the address, shipping method or coupon changes. With the class on an
 * INNER element instead, the swap nests the whole template inside itself and the
 * summary renders twice. One root element, class on it, everything inside it.
 *
 * The subtotal/coupon/tax/total helpers below (wc_cart_totals_*_html) just
 * echo a price string with no wrapper markup of their own, so wrapping each
 * in a .trow is safe. wc_cart_totals_shipping_html() is the one exception -
 * it renders a full <tr>/<td> internally to hold a per-package method list -
 * so it is left un-wrapped and styled generically instead (see woo-bridge.css
 * ".woocommerce-shipping-totals"), rather than reproduced from memory here.
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="woocommerce-checkout-review-order-table">

	<div class="checkout__lines" data-checkout-lines>
		<?php echo pph_render_cart_lines_html(); ?>
	</div>

	<div class="checkout__totals">
		<?php do_action( 'woocommerce_review_order_before_order_total' ); ?>

		<div class="trow"><span><?php esc_html_e( 'Subtotal', 'woocommerce' ); ?></span><span class="num"><?php wc_cart_totals_subtotal_html(); ?></span></div>

		<?php foreach ( WC()->cart->get_coupons() as $code => $coupon ) : ?>
			<div class="trow"><span><?php wc_cart_totals_coupon_label( $coupon ); ?></span><span class="num"><?php wc_cart_totals_coupon_html( $coupon ); ?></span></div>
		<?php endforeach; ?>

		<?php if ( WC()->cart->needs_shipping() && WC()->cart->show_shipping() ) : ?>
			<?php do_action( 'woocommerce_review_order_before_shipping' ); ?>
			<?php wc_cart_totals_shipping_html(); ?>
			<?php do_action( 'woocommerce_review_order_after_shipping' ); ?>
		<?php endif; ?>

		<?php foreach ( WC()->cart->get_fees() as $fee ) : ?>
			<div class="trow"><span><?php echo esc_html( $fee->name ); ?></span><span class="num"><?php wc_cart_totals_fee_html( $fee ); ?></span></div>
		<?php endforeach; ?>

		<?php if ( wc_tax_enabled() && ! WC()->cart->display_prices_including_tax() ) : ?>
			<?php if ( 'itemized' === get_option( 'woocommerce_tax_total_display' ) ) : ?>
				<?php foreach ( WC()->cart->get_tax_totals() as $code => $tax ) : ?>
					<div class="trow"><span><?php echo esc_html( $tax->label ); ?></span><span class="num"><?php echo wp_kses_post( $tax->formatted_amount ); ?></span></div>
				<?php endforeach; ?>
			<?php else : ?>
				<div class="trow"><span><?php echo esc_html( WC()->countries->tax_or_vat() ); ?></span><span class="num"><?php wc_cart_totals_taxes_total_html(); ?></span></div>
			<?php endif; ?>
		<?php endif; ?>

		<div class="trow trow--total"><span><?php esc_html_e( 'Total', 'woocommerce' ); ?></span><span class="num"><?php wc_cart_totals_order_total_html(); ?></span></div>

		<?php do_action( 'woocommerce_review_order_after_order_total' ); ?>

		<div class="notice notice--warn" style="margin-top:16px">
			<?php echo pph_icon( 'flask' ); ?>
			<div><?php echo esc_html( pph_locked_disclaimers()['product'] ); ?></div>
		</div>

		<ul class="pdp__assur" style="list-style:none;padding:0;margin-top:20px">
			<li><?php echo pph_icon( 'lock' ); ?>ACH / e-check, processed securely</li>
			<li><?php echo pph_icon( 'truck' ); ?>Order tracking issued on despatch</li>
			<li><?php echo pph_icon( 'doc' ); ?>Documentation available in your account</li>
		</ul>
	</div>

</div>
