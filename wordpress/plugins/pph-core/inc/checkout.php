<?php
/**
 * Checkout compliance - the AllayPay conditions from src/pages/commerce.js's
 * checkout(), added onto WooCommerce's own checkout engine rather than a
 * full custom rewrite of it.
 *
 * WHY NOT A CUSTOM CHECKOUT TEMPLATE: WooCommerce's checkout ENGINE (order
 * creation, AJAX order-review recalculation, payment-method switching, field
 * validation) is not rewritten here and never should be - it is reliable and
 * already handles tax/shipping/order creation correctly. Everything AllayPay's
 * merchant account requires is added through its real extension points, the
 * `woocommerce_checkout_fields` filter, not by forking that logic.
 *
 * The theme DOES override the checkout template PARTS
 * (woocommerce/checkout/form-checkout.php, form-billing.php, form-shipping.php,
 * review-order.php, payment.php, terms.php) - these are markup only, each one
 * a straight copy of WooCommerce's own extension point with the site's real
 * .field/.fieldset/.checkout__summary classes in place of Woo's generic
 * form-row/table markup, still reading from `$checkout->get_checkout_fields()`
 * and still calling every `do_action()` the engine and its JS depend on. See
 * pph_render_checkout_field() below - one small renderer, shared by every
 * overridden template, is what keeps this from becoming five copies of the
 * same field-drawing code.
 *
 * PAYMENT: no real gateway exists yet (AllayPay integration is phase 15,
 * blocked on their approval). Rather than build a fake "enter your bank
 * details" screen with nothing real behind it - collecting real customer bank
 * account numbers on an unlaunched, un-approved site is a genuine
 * data-handling risk, not a cosmetic gap - this enables WooCommerce's own
 * built-in Direct Bank Transfer (BACS) gateway, relabelled honestly. It lets
 * an order actually complete end to end for testing and client review without
 * storing anything sensitive. Swap in the real AllayPay gateway at phase 15;
 * everything else on this page does not change.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Guest checkout off - AllayPay does not permit it. Enforced on every
 * admin load, not just plugin activation: activation only fires on an
 * actual activate/deactivate cycle, not on uploading new code to an
 * already-active plugin, and a compliance-required setting should not
 * depend on remembering that distinction.
 */
add_action( 'admin_init', 'pph_enforce_no_guest_checkout' );
function pph_enforce_no_guest_checkout() {
	if ( 'no' !== get_option( 'woocommerce_enable_guest_checkout' ) ) {
		update_option( 'woocommerce_enable_guest_checkout', 'no' );
	}
	if ( 'yes' !== get_option( 'woocommerce_enable_signup_and_login_from_checkout' ) ) {
		update_option( 'woocommerce_enable_signup_and_login_from_checkout', 'yes' );
	}
	/* Without this, WooCommerce auto-generates the account password instead
	   of asking for one - the "Create a password" / "Confirm password"
	   fields the static design requires never render at all, regardless of
	   template markup, and the customer never sees the password they were
	   assigned. */
	if ( 'no' !== get_option( 'woocommerce_registration_generate_password' ) ) {
		update_option( 'woocommerce_registration_generate_password', 'no' );
	}
}

/**
 * Payment, the acknowledgements and Place Order belong in checkout's MAIN
 * column, under the address fieldsets, the way the static design has them -
 * not inside the order-summary aside. WooCommerce hooks its own
 * woocommerce_checkout_payment() onto woocommerce_checkout_order_review at
 * priority 20, which is what put them there; unhooking it lets
 * woocommerce/checkout/form-checkout.php call it from the main column instead.
 *
 * Nothing about the checkout engine changes: WC_AJAX::update_order_review()
 * calls woocommerce_checkout_payment() directly rather than via this action,
 * and checkout.js applies the result by the '.woocommerce-checkout-payment'
 * selector wherever that element happens to sit in the document.
 *
 * init, not plugins_loaded: WooCommerce registers this in
 * includes/wc-template-hooks.php while it boots, so removing it any earlier
 * removes nothing.
 */
add_action( 'init', 'pph_move_payment_to_main_column' );
function pph_move_payment_to_main_column() {
	remove_action( 'woocommerce_checkout_order_review', 'woocommerce_checkout_payment', 20 );
}

/**
 * The coupon form - same reasoning as pph_move_payment_to_main_column() above.
 * WooCommerce hooks woocommerce_checkout_coupon_form() onto
 * woocommerce_before_checkout_form, which our overridden form-checkout.php
 * still calls first thing, before its own heading markup - so the coupon
 * form (and, on stock WooCommerce, its "Have a coupon?" toggle notice) was
 * rendering bare above the page, with none of woo-bridge.css's styling and
 * none of styles.css's `.wrap` side padding, sitting flush against the header
 * with the text running edge to edge. That was the checkout page's missing
 * top gap and the text sitting "on the margin" - not two separate bugs.
 *
 * Unhooked here; form-checkout.php calls it manually from a controlled spot
 * instead, inside a `.wrap` like everything else on the page. The coupon
 * ENGINE is untouched - checkout/form-coupon.php (also overridden, markup
 * only) still renders as `form.checkout_coupon` posting `coupon_code` /
 * `apply_coupon`, the exact shape WooCommerce's own checkout.js AJAX handler
 * looks for, so applying a coupon still works with zero JS changes.
 */
add_action( 'init', 'pph_move_coupon_form' );
function pph_move_coupon_form() {
	remove_action( 'woocommerce_before_checkout_form', 'woocommerce_checkout_coupon_form', 10 );
}

/**
 * The research-field dropdown, required for every order - the one field
 * AllayPay's rules describe as mandatory that WooCommerce has no field for
 * already. Added to the order fieldset (not billing) since it is about the
 * order's purpose, not the buyer's address.
 */
add_filter( 'woocommerce_checkout_fields', 'pph_add_research_field' );
function pph_add_research_field( $fields ) {
	$options = array( '' => 'Select your field of research' );
	foreach ( pph_setting_list( 'research_fields' ) as $f ) {
		$options[ $f ] = $f;
	}

	$fields['order']['pph_research_field'] = array(
		'type'        => 'select',
		'label'       => 'Field of research',
		'options'     => $options,
		'required'    => true,
		'priority'    => 5,
		'class'       => array( 'form-row-wide' ),
		'description' => 'We are required to record the research context for every order.',
	);

	/* Company/institution is already collected by Woo's own billing_company
	   field when Settings -> Accounts & Privacy has company name enabled;
	   make it required rather than adding a second field for the same fact. */
	if ( isset( $fields['billing']['billing_company'] ) ) {
		$fields['billing']['billing_company']['required']    = true;
		$fields['billing']['billing_company']['label']       = 'Company or institution';
		$fields['billing']['billing_company']['placeholder'] = 'Laboratory, university or company';
		$fields['billing']['billing_company']['description'] = 'Orders cannot be placed without a named organisation.';
	}

	return $fields;
}

/**
 * The three required acknowledgements. Rendered as checkboxes in the order
 * fieldset - unchecked by default, exactly as the static build required, and
 * WooCommerce's own field renderer never pre-checks a checkbox field unless
 * told to, so there is no separate "do not pre-tick this" step needed.
 */
add_filter( 'woocommerce_checkout_fields', 'pph_add_acknowledgement_fields' );
function pph_add_acknowledgement_fields( $fields ) {
	$fields['order']['pph_ack_ruo'] = array(
		'type'     => 'checkbox',
		'label'    => 'I confirm I am ordering on behalf of the laboratory, institution or company named above, and that these materials are for research purposes only. They will not be used for human or veterinary therapeutic purposes, and will not be administered to humans or animals, dosed, injected or ingested.',
		'required' => true,
		'priority' => 91,
		'class'    => array( 'form-row-wide', 'pph-ack' ),
	);
	$fields['order']['pph_ack_age'] = array(
		'type'     => 'checkbox',
		'label'    => 'I am 21 years of age or older.',
		'required' => true,
		'priority' => 92,
		'class'    => array( 'form-row-wide', 'pph-ack' ),
	);
	$fields['order']['pph_ack_terms'] = array(
		'type'     => 'checkbox',
		'label'    => 'I have read and accept the terms and conditions of purchase, the privacy policy, the refund and returns policy, the chargeback policy and the research use policy.',
		'required' => true,
		'priority' => 93,
		'class'    => array( 'form-row-wide', 'pph-ack' ),
	);
	return $fields;
}

/**
 * Save the research field and a TIMESTAMP for each acknowledgement - not just
 * that the box was ticked, but when. AllayPay's condition is that consent is
 * captured against the order; a timestamp is what makes that a record rather
 * than an assertion.
 */
add_action( 'woocommerce_checkout_update_order_meta', 'pph_save_checkout_compliance_fields' );
function pph_save_checkout_compliance_fields( $order_id ) {
	if ( ! empty( $_POST['pph_research_field'] ) ) {
		update_post_meta( $order_id, '_pph_research_field', sanitize_text_field( wp_unslash( $_POST['pph_research_field'] ) ) );
	}
	$now = current_time( 'mysql' );
	foreach ( array( 'pph_ack_ruo', 'pph_ack_age', 'pph_ack_terms' ) as $key ) {
		if ( ! empty( $_POST[ $key ] ) ) {
			update_post_meta( $order_id, '_' . $key . '_at', $now );
		}
	}
}

/**
 * Show what was captured on the admin order screen - otherwise this
 * compliance record exists only in post meta, invisible to the person who
 * actually has to produce it if AllayPay or a chargeback ever asks for it.
 */
add_action( 'woocommerce_admin_order_data_after_billing_address', 'pph_show_compliance_on_order_admin' );
function pph_show_compliance_on_order_admin( $order ) {
	$id     = $order->get_id();
	$field  = get_post_meta( $id, '_pph_research_field', true );
	$ruo    = get_post_meta( $id, '_pph_ack_ruo_at', true );
	$age    = get_post_meta( $id, '_pph_ack_age_at', true );
	$terms  = get_post_meta( $id, '_pph_ack_terms_at', true );

	echo '<p><strong>Research field:</strong> ' . esc_html( $field ?: '(not recorded)' ) . '</p>';
	echo '<p><strong>Acknowledgements:</strong><br>';
	echo 'Research use confirmation: ' . ( $ruo ? esc_html( $ruo ) . ' UTC' : '<span style="color:#b32d2e">missing</span>' ) . '<br>';
	echo '21+ confirmation: ' . ( $age ? esc_html( $age ) . ' UTC' : '<span style="color:#b32d2e">missing</span>' ) . '<br>';
	echo 'Terms accepted: ' . ( $terms ? esc_html( $terms ) . ' UTC' : '<span style="color:#b32d2e">missing</span>' );
	echo '</p>';
}

/**
 * The payment placeholder. WooCommerce's own BACS gateway, relabelled - see
 * the file header for why this exists instead of a real ACH form.
 */
add_filter( 'woocommerce_payment_gateways', 'pph_ensure_bacs_available' );
function pph_ensure_bacs_available( $gateways ) {
	if ( ! in_array( 'WC_Gateway_BACS', $gateways, true ) ) {
		$gateways[] = 'WC_Gateway_BACS';
	}
	return $gateways;
}

add_filter( 'woocommerce_gateway_title', 'pph_relabel_bacs_title', 10, 2 );
function pph_relabel_bacs_title( $title, $gateway_id ) {
	if ( 'bacs' === $gateway_id ) {
		return 'ACH / bank transfer';
	}
	return $title;
}

add_filter( 'woocommerce_gateway_description', 'pph_relabel_bacs_description', 10, 2 );
function pph_relabel_bacs_description( $description, $gateway_id ) {
	if ( 'bacs' === $gateway_id ) {
		return 'Payment is finalised directly with our team once your order and research account are confirmed - our ACH payment processor integration goes live at launch. Placing an order now reserves it; nothing is charged automatically.';
	}
	return $description;
}

/**
 * Every product page carries this wording verbatim; checkout is where the
 * money actually changes hands, so it belongs here too, not only on the
 * pages that lead up to it.
 */
add_action( 'woocommerce_before_checkout_form', 'pph_checkout_disclaimer_notice' );
function pph_checkout_disclaimer_notice() {
	echo '<div class="wrap"><div class="notice notice--warn" style="margin-bottom:24px">'
		. pph_icon( 'flask' )
		. '<div><strong>' . esc_html( pph_locked_disclaimers()['footer'] ) . '</strong></div></div></div>';
}

/**
 * One field, drawn as the static design's real markup (fieldset > .form-grid
 * > label.field / label.check) instead of WooCommerce's own form-row markup.
 * Shared by every overridden checkout template so the site's actual
 * .field/.input/.select/.check CSS - already live and correct on every other
 * page - applies to checkout too, with zero new CSS.
 *
 * Deliberately not a generic drop-in replacement for woocommerce_form_field():
 * it only covers the field types this checkout actually uses (text, email,
 * tel, select, checkbox, password). That is the whole checkout form, so
 * nothing is missing, but it is not meant to run on My Account's templates
 * (still stock Woo markup - restyle deferred, see PROGRESS.md).
 */
function pph_render_checkout_field( $key, $field, $value ) {
	$type     = isset( $field['type'] ) ? $field['type'] : 'text';
	$label    = isset( $field['label'] ) ? $field['label'] : '';
	$required = ! empty( $field['required'] );
	$classes  = (array) ( $field['class'] ?? array() );
	$wide     = in_array( 'form-row-wide', $classes, true ) || in_array( $type, array( 'select', 'checkbox', 'textarea', 'country', 'state' ), true );

	/* WooCommerce's own 'country' and 'state' field types build their option
	   list at render time (inside woocommerce_form_field(), which this
	   renderer replaces) rather than storing it on $field - fetch the same
	   lists WooCommerce itself would use. A country with no state list
	   (get_states() returns null/empty) falls through to a plain text input,
	   same as Woo's own behaviour for those countries. */
	if ( 'country' === $type ) {
		if ( empty( $field['options'] ) ) {
			$field['options'] = WC()->countries->get_allowed_countries();
		}
		$type = 'select';
	}
	if ( 'state' === $type && empty( $field['options'] ) ) {
		$country = ! empty( $_POST['billing_country'] ) ? wc_clean( wp_unslash( $_POST['billing_country'] ) ) : ( WC()->customer ? WC()->customer->get_billing_country() : '' ); // phpcs:ignore WordPress.Security.NonceVerification
		$states  = $country ? WC()->countries->get_states( $country ) : null;
		if ( $states ) {
			$field['options'] = array( '' => 'Select a state' ) + $states;
			$type              = 'select';
		} else {
			$type = 'text';
		}
	}

	if ( 'checkbox' === $type ) {
		$ack = in_array( 'pph-ack', $classes, true ) ? ' pph-ack' : '';
		echo '<label class="check' . esc_attr( $ack ) . '">';
		printf(
			'<input type="checkbox" name="%1$s" id="%2$s" value="1" %3$s %4$s>',
			esc_attr( $key ),
			esc_attr( $key ),
			checked( $value, '1', false ),
			$required ? 'required' : ''
		);
		echo '<span>' . wp_kses_post( $label ) . '</span></label>';
		return;
	}

	printf( '<label class="field%s" for="%s">', $wide ? ' field--full' : '', esc_attr( $key ) );
	if ( $label ) {
		printf(
			'<span class="field__label">%s%s</span>',
			esc_html( $label ),
			$required ? '<span class="field__req" aria-hidden="true">*</span>' : ''
		);
	}

	if ( 'select' === $type ) {
		echo '<select class="select" name="' . esc_attr( $key ) . '" id="' . esc_attr( $key ) . '"' . ( $required ? ' required' : '' ) . '>';
		foreach ( (array) ( $field['options'] ?? array() ) as $opt_key => $opt_label ) {
			printf( '<option value="%s"%s>%s</option>', esc_attr( $opt_key ), selected( $value, $opt_key, false ), esc_html( $opt_label ) );
		}
		echo '</select>';
	} elseif ( 'textarea' === $type ) {
		printf(
			'<textarea class="input" name="%1$s" id="%1$s"%2$s>%3$s</textarea>',
			esc_attr( $key ),
			$required ? ' required' : '',
			esc_textarea( $value )
		);
	} else {
		$input_type = in_array( $type, array( 'email', 'tel', 'password' ), true ) ? $type : 'text';
		printf(
			'<input class="input%1$s" type="%2$s" name="%3$s" id="%3$s" value="%4$s"%5$s autocomplete="%6$s"%7$s>',
			'tel' === $input_type ? ' input--mono' : '',
			esc_attr( $input_type ),
			esc_attr( $key ),
			esc_attr( $value ),
			$required ? ' required' : '',
			esc_attr( $field['autocomplete'] ?? '' ),
			! empty( $field['placeholder'] ) ? ' placeholder="' . esc_attr( $field['placeholder'] ) . '"' : ''
		);
	}

	if ( ! empty( $field['description'] ) ) {
		printf( '<span class="field__hint">%s</span>', wp_kses_post( $field['description'] ) );
	}
	echo '</label>';
}
