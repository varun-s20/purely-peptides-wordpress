<?php
/**
 * Creates/updates the static prose pages in WordPress from wordpress/pages/.
 *
 *   wp eval-file tools/import-wp-pages.php --user=1
 *
 * --user=1 matters. Without a user with `unfiltered_html`, wp_insert_post runs
 * the content through kses, which silently strips <svg>, <button> and every
 * data-* attribute - and data-* is how public/js/script.js finds anything.
 * kses_remove_filters() inside the importer covers it either way; the flag is
 * belt and braces.
 *
 * The import itself lives in the plugin (pph-core/inc/pages-importer.php) so
 * this script and the Tools -> Import PPH Pages screen run identical code -
 * same split as the certificate/article and product importers.
 *
 * Idempotent: run it again after re-exporting and it updates in place rather
 * than creating duplicates.
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	exit( "Run through WP-CLI: wp eval-file tools/import-wp-pages.php --user=1\n" );
}

if ( ! function_exists( 'pph_run_pages_import' ) ) {
	WP_CLI::error( 'pph-core is not active - activate the plugin first.' );
}

/* Defaults to the repo layout. Override when only tools/ and the pages folder
   were uploaded to the server:
     PPH_PAGES_DIR=/home/you/pph-pages wp eval-file ... --user=1 */
$dir = getenv( 'PPH_PAGES_DIR' ) ? rtrim( getenv( 'PPH_PAGES_DIR' ), '/' ) : dirname( __DIR__ ) . '/wordpress/pages';

if ( ! is_dir( $dir ) ) {
	WP_CLI::error( 'No pages directory at ' . $dir . ' - upload wordpress/pages/, or set PPH_PAGES_DIR.' );
}

$result = pph_run_pages_import( $dir );

foreach ( $result['log'] as $line ) {
	WP_CLI::log( '  ' . $line );
}
foreach ( $result['errors'] as $error ) {
	WP_CLI::warning( $error );
}

if ( $result['errors'] ) {
	WP_CLI::error( sprintf( '%d problem(s) - see above.', count( $result['errors'] ) ) );
}

WP_CLI::success( sprintf( '%d created, %d updated.', $result['created'], $result['updated'] ) );
WP_CLI::log( 'Next: set the front page, then check one page logged out with caches purged.' );
