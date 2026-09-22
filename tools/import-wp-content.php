<?php
/**
 * CLI wrapper around pph_run_content_import().
 *
 *   wp eval-file tools/import-wp-content.php --user=1
 *
 * The actual import logic lives in the plugin, at
 * wordpress/plugins/pph-core/inc/importer.php - this script and the in-admin
 * zip uploader (Tools -> Import PPH Content) both call that same function, so
 * there is exactly one place that knows how to turn coa.json / articles.json
 * into posts, and the two import routes cannot drift apart.
 *
 * --user=1 matters: pph_run_content_import() removes the kses filters, but a
 * post still needs an acting user with unfiltered_html for that to take full
 * effect under wp eval-file, which otherwise runs with no current user.
 *
 * Override the content location if only tools/ and wordpress/content/ were
 * uploaded to the server, rather than the whole repo:
 *   PPH_CONTENT_DIR=/home/you/pph-content wp eval-file ... --user=1
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	exit( "Run through WP-CLI: wp eval-file tools/import-wp-content.php --user=1\n" );
}

if ( ! function_exists( 'pph_run_content_import' ) ) {
	WP_CLI::error( 'pph-core is not active. Activate the plugin first: wp plugin activate pph-core' );
}

$dir = getenv( 'PPH_CONTENT_DIR' ) ? rtrim( getenv( 'PPH_CONTENT_DIR' ), '/' ) : dirname( __DIR__ ) . '/wordpress/content';

if ( ! is_dir( $dir ) ) {
	WP_CLI::error( 'No content directory at ' . $dir . ' - upload wordpress/content/, or set PPH_CONTENT_DIR.' );
}

$result = pph_run_content_import( $dir );

foreach ( $result['log'] as $line ) {
	WP_CLI::log( '  ' . $line );
}
foreach ( $result['errors'] as $e ) {
	WP_CLI::warning( $e );
}

if ( $result['errors'] && ! $result['n_coa'] && ! $result['n_art'] ) {
	WP_CLI::error( 'Import failed - see the warnings above.' );
}

WP_CLI::success( sprintf( '%d certificates, %d articles. Rewrite rules flushed.', $result['n_coa'], $result['n_art'] ) );
WP_CLI::log( 'Check /certificates/ and /research/ logged out, with caches purged.' );
