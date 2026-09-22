<?php
/**
 * Fallback template. Same shape as page.php.
 *
 * Deliberately bare: no wrapper, no container, no page title. The page body
 * carries its own <h1> and its own .wrap elements, exactly as the static build
 * does, so width and padding stay controlled by assets/css/styles.css and
 * nothing else. This is what makes imported pages full-bleed with no Elementor
 * layout settings involved.
 */

get_header();

while ( have_posts() ) :
	the_post();
	the_content();
endwhile;

get_footer();
