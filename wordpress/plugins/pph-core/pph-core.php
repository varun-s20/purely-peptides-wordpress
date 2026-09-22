<?php
/**
 * Plugin Name:       Purely Peptides Hub Core
 * Description:       Certificates of analysis, research articles and the site's own content types. Lives in a plugin, not the theme, so a theme change cannot take the client's documentation with it.
 * Version:           0.1.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            Digital Heroes
 * Text Domain:       pph-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PPH_CORE_VERSION', '0.1.0' );
define( 'PPH_CORE_DIR', plugin_dir_path( __FILE__ ) );

require_once PPH_CORE_DIR . 'inc/icons.php';
require_once PPH_CORE_DIR . 'inc/helpers.php';
require_once PPH_CORE_DIR . 'inc/meta.php';
require_once PPH_CORE_DIR . 'inc/settings.php';
require_once PPH_CORE_DIR . 'inc/cpt.php';
require_once PPH_CORE_DIR . 'inc/templates.php';
require_once PPH_CORE_DIR . 'inc/importer.php';

/* WooCommerce product spec fields (CAS, formula, purity...) and the product/
   category importer. Both guard their WooCommerce calls at run time, not load
   time, so they are safe to require even before WooCommerce is installed -
   the meta box and import screens simply do nothing useful until it is. */
require_once PPH_CORE_DIR . 'inc/product-meta.php';
require_once PPH_CORE_DIR . 'inc/product-importer.php';
require_once PPH_CORE_DIR . 'inc/wc-helpers.php';
require_once PPH_CORE_DIR . 'inc/pricing.php';
require_once PPH_CORE_DIR . 'inc/catalogue.php';
require_once PPH_CORE_DIR . 'inc/cart-api.php';
require_once PPH_CORE_DIR . 'inc/checkout.php';
require_once PPH_CORE_DIR . 'inc/account.php';

/* Build-time convenience: zip-upload screens under Tools, for hosts with no
   SSH / WP-CLI. Remove these two requires and their files before handover -
   see admin-import.php's header. */
require_once PPH_CORE_DIR . 'inc/admin-import.php';
require_once PPH_CORE_DIR . 'inc/admin-import-products.php';

/**
 * The post types register their own rewrite rules, and WordPress only rebuilds
 * those when it is told to. Without this, /certificates/bp10-0318/ is a 404
 * until somebody happens to re-save the permalinks screen.
 */
register_activation_hook( __FILE__, 'pph_core_activate' );
function pph_core_activate() {
	pph_register_post_types();
	flush_rewrite_rules();
}

register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
