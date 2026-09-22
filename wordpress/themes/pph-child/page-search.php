<?php
/**
 * The search page - /search/.
 *
 * Ported from src/pages/catalog.js searchPage(). Same discovery as the shop
 * page's filtering: public/js/catalog.js's search logic already works by
 * matching plain text on whatever rows/cards are in the DOM - "the whole
 * corpus is in the page; the query filters it," per its own comment - so this
 * needs no new JS, only server-rendering every product row, certificate row
 * and article card once, from live data instead of the static build's.
 *
 * WordPress applies this template automatically to the Page at /search/,
 * created if missing by inc/cpt.php's pph_ensure_search_page_exists().
 */

get_header();

$products = wc_get_products( array( 'limit' => -1, 'status' => 'publish' ) );
$coas     = get_posts( array( 'post_type' => 'pph_coa', 'posts_per_page' => -1, 'meta_key' => '_pph_lot', 'orderby' => 'meta_value', 'order' => 'ASC' ) );
$articles = get_posts( array( 'post_type' => 'pph_article', 'posts_per_page' => -1 ) );

echo pph_crumbs( array(
	array( 'label' => 'Home', 'href' => home_url( '/' ) ),
	array( 'label' => 'Search' ),
) );
?>

<div class="pagehead">
	<div class="wrap">
		<h1>Search</h1>
		<p>
			<span class="results-count" data-search-count><?php echo count( $products ) + count( $coas ) + count( $articles ); ?> results</span>
			<strong class="mono" style="font-size:var(--t-body-lg)" data-search-echo></strong>
		</p>
		<form class="searchbar" action="<?php echo esc_url( home_url( '/search/' ) ); ?>" method="get" role="search" style="max-width:620px;margin-top:20px" data-search-form>
			<span class="searchbar__icon"><?php echo pph_icon( 'search' ); ?></span>
			<label class="visually-hidden" for="sp">Search the catalogue</label>
			<input id="sp" name="q" type="search" data-search-input autocomplete="off"
				placeholder="Search products, CAS, SKU, articles or lot numbers">
			<button class="btn btn--dark" type="submit">Search</button>
		</form>
	</div>
</div>

<div class="wrap searchpage">
	<div class="search-scope tabs" role="tablist" aria-label="Result type">
		<button role="tab" aria-selected="true" data-scope-tab="all">All (<span data-scope-count="all">0</span>)</button>
		<button role="tab" aria-selected="false" data-scope-tab="products">Products (<span data-scope-count="products">0</span>)</button>
		<button role="tab" aria-selected="false" data-scope-tab="docs">Documentation (<span data-scope-count="docs">0</span>)</button>
		<button role="tab" aria-selected="false" data-scope-tab="research">Research (<span data-scope-count="research">0</span>)</button>
	</div>

	<section data-scope="products">
		<h2 class="label" style="margin:24px 0 12px">Products</h2>
		<div data-search-products>
			<?php foreach ( $products as $p ) : echo pph_product_row( $p ); endforeach; ?>
		</div>
	</section>

	<section data-scope="docs">
		<h2 class="label" style="margin:40px 0 12px">Documentation</h2>
		<table class="dtable dtable--stack">
			<thead><tr><th>Product</th><th>Lot</th><th>Size</th><th>Test date</th><th>Purity</th><th>Status</th><th>Certificate</th></tr></thead>
			<tbody data-search-docs>
				<?php foreach ( $coas as $c ) : echo pph_coa_row( $c ); endforeach; ?>
			</tbody>
		</table>
	</section>

	<section data-scope="research">
		<h2 class="label" style="margin:40px 0 16px">Research</h2>
		<div class="grid grid-3" data-search-research>
			<?php foreach ( $articles as $a ) : echo pph_research_card( $a ); endforeach; ?>
		</div>
	</section>

	<div class="empty" data-search-empty hidden style="margin-top:40px">
		<?php echo pph_icon( 'search' ); ?>
		<h3>Nothing matched that search</h3>
		<p>Try a product name, CAS number, SKU or lot number. If a compound is not listed, send the
		sequence or CAS number and we will confirm whether it can be sourced and documented.</p>
		<div class="row" style="justify-content:center;gap:10px">
			<button class="btn btn--secondary" type="button" data-search-clear>Clear the search</button>
			<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/contact/?topic=product' ) ); ?>">Request a material</a>
		</div>
	</div>

	<div class="empty" style="margin-top:56px">
		<h3>Not finding it?</h3>
		<p>If a compound is not listed, send the sequence or CAS number and we will confirm whether it can be sourced and documented.</p>
		<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/contact/?topic=product' ) ); ?>">Request a material</a>
	</div>
</div>

<?php
get_footer();
