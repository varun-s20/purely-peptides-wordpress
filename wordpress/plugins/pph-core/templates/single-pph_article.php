<?php
/**
 * A single research article.
 *
 * Ported from src/pages/research.js articlePage(). The prose is post_content,
 * so the owner edits an article the way they would edit any page; everything
 * around it comes from the meta box.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();

	$id = get_the_ID();

	/* The stored body is pre-rendered HTML - headings, <figure> blocks, inline
	   <svg> charts - not typed prose. wpautop() auto-inserts <p> and <br> tags
	   around blank-line-separated text, which is right for what someone types
	   in the block editor and wrong for markup that is already fully formed;
	   it is the same reason the page importer wraps its bodies in a Custom
	   HTML block instead of letting them through the normal content pipeline.
	   Everything else in the filter chain (wptexturize's curly quotes,
	   shortcodes, embeds) still runs - only wpautop is skipped, and only for
	   this one render, so nothing else on the page is affected. */
	remove_filter( 'the_content', 'wpautop' );
	$content = apply_filters( 'the_content', get_the_content() );
	add_filter( 'the_content', 'wpautop' );

	$toc = pph_toc_from_content( $content );

	$refs = array_values(
		array_filter(
			array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) pph_m( $id, 'refs' ) ) )
		)
	);

	echo pph_crumbs(
		array(
			array( 'label' => 'Home', 'href' => home_url( '/' ) ),
			array( 'label' => 'Research', 'href' => get_post_type_archive_link( 'pph_article' ) ),
			array( 'label' => get_the_title() ),
		)
	);
	?>

<div class="wrap article__head">
  <span class="eyebrow"><?php echo esc_html( pph_m( $id, 'category' ) ); ?></span>
  <h1><?php the_title(); ?></h1>
  <div class="article__byline">
    <span><span class="label" style="display:inline">Author</span> <?php echo esc_html( pph_m( $id, 'author' ) ); ?>, <?php echo esc_html( pph_m( $id, 'role' ) ); ?></span>
    <span><span class="label" style="display:inline">Published</span> <span class="mono"><?php echo esc_html( pph_m( $id, 'date_label' ) ); ?></span></span>
    <span><span class="label" style="display:inline">Reading time</span> <span class="mono"><?php echo esc_html( pph_m( $id, 'read_time' ) ); ?></span></span>
  </div>
  <div class="article__lead"><?php echo pph_m( $id, 'lead_html' ); ?></div>
</div>

<div class="wrap article">
  <nav class="article__toc" aria-label="Article contents">
    <h2>Contents</h2>
    <?php foreach ( $toc as $i => $t ) : ?>
      <a href="#<?php echo esc_attr( $t['id'] ); ?>"<?php echo 0 === $i ? ' class="is-active"' : ''; ?>><?php echo esc_html( $t['label'] ); ?></a>
    <?php endforeach; ?>
    <?php if ( $refs ) : ?><a href="#references">References</a><?php endif; ?>
  </nav>

  <article>
    <p class="article__abstract"><?php echo esc_html( pph_m( $id, 'abstract' ) ); ?></p>
    <div class="prose"><?php echo $content; ?></div>

    <?php if ( $refs ) : ?>
      <h2 id="references" style="font-size:var(--t-h3);margin:56px 0 20px">References</h2>
      <ol class="refs">
        <?php foreach ( $refs as $r ) : ?>
          <li><span><?php echo esc_html( $r ); ?></span></li>
        <?php endforeach; ?>
      </ol>
    <?php endif; ?>

    <div style="margin-top:40px"><?php echo pph_research_notice( 'Technical writing on this site is provided for laboratory context. It does not describe or imply any use of these materials in humans or animals.' ); ?></div>
  </article>

  <aside class="article__aside">
    <?php
    /* Related materials needs WooCommerce. Until phase 4 the card is omitted
       rather than rendered empty. */
    if ( function_exists( 'wc_get_products' ) ) :
    	$related_products = wc_get_products( array( 'limit' => 3, 'status' => 'publish' ) );
    	if ( $related_products ) :
    		?>
      <div class="card" style="padding:20px">
        <span class="label">Related materials</span>
        <ul style="list-style:none;padding:0;margin:12px 0 0;display:grid;gap:2px">
          <?php foreach ( $related_products as $p ) : ?>
            <li><a href="<?php echo esc_url( $p->get_permalink() ); ?>" style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--rule);text-decoration:none;font-size:var(--t-small)">
              <span><?php echo esc_html( $p->get_name() ); ?></span><span class="mono micro muted"><?php echo esc_html( $p->get_sku() ); ?></span></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
    		<?php
    	endif;
    endif;
    ?>

    <div class="card" style="padding:20px">
      <span class="label">Related documentation</span>
      <p class="small muted" style="margin-top:10px">Search certificates by product or lot number.</p>
      <a class="btn btn--secondary btn--block" style="margin-top:14px" href="<?php echo esc_url( get_post_type_archive_link( 'pph_coa' ) ); ?>">Certificate library</a>
    </div>

    <?php
    $more = get_posts(
    	array(
    		'post_type'      => 'pph_article',
    		'posts_per_page' => 2,
    		'post__not_in'   => array( $id ),
    		'orderby'        => 'date',
    		'order'          => 'DESC',
    	)
    );
    if ( $more ) :
    	?>
      <div class="card" style="padding:20px">
        <span class="label">Continue reading</span>
        <ul style="list-style:none;padding:0;margin:12px 0 0;display:grid;gap:12px">
          <?php foreach ( $more as $r ) : ?>
            <li><a href="<?php echo esc_url( get_permalink( $r ) ); ?>" style="text-decoration:none;font-size:var(--t-small);font-weight:500;line-height:1.4"><?php echo esc_html( get_the_title( $r ) ); ?></a>
              <div class="rcard__meta" style="margin-top:4px"><?php echo esc_html( pph_m( $r->ID, 'category' ) ); ?></div></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>
  </aside>
</div>

	<?php
endwhile;

get_footer();
