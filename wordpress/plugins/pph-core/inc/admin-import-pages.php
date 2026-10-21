<?php
/**
 * Tools -> Import PPH Pages
 *
 * Zip-upload fallback for hosts with no SSH / WP-CLI, mirroring
 * inc/admin-import.php (certificates and articles) and
 * inc/admin-import-products.php. Upload the zipped wordpress/pages/ folder
 * and this runs the same import tools/import-wp-pages.php runs on the
 * command line.
 *
 * BUILD-TIME CONVENIENCE. Remove this file and its require in pph-core.php
 * before handover, same as the other two import screens.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_menu', 'pph_register_pages_import_page' );
function pph_register_pages_import_page() {
	add_management_page(
		'Import PPH Pages',
		'Import PPH Pages',
		'manage_options',
		'pph-import-pages',
		'pph_render_pages_import_page'
	);
}

function pph_render_pages_import_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}

	$result = null;
	if ( ! empty( $_POST['pph_import_pages_nonce'] ) && wp_verify_nonce( sanitize_key( $_POST['pph_import_pages_nonce'] ), 'pph_import_pages' ) ) {
		$result = pph_handle_pages_import_upload();
	}
	?>
	<div class="wrap">
		<h1>Import PPH Pages</h1>
		<p>Imports the prose pages (about, quality, applications, FAQ, contact, wholesale, wholesale/apply and the legal pages) exported by <code>node tools/export-wp-pages.js</code>. Existing pages are updated in place; nothing is deleted.</p>
		<ol>
			<li>On your computer: <code>node tools/export-wp-pages.js</code></li>
			<li>Right-click <code>wordpress\pages</code> &rarr; <strong>Send to</strong> &rarr; <strong>Compressed (zipped) folder</strong></li>
			<li>Upload that zip below</li>
		</ol>

		<?php if ( $result ) : ?>
			<div class="notice <?php echo $result['errors'] ? 'notice-error' : 'notice-success'; ?>" style="padding:12px 16px">
				<p><strong><?php echo (int) $result['created']; ?> created, <?php echo (int) $result['updated']; ?> updated.</strong></p>
				<?php if ( $result['errors'] ) : ?>
					<p>Problems:</p>
					<ul style="list-style:disc;margin-left:20px">
						<?php foreach ( $result['errors'] as $e ) : ?>
							<li><?php echo esc_html( $e ); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
				<?php if ( $result['log'] ) : ?>
					<details>
						<summary>Details (<?php echo count( $result['log'] ); ?>)</summary>
						<pre style="white-space:pre-wrap"><?php echo esc_html( implode( "\n", $result['log'] ) ); ?></pre>
					</details>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<form method="post" enctype="multipart/form-data">
			<?php wp_nonce_field( 'pph_import_pages', 'pph_import_pages_nonce' ); ?>
			<input type="file" name="pph_zip" accept=".zip" required>
			<p><button class="button button-primary" type="submit">Upload and import</button></p>
		</form>
	</div>
	<?php
}

function pph_handle_pages_import_upload() {
	$empty = array( 'created' => 0, 'updated' => 0, 'log' => array(), 'errors' => array() );

	if ( empty( $_FILES['pph_zip']['tmp_name'] ) || UPLOAD_ERR_OK !== $_FILES['pph_zip']['error'] ) {
		$empty['errors'][] = 'No file uploaded, or the upload failed.';
		return $empty;
	}
	if ( ! class_exists( 'ZipArchive' ) ) {
		$empty['errors'][] = "PHP's zip extension is not available on this server.";
		return $empty;
	}

	$uploads = wp_upload_dir();
	$work    = trailingslashit( $uploads['basedir'] ) . 'pph-import-' . wp_generate_password( 8, false, false );
	wp_mkdir_p( $work );

	$zip = new ZipArchive();
	if ( true !== $zip->open( $_FILES['pph_zip']['tmp_name'] ) ) {
		pph_rrmdir( $work );
		$empty['errors'][] = 'Could not open that file as a zip.';
		return $empty;
	}
	$zip->extractTo( $work );
	$zip->close();

	$pages_dir = pph_find_dir_with_files( $work, array( 'manifest.json', 'contact.html' ) );
	if ( ! $pages_dir ) {
		pph_rrmdir( $work );
		$empty['errors'][] = 'Could not find manifest.json and the page bodies inside that zip.';
		return $empty;
	}

	$result = pph_run_pages_import( $pages_dir );
	pph_rrmdir( $work );

	return $result;
}
