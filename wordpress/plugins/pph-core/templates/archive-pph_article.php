<?php
/**
 * The research library.
 *
 * Ported from src/pages/research.js library(). The featured article is the one
 * flagged Featured in the meta box, falling back to the most recent - the
 * static build hardcoded articles[0], which would go stale the first time the
 * owner published something.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$archive = get_post_type_archive_link( 'pph_article' );

$lead_q = get_posts(
	array(
		'post_type'      => 'pph_article',
		'posts_per_page' => 1,
		'meta_key'       => '_pph_featured',
		'meta_value'     => '1',
		'orderby'        => 'date',
		'order'          => 'DESC',
	)
);
if ( ! $lead_q ) {
	$lead_q = get_posts( array( 'post_type' => 'pph_article', 'posts_per_page' => 1 ) );
}
$lead    = $lead_q ? $lead_q[0] : null;
$lead_id = $lead ? $lead->ID : 0;
$total   = (int) wp_count_posts( 'pph_article' )->publish;

/* Topic tabs are built from the categories in use, so a new category appears
   without a developer. */
$categories = array();
foreach ( get_posts( array( 'post_type' => 'pph_article', 'posts_per_page' => -1, 'fields' => 'ids' ) ) as $aid ) {
	$c = pph_m( $aid, 'category' );
	if ( $c ) {
		$categories[ $c ] = true;
	}
}
$categories = array_keys( $categories );
sort( $categories );
$active_filter = isset( $_GET['filter'] ) ? sanitize_text_field( wp_unslash( $_GET['filter'] ) ) : '';

echo pph_crumbs(
	array(
		array( 'label' => 'Home', 'href' => home_url( '/' ) ),
		array( 'label' => 'Research' ),
	)
);
?>

<div class="pagehead">
  <div class="wrap">
    <span class="eyebrow">Research library</span>
    <h1>Research &amp; technical resources</h1>
    <p>
      Method notes, quality writing and handling guidance from the team that runs our analytical
      programme. Written for people who need the detail, not the summary.
    </p>
  </div>
</div>

<div class="wrap">
  <div class="tabs" style="margin-top:24px" role="tablist" aria-label="Filter by topic">
    <a href="<?php echo esc_url( $archive ); ?>" role="tab" aria-selected="<?php echo '' === $active_filter ? 'true' : 'false'; ?>">All</a>
    <?php foreach ( $categories as $c ) : ?>
      <a href="<?php echo esc_url( add_query_arg( 'filter', rawurlencode( $c ), $archive ) ); ?>" role="tab" aria-selected="<?php echo $active_filter === $c ? 'true' : 'false'; ?>"><?php echo esc_html( $c ); ?></a>
    <?php endforeach; ?>
  </div>
</div>

<?php if ( $lead && '' === $active_filter ) : ?>
<section class="section section--tight">
  <div class="wrap">
    <a href="<?php echo esc_url( get_permalink( $lead ) ); ?>" style="text-decoration:none;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:center" class="feature-lead">
      <div style="border:1px solid var(--rule);border-radius:var(--r-lg);overflow:hidden;background:var(--mist)">
        <?php echo pph_m( $lead_id, 'lead_html' ); ?>
      </div>
      <div>
        <span class="rcard__cat"><?php echo esc_html( pph_m( $lead_id, 'category' ) ); ?> &middot; Featured</span>
        <h2 style="margin-bottom:16px"><?php echo esc_html( get_the_title( $lead ) ); ?></h2>
        <p class="prose" style="font-size:1.0625rem;max-width:48ch"><?php echo esc_html( pph_m( $lead_id, 'abstract' ) ); ?></p>
        <div class="row" style="gap:20px;margin-top:24px">
          <span class="rcard__meta"><?php echo esc_html( pph_m( $lead_id, 'author' ) ); ?></span>
          <span class="rcard__meta"><?php echo esc_html( pph_m( $lead_id, 'date_label' ) ); ?></span>
          <span class="rcard__meta"><?php echo esc_html( pph_m( $lead_id, 'read_time' ) ); ?> read</span>
        </div>
        <span class="link-arrow" style="margin-top:20px"><span>Read article</span><?php echo pph_icon( 'arrow' ); ?></span>
      </div>
    </a>
  </div>
</section>
<?php endif; ?>

<section class="section section--tight">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <div class="section-head__text">
        <h2>All resources</h2>
        <p><?php echo (int) $total; ?> articles across methods, quality and handling.</p>
      </div>
    </div>

    <?php if ( ! have_posts() ) : ?>
      <div class="empty" style="margin:24px 0">
        <?php echo pph_icon( 'doc' ); ?>
        <h3>Nothing published under that topic yet</h3>
        <p><a class="link" href="<?php echo esc_url( $archive ); ?>">Show all articles</a>.</p>
      </div>
    <?php else : ?>
      <div class="grid grid-3">
        <?php
        while ( have_posts() ) :
        	the_post();
        	$aid = get_the_ID();

        	/* The featured article already has the whole block above it. */
        	if ( $aid === $lead_id && '' === $active_filter ) {
        		continue;
        	}
        	?>
          <a class="rcard" href="<?php the_permalink(); ?>">
            <div class="rcard__media"><?php echo pph_m( $aid, 'lead_html' ); ?></div>
            <span class="rcard__cat"><?php echo esc_html( pph_m( $aid, 'category' ) ); ?></span>
            <h3 class="rcard__title"><?php the_title(); ?></h3>
            <p class="rcard__excerpt"><?php echo esc_html( get_the_excerpt() ); ?></p>
            <div class="rcard__meta"><?php echo esc_html( pph_m( $aid, 'date_label' ) ); ?> &middot; <?php echo esc_html( pph_m( $aid, 'read_time' ) ); ?> read</div>
          </a>
        <?php endwhile; ?>
      </div>

      <?php
      $links = paginate_links( array( 'type' => 'array', 'prev_text' => 'Previous', 'next_text' => 'Next' ) );
      if ( $links ) :
      	?>
        <nav class="pager" aria-label="Pagination"><?php echo implode( '', $links ); ?></nav>
      <?php endif; ?>
    <?php endif; ?>
  </div>
</section>

<section class="section on-dark">
  <div class="wrap split split--even" style="align-items:center">
    <div>
      <span class="eyebrow">Technical enquiries</span>
      <h2>Question the library does not answer?</h2>
      <p style="margin-top:14px;max-width:44ch">
        Specification and method questions go to the analytical team directly. Include the product
        and, where relevant, the lot number.
      </p>
    </div>
    <div class="row" style="gap:12px">
      <a class="btn btn--onDark btn--lg" href="<?php echo esc_url( home_url( '/contact/?topic=product' ) ); ?>">Ask the analytical team</a>
      <a class="btn btn--outlineDark btn--lg" href="<?php echo esc_url( home_url( '/faq/' ) ); ?>">Read the FAQs</a>
    </div>
  </div>
</section>

<style>
@media (max-width: 900px) { .feature-lead { grid-template-columns: 1fr !important; gap: 24px !important; } }
</style>

<?php
get_footer();
