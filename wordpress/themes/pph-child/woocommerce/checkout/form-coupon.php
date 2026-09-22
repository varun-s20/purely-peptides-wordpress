<?php
/**
 * Coupon entry - markup only. `form.checkout_coupon` posting `coupon_code`
 * via a button named `apply_coupon` is WooCommerce's own real shape; its
 * checkout.js finds this form by those exact class/name attributes and
 * submits it by AJAX (wc-ajax=update_order_review under the hood) with no
 * page reload and no JS of ours needed. Only the wrapping HTML changed - see
 * inc/checkout.php's pph_move_coupon_form() for why this renders where it
 * does instead of WooCommerce's own default position.
 *
 * Shown open rather than behind WooCommerce's default "Have a coupon? Click
 * here" toggle link - one fewer click for a checkout this short, and it
 * avoids depending on WooCommerce core's jQuery toggle still targeting these
 * classes correctly after a markup rewrite.
 */

defined( 'ABSPATH' ) || exit;

if ( ! wc_coupons_enabled() ) {
	return;
}
?>
<form class="wrap checkout_coupon woocommerce-form-coupon" method="post" style="padding-block:var(--s-4) 0">
	<fieldset class="fieldset">
		<legend><?php esc_html_e( 'Have a coupon?', 'woocommerce' ); ?></legend>
		<div class="form-grid">
			<label class="field" for="coupon_code">
				<span class="field__label"><?php esc_html_e( 'Coupon code', 'woocommerce' ); ?></span>
				<input class="input" type="text" name="coupon_code" id="coupon_code" value="" placeholder="<?php esc_attr_e( 'Enter your code', 'woocommerce' ); ?>">
			</label>
			<button type="submit" class="btn btn--secondary" name="apply_coupon" value="<?php esc_attr_e( 'Apply coupon', 'woocommerce' ); ?>" style="align-self:end"><?php esc_html_e( 'Apply coupon', 'woocommerce' ); ?></button>
		</div>
	</fieldset>
</form>
