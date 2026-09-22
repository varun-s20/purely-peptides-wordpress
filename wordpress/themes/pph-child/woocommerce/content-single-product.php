<?php
/**
 * A single product page.
 *
 * Ported from src/pages/product.js. This overrides WooCommerce's
 * content-single-product.php specifically (not single-product.php itself),
 * so header.php/footer.php still run exactly as WooCommerce's own wrapper
 * template calls them - only the content in between is ours.
 *
 * The purchase box is the static design's own markup - size picker, quantity
 * stepper, volume ladder, stacked-price panel - driven by public/js/script.js
 * with no JS changes, and wrapped in a real WooCommerce add-to-cart form so
 * the variation shown is the variation bought. See pph_render_purchase_box()
 * in the plugin's inc/wc-helpers.php.
 *
 * The volume ladder is honoured for real at checkout (inc/pricing.php), so
 * its arithmetic is true rather than painted on. Subscribe & Save renders
 * disabled until phase 9 builds the subscription engine - a quoted price the
 * checkout will not charge is a misrepresentation, not a styling gap.
 */

defined( 'ABSPATH' ) || exit;

global $product;
/* No the_post() here - WooCommerce's own single-product.php wrapper already
   called it once, in its own `while ( have_posts() ) : the_post();` loop,
   before handing off to this file via wc_get_template_part(). A singular
   query holds exactly one post; calling the_post() a second time advances the
   loop pointer past it, and get_the_ID() then returns nothing - which is why
   this page rendered header and footer (from the outer wrapper) but no
   content at all. get_queried_object_id() is correct on any singular
   template regardless of the loop pointer's state, so it is used everywhere
   below instead of get_the_ID(). */

if ( post_password_required() ) {
	echo get_the_password_form(); // phpcs:ignore WordPress.Security.EscapeOutput
	return;
}

$product = wc_get_product( get_queried_object_id() );
if ( ! $product ) {
	echo '<div class="wrap" style="padding-block:48px"><p class="notice notice--warn">Product data could not be loaded for this page. If you are seeing this, tell the developer - this should never render in place of a real product.</p></div>';
	return;
}

$id        = $product->get_id();
$cat_terms = wp_get_post_terms( $id, 'product_cat' );
$cat_name  = $cat_terms ? $cat_terms[0]->name : 'Research material';
$cat_slug  = $cat_terms ? $cat_terms[0]->slug : '';
$area      = pph_m( $id, 'area' );
$stock     = pph_product_stock_state( $product );
$lead      = pph_product_lead_variation( $product );
$sizes     = pph_product_size_labels( $product );
$has_coa   = pph_product_has_coa( $id );
$current   = pph_product_current_lot_post( $product );
$pending   = pph_product_pending_lots( $product );
$sds_url   = pph_m( $id, 'sds_url' );
$sds_ref   = pph_m( $id, 'sds_ref' );
$verify    = (bool) pph_m( $id, 'verify' );
$related   = pph_related_products( $product, 4 );

echo pph_crumbs(
	array(
		array( 'label' => 'Home', 'href' => home_url( '/' ) ),
		array( 'label' => 'Products', 'href' => get_permalink( wc_get_page_id( 'shop' ) ) ),
		array( 'label' => $cat_name, 'href' => $cat_slug ? get_term_link( $cat_slug, 'product_cat' ) : '' ),
		array( 'label' => $product->get_name() ),
	)
);
?>

<div class="wrap pdp">
	<?php echo pph_product_gallery( $product ); ?>

	<div class="pdp__buybox">
		<span class="tag"><?php echo esc_html( $cat_name . ' · ' . $area ); ?></span>
		<h1 class="pdp__title"><?php echo esc_html( $product->get_name() ); ?></h1>
		<p class="lede" style="font-size:var(--t-body)"><?php echo esc_html( $product->get_short_description() ); ?></p>

		<div class="pdp__ids">
			<div class="pdp__id"><span class="label">SKU</span><span class="mono"><?php echo esc_html( $product->get_sku() ); ?></span></div>
			<div class="pdp__id"><span class="label">CAS</span><span class="mono"><?php echo esc_html( pph_m( $id, 'cas' ) ); ?></span></div>
			<div class="pdp__id"><span class="label">Form</span><span class="mono"><?php echo esc_html( str_replace( ' powder', '', pph_m( $id, 'form' ) ) ); ?></span></div>
			<div class="pdp__id"><span class="label">Purity</span><span class="mono"><?php echo esc_html( pph_m( $id, 'purity' ) ); ?></span></div>
		</div>

		<div class="row" style="gap:8px;margin-bottom:20px">
			<?php
			echo pph_stock_badge( $stock );
			echo $has_coa
				? '<span class="status status--ok">' . pph_icon( 'doc' ) . 'Lab report available</span>'
				: '<span class="status status--warn">' . pph_icon( 'clock' ) . 'Lab report pending</span>';
			if ( $current ) {
				echo '<span class="status status--flat">' . pph_icon( 'box' ) . 'Current lot ' . esc_html( pph_m( $current->ID, 'lot' ) ) . '</span>';
			}
			if ( $sds_url ) {
				echo '<span class="status status--flat">' . pph_icon( 'doc' ) . 'SDS on file</span>';
			}
			?>
		</div>

		<?php echo pph_render_purchase_box( $product ); ?>

		<ul class="pdp__assur" style="list-style:none;padding:0">
			<li><?php echo pph_icon( 'doc' ); ?>Lot documentation issued for the vial you receive</li>
			<li><?php echo pph_icon( 'lock' ); ?>Secure checkout, purchase orders accepted on account</li>
			<li><?php echo pph_icon( 'truck' ); ?>Tracked despatch from our US facility, next business day</li>
		</ul>

		<div class="pdp__wholesale">
			<span>Need bulk quantities or a purchase order?</span>
			<a class="link-arrow" href="<?php echo esc_url( home_url( '/wholesale/' ) ); ?>"><span>Wholesale options</span><?php echo pph_icon( 'arrow' ); ?></a>
		</div>

		<!-- Exact per-product wording required by our payment processor. Every
		     product page must carry it verbatim. Do not reword or abbreviate. -->
		<p class="pdp__ruo"><?php echo esc_html( pph_locked_disclaimers()['product'] ); ?></p>
		<div style="margin-top:16px"><?php echo pph_research_notice( 'This material is supplied for laboratory, academic and institutional research by qualified professionals. It is not for human dosing, injection or ingestion, not for veterinary use, and no therapeutic, performance or health claim is made or implied.' ); ?></div>
		<?php if ( $verify ) : ?>
			<div class="notice" style="margin-top:12px"><?php echo pph_icon( 'info' ); ?><div><strong>Identity data pending.</strong> CAS number, molecular formula and molecular weight for this material are being confirmed with the supplier and will be published here with the first release lot.</div></div>
		<?php endif; ?>
	</div>
</div>

<nav class="subnav" aria-label="Product sections">
	<div class="wrap subnav__inner">
		<div class="subnav__links" data-subnav>
			<a href="#overview" class="is-active">Overview</a>
			<a href="#specifications">Specifications</a>
			<a href="#documentation">Batch documentation</a>
			<a href="#research">Research</a>
			<a href="#storage">Storage</a>
			<a href="#shipping">Shipping</a>
			<a href="#faqs">FAQs</a>
		</div>
		<div class="subnav__buy">
			<span class="mono small nowrap"><?php echo wc_price( $lead['price'] ); ?> / <?php echo esc_html( $lead['label'] ); ?></span>
			<button class="btn btn--primary btn--sm" type="button" data-add-to-order data-quick data-slug="<?php echo esc_attr( $product->get_slug() ); ?>" data-name="<?php echo esc_attr( $product->get_name() ); ?>">Add to order</button>
		</div>
	</div>
</nav>

<div class="wrap">
	<section class="pdp-section" id="overview" style="border-top:0">
		<h2>Overview</h2>
		<div class="split">
			<div>
				<p class="prose" style="max-width:64ch"><?php echo esc_html( $product->get_description() ); ?></p>
				<p class="small muted" style="margin-top:20px;max-width:64ch">
					Descriptions summarise published literature for orientation only. They are not claims about
					the performance, safety or effect of this material in any system.
				</p>
			</div>
			<div>
				<div class="card" style="padding:24px">
					<span class="label">At a glance</span>
					<dl style="margin:14px 0 0;display:grid;gap:12px">
						<?php
						foreach (
							array(
								array( 'Research area', $area ),
								array( 'Molecular weight', pph_m( $id, 'mw' ) ),
								array( 'Reported purity', pph_m( $id, 'purity' ) ),
								array( 'Method', pph_m( $id, 'method' ) ),
							) as $pair
						) :
							?>
							<div style="display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid var(--rule);padding-bottom:10px">
								<dt class="small muted"><?php echo esc_html( $pair[0] ); ?></dt><dd class="mono small" style="margin:0;text-align:right"><?php echo esc_html( $pair[1] ); ?></dd>
							</div>
						<?php endforeach; ?>
					</dl>
				</div>
			</div>
		</div>
	</section>

	<section class="pdp-section" id="specifications">
		<h2>Specifications</h2>
		<table class="spec">
			<caption>Specification values apply to the current production lot unless stated otherwise.</caption>
			<tbody>
				<tr><th scope="row">Product name</th><td><?php echo esc_html( $product->get_name() ); ?></td></tr>
				<tr><th scope="row">Purely Peptides Hub SKU</th><td><span class="mono"><?php echo esc_html( $product->get_sku() ); ?></span></td></tr>
				<tr><th scope="row">CAS number</th><td><span class="mono"><?php echo esc_html( pph_m( $id, 'cas' ) ); ?></span></td></tr>
				<tr><th scope="row">Molecular formula</th><td><span class="mono"><?php echo esc_html( pph_m( $id, 'formula' ) ); ?></span></td></tr>
				<tr><th scope="row">Molecular weight</th><td><span class="mono"><?php echo esc_html( pph_m( $id, 'mw' ) ); ?></span></td></tr>
				<tr><th scope="row">Sequence</th><td><span class="mono" style="font-size:var(--t-micro);line-height:1.7;word-break:break-word"><?php echo esc_html( pph_m( $id, 'sequence' ) ); ?></span></td></tr>
				<tr><th scope="row">Physical form</th><td><?php echo esc_html( pph_m( $id, 'form' ) ); ?></td></tr>
				<tr><th scope="row">Purity (reported)</th><td><span class="mono"><?php echo esc_html( pph_m( $id, 'purity' ) ); ?></span> - <?php echo esc_html( pph_m( $id, 'method' ) ); ?></td></tr>
				<tr><th scope="row">Available sizes</th><td><?php echo esc_html( implode( ', ', $sizes ) ); ?></td></tr>
				<tr><th scope="row">Storage</th><td><?php echo esc_html( pph_m( $id, 'storage' ) ); ?></td></tr>
				<tr>
					<th scope="row">Safety data sheet</th>
					<td>
						<?php if ( $sds_url ) : ?>
							<a class="link" href="<?php echo esc_url( $sds_url ); ?>" target="_blank" rel="noopener">Download SDS (PDF)</a> <span class="muted small">&middot; <?php echo esc_html( $sds_ref ); ?></span>
						<?php else : ?>
							<span class="muted">Being prepared - available on request</span>
						<?php endif; ?>
					</td>
				</tr>
				<tr>
					<th scope="row">Certificate of analysis</th>
					<td>
						<?php if ( $current ) : ?>
							<a class="link" href="<?php echo esc_url( get_permalink( $current ) ); ?>">Lot <?php echo esc_html( pph_m( $current->ID, 'lot' ) ); ?></a>
						<?php else : ?>
							<span class="muted">Pending for the current lot</span>
						<?php endif; ?>
					</td>
				</tr>
				<tr><th scope="row">Intended use</th><td>Laboratory, academic and institutional research use only. Not for human dosing, injection or ingestion.</td></tr>
			</tbody>
		</table>
	</section>

	<section class="pdp-section" id="documentation">
		<h2>Batch documentation</h2>
		<p class="muted" style="max-width:64ch;margin-bottom:24px">
			Testing is recorded against the production lot. The lot currently shipping for this product is shown below.
		</p>

		<?php if ( $current ) : ?>
			<div class="lotpanel">
				<div class="lotpanel__data">
					<div class="row" style="justify-content:space-between;margin-bottom:20px">
						<div>
							<span class="label">Current lot</span>
							<strong class="mono" style="font-size:var(--t-h3)"><?php echo esc_html( pph_m( $current->ID, 'lot' ) ); ?></strong>
						</div>
						<span class="status status--ok"><?php echo pph_icon( 'checkCircle' ); ?>Verified</span>
					</div>
					<div class="lotpanel__grid">
						<div><span class="label">Method</span><div class="lotpanel__val"><?php echo esc_html( pph_m( $current->ID, 'method' ) ); ?></div></div>
						<div><span class="label">Reported purity</span><div class="lotpanel__val"><?php echo esc_html( pph_m( $current->ID, 'purity' ) ); ?></div></div>
						<div><span class="label">Identity</span><div class="lotpanel__val" style="font-size:var(--t-small)"><?php echo esc_html( pph_m( $current->ID, 'identity' ) ); ?></div></div>
						<div><span class="label">Test date</span><div class="lotpanel__val" style="font-size:var(--t-small)"><?php echo esc_html( pph_m( $current->ID, 'date' ) ); ?></div></div>
					</div>
					<div class="lotpanel__trace" data-graph>
						<span class="label" style="margin-bottom:8px">Schematic &middot; measured trace is in the certificate</span>
						<?php echo pph_chromatogram_svg( 620, 110 ); ?>
					</div>
				</div>
				<div class="lotpanel__aside">
					<span class="label">Certificate</span>
					<p class="small muted">Issued <?php echo esc_html( pph_m( $current->ID, 'date' ) ); ?> by <?php echo esc_html( pph_m( $current->ID, 'lab' ) ); ?>, an independent analytical laboratory.</p>
					<a class="btn btn--primary btn--block" href="<?php echo esc_url( get_permalink( $current ) ); ?>">View certificate</a>
					<a class="btn btn--secondary btn--block" href="<?php echo esc_url( pph_m( $current->ID, 'doc_url' ) ); ?>" target="_blank" rel="noopener"><?php echo pph_icon( 'download' ); ?> Download <?php echo esc_html( pph_m( $current->ID, 'doc_type' ) ); ?></a>
					<?php if ( $sds_url ) : ?>
						<a class="btn btn--secondary btn--block" href="<?php echo esc_url( $sds_url ); ?>" target="_blank" rel="noopener"><?php echo pph_icon( 'download' ); ?> Safety data sheet</a>
					<?php endif; ?>
					<a class="link-arrow" style="margin-top:8px" href="<?php echo esc_url( add_query_arg( 'product', $product->get_name(), get_post_type_archive_link( 'pph_coa' ) ) ); ?>"><span>View documentation for this product</span><?php echo pph_icon( 'arrow' ); ?></a>
				</div>
			</div>
		<?php else : ?>
			<div class="notice notice--warn">
				<?php echo pph_icon( 'clock' ); ?>
				<div>
					<strong>A lab report for the current lot is not yet published.</strong>
					Testing documentation for this material is being issued and will appear here, and in the
					<a class="link" href="<?php echo esc_url( get_post_type_archive_link( 'pph_coa' ) ); ?>">certificate library</a>, as soon as it is released.
					<?php if ( $sds_url ) : ?>
						The <a class="link" href="<?php echo esc_url( $sds_url ); ?>" target="_blank" rel="noopener">safety data sheet</a> is available now.
					<?php endif; ?>
					Ask the documentation team for an expected date before ordering.
				</div>
			</div>
		<?php endif; ?>

		<?php if ( $pending ) : ?>
			<h3 style="margin:40px 0 12px;font-size:var(--t-h4)">Lots awaiting documentation</h3>
			<p class="small muted" style="max-width:64ch;margin-bottom:16px">These lots appear in current inventory. Their certificates have not been issued to us yet, so they are listed here rather than shown as documented.</p>
			<ul class="taglist">
				<?php foreach ( $pending as $pl ) : ?>
					<li class="tag"><?php echo esc_html( $pl['lot'] . ' · ' . $pl['size'] ); ?></li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</section>

	<section class="pdp-section" id="research">
		<h2>Related research</h2>
		<div class="grid grid-3" style="margin-top:24px">
			<?php
			foreach ( get_posts( array( 'post_type' => 'pph_article', 'posts_per_page' => 3 ) ) as $a ) :
				$aid = $a->ID;
				?>
				<a class="rcard" href="<?php echo esc_url( get_permalink( $a ) ); ?>">
					<div class="rcard__media"><?php echo pph_m( $aid, 'lead_html' ); ?></div>
					<span class="rcard__cat"><?php echo esc_html( pph_m( $aid, 'category' ) ); ?></span>
					<h3 class="rcard__title"><?php echo esc_html( get_the_title( $a ) ); ?></h3>
					<p class="rcard__excerpt"><?php echo esc_html( get_the_excerpt( $a ) ); ?></p>
					<div class="rcard__meta"><?php echo esc_html( pph_m( $aid, 'date_label' ) ); ?> &middot; <?php echo esc_html( pph_m( $aid, 'read_time' ) ); ?> read</div>
				</a>
			<?php endforeach; ?>
		</div>
	</section>

	<section class="pdp-section" id="storage">
		<h2>Storage &amp; handling</h2>
		<div class="grid grid-3" style="margin-top:24px">
			<div class="icard"><div style="color:var(--verdigris)"><?php echo pph_icon( 'thermometer' ); ?></div><h3>Long-term storage</h3><p><?php echo esc_html( pph_m( $id, 'storage' ) ); ?>. Lyophilised material is stable under these conditions for the period stated on the certificate.</p></div>
			<div class="icard"><div style="color:var(--verdigris)"><?php echo pph_icon( 'flask' ); ?></div><h3>After reconstitution</h3><p>Store the solution at 2&ndash;8 &deg;C for short-term use, or in aliquots below &minus;20 &deg;C. Avoid repeated freeze-thaw cycles.</p></div>
			<div class="icard"><div style="color:var(--verdigris)"><?php echo pph_icon( 'clock' ); ?></div><h3>On arrival</h3><p>Centrifuge briefly before opening. Allow sealed vials to reach room temperature before breaking the seal to limit condensation.</p></div>
		</div>
	</section>

	<section class="pdp-section" id="shipping">
		<h2>Shipping</h2>
		<div class="split split--even" style="margin-top:24px">
			<div class="stack-3">
				<p class="muted">Orders placed before 14:00 ET on a business day are despatched the same day from our US facility. Tracking is issued on despatch and recorded against the order in your account.</p>
				<table class="spec">
					<tbody>
						<tr><th scope="row">Domestic (US)</th><td>1&ndash;3 business days, tracked</td></tr>
						<tr><th scope="row">International</th><td>3&ndash;7 business days, tracked, import documentation included</td></tr>
						<tr><th scope="row">Cold chain</th><td>Available on request at checkout</td></tr>
						<tr><th scope="row">Packaging</th><td>Sealed vial, desiccant, tamper-evident outer</td></tr>
					</tbody>
				</table>
			</div>
			<div>
				<div class="notice"><?php echo pph_icon( 'info' ); ?><div>Some materials cannot be shipped to every destination. Restrictions are applied at checkout once a delivery address is entered. See <a class="link" href="<?php echo esc_url( home_url( '/shipping/' ) ); ?>">shipping &amp; returns</a>.</div></div>
			</div>
		</div>
	</section>

	<section class="pdp-section" id="faqs">
		<h2>Frequently asked questions</h2>
		<div style="max-width:820px;margin-top:24px"><?php echo pph_accordion( pph_product_faqs( $product ), 'pdp-faq' ); ?></div>
	</section>

	<?php if ( $related ) : ?>
		<section class="pdp-section">
			<h2>Related research materials</h2>
			<div class="grid grid-4" style="margin-top:24px">
				<?php foreach ( $related as $rp ) : echo pph_product_card( $rp ); endforeach; ?>
			</div>
		</section>
	<?php endif; ?>
</div>

<div class="pdp-sticky">
	<div style="flex:1;min-width:0">
		<div class="pdp-sticky__price"><?php echo wc_price( $lead['price'] ); ?></div>
		<div class="pdp-sticky__name"><?php echo esc_html( $product->get_name() . ' · ' . $lead['label'] ); ?></div>
	</div>
	<button class="btn btn--primary" type="button" data-add-to-order data-quick data-slug="<?php echo esc_attr( $product->get_slug() ); ?>" data-name="<?php echo esc_attr( $product->get_name() ); ?>">Add to order</button>
</div>
