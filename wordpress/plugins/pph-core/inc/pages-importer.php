<?php
/**
 * Imports the prose pages exported by tools/export-wp-pages.js.
 *
 * Same three-piece shape as the certificate/article and product importers:
 * this function holds the logic, tools/import-wp-pages.php calls it from
 * WP-CLI, and inc/admin-import-pages.php calls it from a zip upload for
 * hosts with no SSH.
 *
 * Idempotent by slug: a re-export re-imports in place, which is how a copy
 * change (a new address, new wholesale terms) reaches pages that already
 * exist. It never deletes a page it did not create.
 *
 * @return array{log: string[], errors: string[], created: int, updated: int}
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function pph_run_pages_import( $dir ) {
	$log     = array();
	$errors  = array();
	$created = 0;
	$updated = 0;

	$manifest_file = rtrim( $dir, '/\\' ) . '/manifest.json';
	if ( ! file_exists( $manifest_file ) ) {
		$errors[] = 'No manifest.json in ' . $dir . ' - run: node tools/export-wp-pages.js';
		return compact( 'log', 'errors', 'created', 'updated' );
	}

	$manifest = json_decode( (string) file_get_contents( $manifest_file ), true );
	if ( ! $manifest ) {
		$errors[] = 'manifest.json could not be read as JSON.';
		return compact( 'log', 'errors', 'created', 'updated' );
	}

	/* Without this, wp_insert_post runs the body through kses and silently
	   strips <svg>, <button> and every data-* attribute - and data-* is how
	   public/js/script.js finds anything on the page. */
	kses_remove_filters();

	/* WordPress serves 404s from the theme's 404.php, not from a page. The
	   exported body is the source for pph-child/404.php; a published /404/
	   page would just be a duplicate that search engines can reach. */
	$skip = array( '404' );
	$ids  = array();

	foreach ( $manifest as $entry ) {
		$slug = isset( $entry['slug'] ) ? $entry['slug'] : '';
		if ( ! $slug || in_array( $slug, $skip, true ) ) {
			continue;
		}

		/* "wholesale/apply" becomes a child page of "wholesale". */
		$parts     = explode( '/', $slug );
		$leaf      = array_pop( $parts );
		$parent_id = 0;
		if ( $parts ) {
			$parent_slug = implode( '/', $parts );
			if ( empty( $ids[ $parent_slug ] ) ) {
				$parent = get_page_by_path( $parent_slug, OBJECT, 'page' );
				if ( ! $parent ) {
					$errors[] = sprintf( 'Parent page "%s" must be imported before "%s".', $parent_slug, $slug );
					continue;
				}
				$ids[ $parent_slug ] = $parent->ID;
			}
			$parent_id = $ids[ $parent_slug ];
		}

		$body = file_get_contents( rtrim( $dir, '/\\' ) . '/' . $entry['file'] );
		if ( false === $body || '' === trim( $body ) ) {
			$errors[] = 'Empty body for ' . $slug;
			continue;
		}

		/* A Custom HTML block. Keeps the markup exactly as exported - no
		   wpautop inserting <p> tags into the middle of a grid, no block
		   parser rewriting attributes - and still opens in the editor. */
		$content  = "<!-- wp:html -->\n" . $body . "\n<!-- /wp:html -->";
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
		} else {
			$id = wp_insert_post( $data, true );
		}

		if ( is_wp_error( $id ) ) {
			$errors[] = $slug . ': ' . $id->get_error_message();
			continue;
		}

		if ( $existing ) {
			$updated++;
		} else {
			$created++;
		}

		$ids[ $slug ] = $id;

		if ( ! empty( $entry['description'] ) ) {
			update_post_meta( $id, '_yoast_wpseo_metadesc', $entry['description'] );
		}

		$log[] = sprintf( '%-7s %-22s -> /%s/  (#%d)', $existing ? 'update' : 'create', $slug, $slug, $id );
	}

	return compact( 'log', 'errors', 'created', 'updated' );
}
