<?php
/**
 * Wholesale accounts - CONVERSION-PLAN.md phase 10.
 *
 * The client's rule (inventory sheet, 21 Sep 2026): every size has a
 * wholesale price, charged to approved wholesale accounts at a minimum of 10
 * of that size. Everything here follows from that one sentence.
 *
 * Approval is a WordPress role, not a custom status screen:
 *   Wholesale applicant  (pph_wholesale_pending) - applied, pays retail
 *   Wholesale buyer      (pph_wholesale)         - approved, pays wholesale
 * The client approves someone in Users -> the applicant -> Role -> "Wholesale
 * buyer" -> Update User. Users -> filter "Wholesale applicant" is the queue.
 * The application itself shows on that same profile screen.
 *
 * A wholesale line is a size an approved buyer orders that HAS a wholesale
 * price. It is charged that price, it takes no retail volume discount (the
 * two do not stack), and it needs at least PPH_WHOLESALE_MIN units. A size
 * with no wholesale price is simply a retail line, for anyone.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* Keep in step with WHOLESALE_MIN in src/pages/wholesale.js. */
define( 'PPH_WHOLESALE_MIN', 10 );

/* Registered on every request rather than on activation: activation hooks do
   not fire when the plugin folder is re-uploaded over an active plugin, which
   is how this site is deployed. add_role() is a no-op cost once they exist. */
add_action( 'init', 'pph_register_wholesale_roles' );
function pph_register_wholesale_roles() {
	if ( ! get_role( 'pph_wholesale_pending' ) ) {
		add_role( 'pph_wholesale_pending', 'Wholesale applicant', array( 'read' => true ) );
	}
	if ( ! get_role( 'pph_wholesale' ) ) {
		add_role( 'pph_wholesale', 'Wholesale buyer', array( 'read' => true ) );
	}
}

function pph_user_has_role( $role, $user_id = 0 ) {
	$user = $user_id ? get_userdata( $user_id ) : wp_get_current_user();
	return $user && in_array( $role, (array) $user->roles, true );
}

function pph_is_wholesale_buyer() {
	return pph_user_has_role( 'pph_wholesale' );
}

/**
 * The wholesale price this visitor pays for a variation, or null when they
 * pay retail (not an approved buyer, or no wholesale price for that size).
 */
function pph_wholesale_line_price( $variation_id ) {
	if ( ! $variation_id || ! pph_is_wholesale_buyer() ) {
		return null;
	}
	$price = get_post_meta( $variation_id, '_pph_wholesale_price', true );
	return '' === $price ? null : (float) $price;
}

/** Does any size of this product carry a wholesale price for this visitor? */
function pph_product_is_wholesale( $product ) {
	foreach ( $product->get_children() as $vid ) {
		if ( null !== pph_wholesale_line_price( $vid ) ) {
			return true;
		}
	}
	return false;
}

/** Raise a wholesale line's quantity to the minimum; retail lines untouched. */
function pph_wholesale_clamp_qty( $variation_id, $qty ) {
	return null === pph_wholesale_line_price( $variation_id ) ? $qty : max( PPH_WHOLESALE_MIN, (int) $qty );
}

/* ------------------------------------------------------------------ pricing
   Filtering the variation's price at the source means every place that reads
   it - product page, catalogue feed, cart, checkout totals - shows the same
   wholesale figure with no template needing to know. Retail visitors never
   reach the meta lookup. */

add_filter( 'woocommerce_product_variation_get_price', 'pph_filter_wholesale_price', 20, 2 );
add_filter( 'woocommerce_product_variation_get_regular_price', 'pph_filter_wholesale_price', 20, 2 );
function pph_filter_wholesale_price( $price, $variation ) {
	$wholesale = pph_wholesale_line_price( $variation->get_id() );
	return null === $wholesale ? $price : $wholesale;
}

/* The minimum, enforced where an order is actually placed. The cart API
   already raises a short line to the minimum when it is added or edited;
   this catches everything else (a saved order restored, a role changed with
   a cart already open) and blocks checkout with a reason. */
add_action( 'woocommerce_check_cart_items', 'pph_wholesale_check_minimums' );
/* WooCommerce's "issues with the items in your cart" page at /checkout/ does
   not print the notices that caused it - so the buyer would never see why. */
add_action( 'woocommerce_cart_has_errors', 'wc_print_notices' );
function pph_wholesale_check_minimums() {
	foreach ( WC()->cart->get_cart() as $item ) {
		if ( null === pph_wholesale_line_price( $item['variation_id'] ) || $item['quantity'] >= PPH_WHOLESALE_MIN ) {
			continue;
		}
		$size = $item['data']->get_attribute( 'size' );
		wc_add_notice(
			sprintf(
				'Wholesale pricing needs at least %1$d of each size - you have %2$d of %3$s. Update the quantity in your order to continue.',
				PPH_WHOLESALE_MIN,
				(int) $item['quantity'],
				esc_html( get_the_title( $item['product_id'] ) . ( $size ? ' ' . $size : '' ) )
			),
			'error'
		);
	}
}

/* ----------------------------------------------------------- application
   The form is /wholesale/apply/'s own page content (src/pages/wholesale.js),
   posted back to the same URL. No nonce: the page is cacheable HTML, a nonce
   baked into it goes stale for every visitor (the exact bug inc/cart-api.php
   documents), and there is nothing to forge - an anonymous post can only
   create a new applicant, and a signed-in one can only mark the visitor's
   own account as applying. A honeypot field turns away the form bots. */

add_action( 'template_redirect', 'pph_handle_wholesale_application' );
function pph_handle_wholesale_application() {
	if ( empty( $_POST['pph_wholesale_apply'] ) || 'POST' !== $_SERVER['REQUEST_METHOD'] ) {
		return;
	}
	$back = home_url( '/wholesale/apply/' );
	$fail = function ( $code ) use ( $back ) {
		wp_safe_redirect( add_query_arg( 'wholesale_error', $code, $back ) );
		exit;
	};

	if ( ! empty( $_POST['pph_hp'] ) ) {
		wp_safe_redirect( home_url( '/' ) );
		exit;
	}

	$text = function ( $key ) {
		return isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';
	};
	$app = array(
		'org'            => $text( 'org' ),
		'website'        => isset( $_POST['website'] ) ? esc_url_raw( wp_unslash( $_POST['website'] ) ) : '',
		'address'        => $text( 'address' ),
		'contact'        => $text( 'contact' ),
		'role'           => $text( 'role' ),
		'email'          => isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '',
		'phone'          => $text( 'phone' ),
		'org_type'       => $text( 'org_type' ),
		'research_field' => $text( 'research_field' ),
		'categories'     => isset( $_POST['categories'] ) ? implode( ', ', array_map( 'sanitize_text_field', wp_unslash( (array) $_POST['categories'] ) ) ) : '',
		'intended_use'   => isset( $_POST['intended_use'] ) ? sanitize_textarea_field( wp_unslash( $_POST['intended_use'] ) ) : '',
		'spend'          => $text( 'spend' ),
		'po'             => $text( 'po' ),
		'comments'       => isset( $_POST['comments'] ) ? sanitize_textarea_field( wp_unslash( $_POST['comments'] ) ) : '',
		'submitted'      => current_time( 'mysql' ),
	);

	foreach ( array( 'org', 'address', 'contact', 'phone', 'org_type', 'research_field', 'intended_use' ) as $required ) {
		if ( '' === $app[ $required ] ) {
			$fail( 'fields' );
		}
	}
	if ( ! is_email( $app['email'] ) || empty( $_POST['ack_ruo'] ) || empty( $_POST['ack_auth'] ) ) {
		$fail( 'fields' );
	}

	if ( is_user_logged_in() ) {
		$user_id = get_current_user_id();
	} else {
		if ( email_exists( $app['email'] ) ) {
			$fail( 'exists' );
		}
		$password = isset( $_POST['password'] ) ? (string) wp_unslash( $_POST['password'] ) : '';
		if ( strlen( $password ) < 8 ) {
			$fail( 'password' );
		}
		$names   = explode( ' ', $app['contact'], 2 );
		$user_id = wc_create_new_customer(
			$app['email'],
			wc_create_new_customer_username( $app['email'] ),
			$password,
			array(
				'first_name' => $names[0],
				'last_name'  => isset( $names[1] ) ? $names[1] : '',
			)
		);
		if ( is_wp_error( $user_id ) ) {
			$fail( 'create' );
		}
		wc_set_customer_auth_cookie( $user_id );
	}

	update_user_meta( $user_id, '_pph_wholesale_application', $app );
	foreach ( array( 'billing_company' => 'org', 'billing_phone' => 'phone' ) as $meta => $key ) {
		if ( ! get_user_meta( $user_id, $meta, true ) ) {
			update_user_meta( $user_id, $meta, $app[ $key ] );
		}
	}

	/* Only an ordinary customer account is moved into the queue - an admin or
	   shop manager testing the form keeps their role, and an approved buyer
	   re-applying stays approved. */
	$user = get_userdata( $user_id );
	if ( ! array_diff( (array) $user->roles, array( 'customer', 'subscriber' ) ) ) {
		$user->set_role( 'pph_wholesale_pending' );
	}

	wp_mail(
		array_unique( array( get_option( 'admin_email' ), pph_setting( 'support_email' ) ) ),
		'New wholesale application: ' . $app['org'],
		sprintf(
			"%s (%s) applied for a wholesale account for %s.\n\nReview and approve: %s\n(Set Role to \"Wholesale buyer\" and click Update User.)",
			$app['contact'],
			$app['email'],
			$app['org'],
			admin_url( 'user-edit.php?user_id=' . $user_id )
		)
	);

	wp_safe_redirect( wc_get_page_permalink( 'myaccount' ) );
	exit;
}

/* The only way the handler's errors reach the visitor: a notice above the
   application form, keyed by the ?wholesale_error= it redirects back with. */
add_filter( 'the_content', 'pph_wholesale_application_error', 20 );
function pph_wholesale_application_error( $content ) {
	$code     = isset( $_GET['wholesale_error'] ) ? sanitize_key( $_GET['wholesale_error'] ) : '';
	$messages = array(
		'exists'   => 'An account already uses that email address. <a class="link" href="' . esc_url( wc_get_page_permalink( 'myaccount' ) ) . '">Sign in</a>, then submit the application again.',
		'password' => 'Choose a password of at least 8 characters so we can create your account.',
		'fields'   => 'Some required fields were missing. Please complete the form and submit it again.',
		'create'   => 'We could not create your account just now. Please try again, or contact us.',
	);
	if ( ! isset( $messages[ $code ] ) || ! is_page() || ! in_the_loop() ) {
		return $content;
	}
	return '<div class="wrap" style="padding-top:24px"><div class="notice notice--stop">' . pph_icon( 'alert' ) . '<div>' . $messages[ $code ] . '</div></div></div>' . $content;
}

/* ------------------------------------------------------------------- admin */

add_action( 'show_user_profile', 'pph_wholesale_profile_section' );
add_action( 'edit_user_profile', 'pph_wholesale_profile_section' );
function pph_wholesale_profile_section( $user ) {
	$app = get_user_meta( $user->ID, '_pph_wholesale_application', true );
	if ( ! $app || ! current_user_can( 'edit_users' ) ) {
		return;
	}
	$labels = array(
		'submitted'      => 'Submitted',
		'org'            => 'Organisation',
		'website'        => 'Website',
		'address'        => 'Business address',
		'contact'        => 'Contact person',
		'role'           => 'Role',
		'email'          => 'Email',
		'phone'          => 'Phone',
		'org_type'       => 'Organisation type',
		'research_field' => 'Research field',
		'categories'     => 'Expected categories',
		'intended_use'   => 'Intended research use',
		'spend'          => 'Estimated monthly spend',
		'po'             => 'Orders against a PO',
		'comments'       => 'Comments',
	);
	?>
	<h2>Wholesale application</h2>
	<p>To approve, set <strong>Role</strong> (under Name, above) to <strong>Wholesale buyer</strong> and click Update User. The applicant is emailed automatically.</p>
	<table class="form-table" role="presentation">
		<?php foreach ( $labels as $key => $label ) : ?>
			<?php if ( ! empty( $app[ $key ] ) ) : ?>
				<tr><th scope="row"><?php echo esc_html( $label ); ?></th><td><?php echo nl2br( esc_html( $app[ $key ] ) ); ?></td></tr>
			<?php endif; ?>
		<?php endforeach; ?>
	</table>
	<?php
}

add_action( 'set_user_role', 'pph_wholesale_approved_email', 10, 3 );
function pph_wholesale_approved_email( $user_id, $role, $old_roles ) {
	if ( 'pph_wholesale' !== $role || in_array( 'pph_wholesale', (array) $old_roles, true ) ) {
		return;
	}
	$user = get_userdata( $user_id );
	wp_mail(
		$user->user_email,
		'Your Purely Peptides Hub wholesale account is active',
		sprintf(
			"Your wholesale account has been approved.\n\nSign in at %s and wholesale prices show on every product page and apply automatically at checkout, from %d of each size.\n\nPurely Peptides Hub",
			wc_get_page_permalink( 'myaccount' ),
			PPH_WHOLESALE_MIN
		)
	);
}

/* ---------------------------------------------------------------- checkout */

add_filter( 'woocommerce_checkout_fields', 'pph_wholesale_po_field' );
function pph_wholesale_po_field( $fields ) {
	if ( pph_is_wholesale_buyer() ) {
		$fields['order']['pph_po_number'] = array(
			'type'        => 'text',
			'label'       => 'Purchase order number',
			'required'    => false,
			'priority'    => 6,
			'class'       => array( 'form-row-wide' ),
			'description' => 'Optional. Recorded on the order for your accounts team.',
		);
	}
	return $fields;
}

add_action( 'woocommerce_checkout_update_order_meta', 'pph_wholesale_save_po' );
function pph_wholesale_save_po( $order_id ) {
	if ( ! empty( $_POST['pph_po_number'] ) ) {
		update_post_meta( $order_id, '_pph_po_number', sanitize_text_field( wp_unslash( $_POST['pph_po_number'] ) ) );
	}
}

add_action( 'woocommerce_admin_order_data_after_billing_address', 'pph_wholesale_show_po' );
function pph_wholesale_show_po( $order ) {
	$po = get_post_meta( $order->get_id(), '_pph_po_number', true );
	if ( $po ) {
		echo '<p><strong>Purchase order:</strong> ' . esc_html( $po ) . '</p>';
	}
}

/* ----------------------------------------------------------------- account */

add_action( 'woocommerce_account_dashboard', 'pph_account_wholesale_status', 15 );
function pph_account_wholesale_status() {
	if ( pph_is_wholesale_buyer() ) {
		$msg = sprintf( '<strong>Wholesale account active.</strong> Wholesale prices apply to every size from %d vials.', PPH_WHOLESALE_MIN );
	} elseif ( pph_user_has_role( 'pph_wholesale_pending' ) ) {
		$msg = '<strong>Wholesale application received.</strong> We review every application individually and will email you when the account is active. Until then you can order at regular prices.';
	} else {
		return;
	}
	echo '<div class="notice notice--accent" style="margin-top:24px">' . pph_icon( 'info' ) . '<div>' . $msg . '</div></div>';
}
