<?php
/**
 * Shared import logic for certificates and research articles.
 *
 * Used by both the WP-CLI script (tools/import-wp-content.php) and the
 * in-admin zip uploader (inc/admin-import.php), so there is exactly one place
 * that knows how to turn wordpress/content/*.json into posts. Whichever route
 * gets used, the result is identical.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create or update one post, matched by slug within its post type.
 *
 * @return array{ok?: string, error?: string}
 */
function pph_upsert_content_post( $post_type, $slug, array $postarr, array $meta ) {
	$existing = get_posts(
		array(
			'post_type'      => $post_type,
			'name'           => $slug,
			'posts_per_page' => 1,
			'post_status'    => 'any',
		)
	);

	$postarr = array_merge(
		$postarr,
		array(
			'post_type'   => $post_type,
			'post_name'   => $slug,
			'post_status' => 'publish',
		)
	);

	if ( $existing ) {
		$postarr['ID'] = $existing[0]->ID;
		$id            = wp_update_post( $postarr, true );
		$verb          = 'Updated';
	} else {
		$id   = wp_insert_post( $postarr, true );
		$verb = 'Created';
	}

	if ( is_wp_error( $id ) ) {
		return array( 'error' => $post_type . ' ' . $slug . ': ' . $id->get_error_message() );
	}

	foreach ( $meta as $key => $value ) {
		update_post_meta( $id, '_pph_' . $key, $value );
	}

	return array( 'ok' => sprintf( '%s %s -> %s', $verb, $slug, get_permalink( $id ) ) );
}

/**
 * Import every certificate and article found under $dir, which must contain
 * coa.json, articles.json, and an articles/ subfolder of prose bodies -
 * exactly what tools/export-wp-content.js produces.
 *
 * @return array{log: string[], errors: string[], n_coa: int, n_art: int}
 */
function pph_run_content_import( $dir ) {
	$log    = array();
	$errors = array();
	$n_coa  = 0;
	$n_art  = 0;

	$coa_file = $dir . '/coa.json';
	$art_file = $dir . '/articles.json';

	if ( ! file_exists( $coa_file ) ) {
		$errors[] = 'coa.json not found in ' . $dir;
	}
	if ( ! file_exists( $art_file ) ) {
		$errors[] = 'articles.json not found in ' . $dir;
	}
	if ( $errors ) {
		return compact( 'log', 'errors', 'n_coa', 'n_art' );
	}

	/* Without this, wp_insert_post() strips every <svg> and data-* attribute
	   from the article bodies unless the acting user has unfiltered_html. */
	kses_remove_filters();

	$coa        = json_decode( (string) file_get_contents( $coa_file ), true );
	$coa_fields = array_keys( pph_coa_fields() );

	foreach ( (array) $coa as $row ) {
		$meta = array();
		foreach ( $coa_fields as $key ) {
			$meta[ $key ] = isset( $row[ $key ] ) ? $row[ $key ] : '';
		}
		$r = pph_upsert_content_post( 'pph_coa', $row['slug'], array( 'post_title' => $row['lot'] ), $meta );
		if ( isset( $r['error'] ) ) {
			$errors[] = $r['error'];
		} else {
			$log[] = $r['ok'];
			$n_coa++;
		}
	}

	$articles       = json_decode( (string) file_get_contents( $art_file ), true );
	$article_fields = array_keys( pph_article_fields() );

	foreach ( (array) $articles as $row ) {
		$body_file = $dir . '/articles/' . $row['file'];
		$body      = file_exists( $body_file ) ? (string) file_get_contents( $body_file ) : '';

		if ( '' === trim( $body ) ) {
			$errors[] = 'Empty or missing body for article ' . $row['slug'];
			continue;
		}

		$meta = array();
		foreach ( $article_fields as $key ) {
			$value = isset( $row[ $key ] ) ? $row[ $key ] : '';
			if ( 'tags' === $key && is_array( $value ) ) {
				$value = implode( ', ', $value );
			}
			if ( 'refs' === $key && is_array( $value ) ) {
				$value = implode( "\n", $value );
			}
			if ( 'featured' === $key ) {
				$value = $value ? '1' : '';
			}
			$meta[ $key ] = $value;
		}

		$r = pph_upsert_content_post(
			'pph_article',
			$row['slug'],
			array(
				'post_title'   => $row['title'],
				'post_excerpt' => $row['excerpt'],
				'post_content' => $body,
				'post_date'    => $row['date'] . ' 09:00:00',
			),
			$meta
		);

		if ( isset( $r['error'] ) ) {
			$errors[] = $r['error'];
		} else {
			$log[] = $r['ok'];
			$n_art++;
		}
	}

	/* New post types need this or /certificates/<lot>/ 404s until somebody
	   happens to re-save the permalinks screen. */
	flush_rewrite_rules();

	return compact( 'log', 'errors', 'n_coa', 'n_art' );
}

/**
 * Search under $root for the directory that directly contains every file
 * named in $files. A zip can land either way - the folder's contents at the
 * top level, or wrapped in one extra folder - depending on how someone
 * selected files before compressing. This copes with either.
 */
function pph_find_dir_with_files( $root, array $files, $max_depth = 4 ) {
	$queue = array( array( $root, 0 ) );
	while ( $queue ) {
		list( $path, $depth ) = array_shift( $queue );

		$has_all = true;
		foreach ( $files as $f ) {
			if ( ! file_exists( $path . '/' . $f ) ) {
				$has_all = false;
				break;
			}
		}
		if ( $has_all ) {
			return $path;
		}

		if ( $depth >= $max_depth ) {
			continue;
		}
		foreach ( (array) glob( $path . '/*', GLOB_ONLYDIR ) as $sub ) {
			$queue[] = array( $sub, $depth + 1 );
		}
	}
	return null;
}

/** Back-compat name used by the certificate/article zip uploader. */
function pph_find_content_dir( $root, $max_depth = 4 ) {
	return pph_find_dir_with_files( $root, array( 'coa.json', 'articles.json' ), $max_depth );
}

function pph_rrmdir( $dir ) {
	if ( ! is_dir( $dir ) ) {
		return;
	}
	foreach ( scandir( $dir ) as $f ) {
		if ( '.' === $f || '..' === $f ) {
			continue;
		}
		$p = $dir . '/' . $f;
		is_dir( $p ) ? pph_rrmdir( $p ) : unlink( $p );
	}
	rmdir( $dir );
}
