<?php
/**
 * Woo's own optional "Terms and conditions" checkbox would render here
 * whenever a Terms page is set under WooCommerce > Settings > Advanced -
 * deliberately never rendered. `pph_add_acknowledgement_fields()` in
 * inc/checkout.php already adds `pph_ack_terms`, covering the exact same
 * ground with the same wording ("terms and conditions of purchase, the
 * privacy policy, the refund and returns policy, the chargeback policy and
 * the research use policy"), with its own timestamp captured on the order.
 * That field is what this store's checkout actually requires and records;
 * this one would just be a second, redundant "accept terms" checkbox the day
 * anyone ever sets that WooCommerce setting - not a hypothetical worth
 * leaving for whoever configures Settings > Advanced later to rediscover.
 * `wc_terms_and_conditions_checkbox_enabled()` is intentionally not consulted
 * at all, so nothing here depends on that setting staying off.
 */

defined( 'ABSPATH' ) || exit;

if ( wc_terms_and_conditions_page_id() ) {
	wc_terms_and_conditions_page_content();
}
