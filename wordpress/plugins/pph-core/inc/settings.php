<?php
/**
 * Site-wide settings: contact details, research fields, restricted states,
 * pricing thresholds - CONVERSION-PLAN.md's phase 3 settings screen, one place
 * instead of scattered across code.
 *
 * The two AllayPay-mandated disclaimer strings are shown here READ-ONLY, for
 * reference only. They are not editable from wp-admin on purpose - underwriting
 * checks them verbatim, and an editable field is an invitation to reword one
 * by accident. Their source of truth is src/data.js `brand.productDisclaimer`
 * / `brand.footerDisclaimer` in the original build; keep this copy in sync if
 * that wording is ever revised (it should not be, without AllayPay's say-so).
 *
 * NOT YET WIRED TO THE THEME: header.php / footer.php still show the literal
 * placeholder phone, address and email baked in when the theme was generated
 * from src/data.js. This screen stores real values for when that gets wired
 * up (a small follow-up, not done here) and is where phase 9's pricing logic
 * will read its discount percentages from once it exists.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PPH_SETTINGS_OPTION', 'pph_settings' );

function pph_settings_defaults() {
	return array(
		'support_email'           => 'support@purelypeptideshub.com',
		'procurement_email'       => 'orders@purelypeptideshub.com',
		'phone'                   => '+1 (000) 000-0000',
		'address_line1'           => 'Address line 1',
		'address_line2'           => 'City, State ZIP',
		'address_country'         => 'United States',
		'hours'                   => 'Monday-Friday, 09:00-17:00 ET',
		'research_fields'         => implode(
			"\n",
			array(
				'Molecular Biology',
				'Biochemistry',
				'Peptide Chemistry',
				'Chemical Biology',
				'Biotechnology Research',
				'Academic Research',
				'Analytical Method Development',
				'Other institutional research',
			)
		),
		'restricted_states'       => "CA\nNY\nLA",
		'free_shipping_threshold' => '250',
		'volume_discount_5'       => '8',
		'volume_discount_10'      => '16',
		'subscription_discount'   => '10',
	);
}

/**
 * Read one setting, falling back to its documented default - a blank support
 * email is worse than a placeholder one.
 */
function pph_setting( $key ) {
	$all = get_option( PPH_SETTINGS_OPTION, array() );
	if ( isset( $all[ $key ] ) && '' !== $all[ $key ] ) {
		return $all[ $key ];
	}
	$defaults = pph_settings_defaults();
	return isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';
}

/**
 * `research_fields` and `restricted_states` are edited as one-per-line text -
 * easiest to type by hand - but every caller wants a clean array.
 */
function pph_setting_list( $key ) {
	$lines = preg_split( '/\r\n|\r|\n|,/', (string) pph_setting( $key ) );
	return array_values( array_filter( array_map( 'trim', $lines ) ) );
}

function pph_locked_disclaimers() {
	return array(
		'product' => 'All products currently listed on this site are for research purposes only.',
		'footer'  => 'All products sold on this website are intended for research and identification purposes only. These products are not intended for human dosing, injection, or ingestion.',
	);
}

add_action( 'admin_menu', 'pph_register_settings_page' );
function pph_register_settings_page() {
	add_menu_page(
		'PPH Settings',
		'PPH Settings',
		'manage_options',
		'pph-settings',
		'pph_render_settings_page',
		'dashicons-admin-generic',
		23
	);
}

function pph_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}

	$saved = false;
	if ( ! empty( $_POST['pph_settings_nonce'] ) && wp_verify_nonce( sanitize_key( $_POST['pph_settings_nonce'] ), 'pph_save_settings' ) ) {
		$values = array();
		foreach ( array_keys( pph_settings_defaults() ) as $key ) {
			$raw            = isset( $_POST[ 'pph_s_' . $key ] ) ? wp_unslash( $_POST[ 'pph_s_' . $key ] ) : '';
			$values[ $key ] = in_array( $key, array( 'research_fields', 'restricted_states' ), true )
				? sanitize_textarea_field( $raw )
				: sanitize_text_field( $raw );
		}
		update_option( PPH_SETTINGS_OPTION, $values );
		$saved = true;
	}

	$disclaimers = pph_locked_disclaimers();
	?>
	<div class="wrap">
		<h1>Purely Peptides Hub settings</h1>

		<?php if ( $saved ) : ?>
			<div class="notice notice-success"><p>Settings saved.</p></div>
		<?php endif; ?>

		<form method="post">
			<?php wp_nonce_field( 'pph_save_settings', 'pph_settings_nonce' ); ?>

			<h2>Contact details</h2>
			<p class="description">AllayPay require two real forms of contact published on the site.</p>
			<table class="form-table" role="presentation">
				<?php
				pph_settings_row( 'support_email', 'Support email', 'text' );
				pph_settings_row( 'procurement_email', 'Orders / procurement email', 'text' );
				pph_settings_row( 'phone', 'Phone', 'text' );
				pph_settings_row( 'address_line1', 'Address line 1', 'text' );
				pph_settings_row( 'address_line2', 'City, State, ZIP', 'text' );
				pph_settings_row( 'address_country', 'Country', 'text' );
				pph_settings_row( 'hours', 'Support hours', 'text' );
				?>
			</table>

			<h2>Checkout</h2>
			<table class="form-table" role="presentation">
				<?php
				pph_settings_row( 'research_fields', 'Research field options', 'textarea', 'One per line. Shown as the required dropdown at checkout.' );
				pph_settings_row( 'restricted_states', 'Restricted states', 'textarea', 'One per line, or comma separated. Orders shipping to these states are blocked at cart.' );
				?>
			</table>

			<h2>Pricing thresholds</h2>
			<p class="description">Placeholder values until the client confirms real figures - see CONVERSION-PLAN.md &sect;15.</p>
			<table class="form-table" role="presentation">
				<?php
				pph_settings_row( 'free_shipping_threshold', 'Free shipping threshold ($)', 'text' );
				pph_settings_row( 'volume_discount_5', 'Volume discount at 5+ units (%)', 'text' );
				pph_settings_row( 'volume_discount_10', 'Volume discount at 10+ units (%)', 'text' );
				pph_settings_row( 'subscription_discount', 'Subscription discount (%)', 'text' );
				?>
			</table>

			<?php submit_button( 'Save settings' ); ?>
		</form>

		<h2>Mandated wording (locked)</h2>
		<p class="description">
			Conditions of the AllayPay merchant account, not editable here - underwriting checks these
			verbatim, and rewording either one is a compliance risk, not a copy edit.
		</p>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">Per-product disclaimer</th>
				<td><textarea rows="2" class="large-text" readonly><?php echo esc_textarea( $disclaimers['product'] ); ?></textarea></td>
			</tr>
			<tr>
				<th scope="row">Footer disclaimer</th>
				<td><textarea rows="3" class="large-text" readonly><?php echo esc_textarea( $disclaimers['footer'] ); ?></textarea></td>
			</tr>
		</table>
	</div>
	<?php
}

function pph_settings_row( $key, $label, $type, $hint = '' ) {
	$id    = 'pph_s_' . $key;
	$value = pph_setting( $key );
	?>
	<tr>
		<th scope="row"><label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label></th>
		<td>
			<?php if ( 'textarea' === $type ) : ?>
				<textarea id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $id ); ?>" rows="6" class="large-text code"><?php echo esc_textarea( $value ); ?></textarea>
			<?php else : ?>
				<input type="text" id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $id ); ?>" value="<?php echo esc_attr( $value ); ?>" class="regular-text">
			<?php endif; ?>
			<?php if ( $hint ) : ?><p class="description"><?php echo esc_html( $hint ); ?></p><?php endif; ?>
		</td>
	</tr>
	<?php
}
