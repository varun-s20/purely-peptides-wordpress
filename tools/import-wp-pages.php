<?php
/**
 * Creates the static prose pages in WordPress from wordpress/pages/.
 *
 *   wp eval-file tools/import-wp-pages.php --user=1
 *
 * --user=1 matters. Without a user with `unfiltered_html`, wp_insert_post runs
 * the content through kses, which silently strips <svg>, <button> and every
 * data-* attribute - and data-* is how public/js/script.js finds anything.
 * kses_remove_filters() below covers it either way; the flag is belt and braces.
 *
 * Idempotent: run it again after re-exporting and it updates in place rather
 * than creating duplicates.
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	exit( "Run through WP-CLI: wp eval-file tools/import-wp-pages.php --user=1\n" );
}

kses_remove_filters();

/* Defaults to the repo layout. Override when only tools/ and the pages folder
   were uploaded to the server:
     PPH_PAGES_DIR=/home/you/pph-pages wp eval-file ... --user=1 */
$dir = getenv( 'PPH_PAGES_DIR' ) ? rtrim( getenv( 'PPH_PAGES_DIR' ), '/' ) : dirname( __DIR__ ) . '/wordpress/pages';

if ( ! is_dir( $dir ) ) {
	WP_CLI::error( 'No pages directory at ' . $dir . ' - upload wordpress/pages/, or set PPH_PAGES_DIR.' );
}

$manifest = json_decode( (string) file_get_contents( $dir . '/manifest.json' ), true );

if ( ! $manifest ) {
	WP_CLI::error( 'No manifest at ' . $dir . '/manifest.json - run: node tools/export-wp-pages.js' );
}

/* WordPress serves 404s from the theme's 404.php, not from a page. The exported
   body is the source for pph-child/404.php; a published /404/ page would just be
   a duplicate that search engines can reach. */
$skip = array( '404' );

$ids     = array();
$created = 0;
$updated = 0;

foreach ( $manifest as $entry ) {
	$slug = $entry['slug'];

	if ( in_array( $slug, $skip, true ) ) {
		WP_CLI::log( sprintf( '  skip    %-22s -> pph-child/404.php', $slug ) );
		continue;
	}

	/* "wholesale/apply" becomes a child page of "wholesale". */
	$parts     = explode( '/', $slug );
	$leaf      = array_pop( $parts );
	$parent_id = 0;
	if ( $parts ) {
		$parent_slug = implode( '/', $parts );
		if ( empty( $ids[ $parent_slug ] ) ) {
			WP_CLI::error( sprintf( 'Parent page "%s" must be imported before "%s"', $parent_slug, $slug ) );
		}
		$parent_id = $ids[ $parent_slug ];
	}

	$body = file_get_contents( $dir . '/' . $entry['file'] );
	if ( false === $body || '' === trim( $body ) ) {
		WP_CLI::error( 'Empty body for ' . $slug );
	}

	/* A Custom HTML block. Keeps the markup exactly as exported - no wpautop
	   inserting <p> tags into the middle of a grid, no block parser rewriting
	   attributes - and still opens in the editor. */
	$content = "<!-- wp:html -->\n" . $body . "\n<!-- /wp:html -->";

	$existing = get_page_by_path( $slug, OBJECT, 'page' );

	$data = array(
		'post_type'    => 'page',
		'post_name'    => $leaf,
		'post_title'   => $entry['title'],
		'post_content' => $content,
		'post_status'  => 'publish',
		'post_parent'  => $parent_id,
	);

	if ( $existing ) {
		$data['ID'] = $existing->ID;
		$id         = wp_update_post( $data, true );
		$updated++;
	} else {
		$id = wp_insert_post( $data, true );
		$created++;
	}

	if ( is_wp_error( $id ) ) {
		WP_CLI::error( $slug . ': ' . $id->get_error_message() );
	}

	$ids[ $slug ] = $id;

	if ( ! empty( $entry['description'] ) ) {
		update_post_meta( $id, '_yoast_wpseo_metadesc', $entry['description'] );
	}

	WP_CLI::log( sprintf( '  %-7s %-22s -> /%s/  (#%d)', $existing ? 'update' : 'create', $slug, $slug, $id ) );
}

WP_CLI::success( sprintf( '%d created, %d updated, %d skipped.', $created, $updated, count( $skip ) ) );
WP_CLI::log( 'Next: set the front page, then check one page logged out with caches purged.' );
