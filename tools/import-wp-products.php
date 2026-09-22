<?php
/**
 * CLI wrapper around pph_run_product_import().
 *
 *   wp eval-file tools/import-wp-products.php --user=1
 *
 * Requires WooCommerce active. The actual logic lives in the plugin, at
 * wordpress/plugins/pph-core/inc/product-importer.php - this script and the
 * in-admin zip uploader (Tools -> Import PPH Products) both call that same
 * function.
 *
 * Override the content location if only tools/ and wordpress/content/ were
 * uploaded to the server:
 *   PPH_CONTENT_DIR=/home/you/pph-content wp eval-file ... --user=1
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	exit( "Run through WP-CLI: wp eval-file tools/import-wp-products.php --user=1\n" );
}

if ( ! function_exists( 'pph_run_product_import' ) ) {
	WP_CLI::error( 'pph-core is not active. Activate the plugin first: wp plugin activate pph-core' );
}
if ( ! class_exists( 'WooCommerce' ) ) {
	WP_CLI::error( 'WooCommerce is not active. Install and activate it first: wp plugin install woocommerce --activate' );
}

$dir = getenv( 'PPH_CONTENT_DIR' ) ? rtrim( getenv( 'PPH_CONTENT_DIR' ), '/' ) : dirname( __DIR__ ) . '/wordpress/content';

if ( ! is_dir( $dir ) ) {
	WP_CLI::error( 'No content directory at ' . $dir . ' - upload wordpress/content/, or set PPH_CONTENT_DIR.' );
}

$result = pph_run_product_import( $dir );

foreach ( $result['log'] as $line ) {
	WP_CLI::log( '  ' . $line );
}
foreach ( $result['errors'] as $e ) {
	WP_CLI::warning( $e );
}

if ( $result['errors'] && ! $result['n_cat'] && ! $result['n_prod'] ) {
	WP_CLI::error( 'Import failed - see the warnings above.' );
}

WP_CLI::success( sprintf( '%d categories, %d products. Rewrite rules flushed.', $result['n_cat'], $result['n_prod'] ) );
WP_CLI::log( 'Check /products/ logged out, with caches purged. Default WooCommerce templates until phase 5.' );
