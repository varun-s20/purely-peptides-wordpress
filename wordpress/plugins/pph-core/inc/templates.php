<?php
/**
 * Template loading.
 *
 * Templates ship with the plugin so the content types keep working through a
 * theme change - but the theme wins if it carries a file of the same name, so
 * pph-child can override any of them later without touching the plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'template_include', 'pph_template_include' );
function pph_template_include( $template ) {
	$name = '';

	if ( is_singular( 'pph_coa' ) ) {
		$name = 'single-pph_coa.php';
	} elseif ( is_post_type_archive( 'pph_coa' ) ) {
		$name = 'archive-pph_coa.php';
	} elseif ( is_singular( 'pph_article' ) ) {
		$name = 'single-pph_article.php';
	} elseif ( is_post_type_archive( 'pph_article' ) ) {
		$name = 'archive-pph_article.php';
	}

	if ( ! $name ) {
		return $template;
	}

	$theme = locate_template( array( 'pph/' . $name ) );
	if ( $theme ) {
		return $theme;
	}

	$plugin = PPH_CORE_DIR . 'templates/' . $name;
	return file_exists( $plugin ) ? $plugin : $template;
}
