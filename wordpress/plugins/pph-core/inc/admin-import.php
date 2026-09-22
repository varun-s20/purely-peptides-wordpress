<?php
/**
 * Tools -> Import PPH Content
 *
 * A zip-upload fallback for whenever there is no SSH / WP-CLI access to the
 * server - which is most cheap shared hosting. Upload the zipped
 * wordpress/content/ folder from the repo and this runs exactly the same
 * import that tools/import-wp-content.php runs on the command line - both
 * call pph_run_content_import() in inc/importer.php, so the two paths cannot
 * drift apart.
 *
 * To make the zip: in Windows File Explorer, right-click the
 * wordpress\content folder -> Send to -> Compressed (zipped) folder.
 *
 * THIS IS A BUILD-TIME CONVENIENCE, NOT SOMETHING THE CLIENT NEEDS.
 * Remove this file and its require line in pph-core.php before handover -
 * an unrestricted zip-upload-and-run screen has no reason to exist in the
 * shipped plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_menu', 'pph_register_import_page' );
function pph_register_import_page() {
	add_management_page(
		'Import PPH Content',
		'Import PPH Content',
		'manage_options',
		'pph-import',
		'pph_render_import_page'
	);
}

function pph_render_import_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}

	$result = null;
	if ( ! empty( $_POST['pph_import_nonce'] ) && wp_verify_nonce( sanitize_key( $_POST['pph_import_nonce'] ), 'pph_import' ) ) {
		$result = pph_handle_import_upload();
	}
	?>
	<div class="wrap">
		<h1>Import PPH Content</h1>
		<p>Imports the certificates and research articles exported by <code>node tools/export-wp-content.js</code>.</p>
		<ol>
			<li>On your computer, in the project folder: <code>node tools/export-wp-content.js</code></li>
			<li>Right-click the <code>wordpress\content</code> folder it creates &rarr; <strong>Send to</strong> &rarr; <strong>Compressed (zipped) folder</strong></li>
			<li>Upload that zip below</li>
		</ol>

		<?php if ( $result ) : ?>
			<div class="notice <?php echo $result['errors'] ? 'notice-error' : 'notice-success'; ?>" style="padding:12px 16px">
				<p><strong><?php echo (int) $result['n_coa']; ?> certificates, <?php echo (int) $result['n_art']; ?> articles imported.</strong></p>
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
			<?php wp_nonce_field( 'pph_import', 'pph_import_nonce' ); ?>
			<input type="file" name="pph_zip" accept=".zip" required>
			<p><button class="button button-primary" type="submit">Upload and import</button></p>
		</form>
	</div>
	<?php
}

function pph_handle_import_upload() {
	$empty = array( 'n_coa' => 0, 'n_art' => 0, 'log' => array(), 'errors' => array() );

	if ( empty( $_FILES['pph_zip']['tmp_name'] ) || UPLOAD_ERR_OK !== $_FILES['pph_zip']['error'] ) {
		$empty['errors'][] = 'No file uploaded, or the upload failed.';
		return $empty;
	}
	if ( ! class_exists( 'ZipArchive' ) ) {
		$empty['errors'][] = "PHP's zip extension is not available on this server. Ask the host to enable it, or use WP-CLI instead.";
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

	$content_dir = pph_find_content_dir( $work );
	if ( ! $content_dir ) {
		pph_rrmdir( $work );
		$empty['errors'][] = 'Could not find coa.json and articles.json inside that zip. Zip the wordpress/content folder itself.';
		return $empty;
	}

	$result = pph_run_content_import( $content_dir );
	pph_rrmdir( $work );

	return $result;
}
