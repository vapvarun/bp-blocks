<?php
/**
 * BP Messages Blocks Functions.
 *
 * @package   bp-blocks
 * @subpackage \build\bp-messages\bp-messages-blocks
 */

namespace BP\Blocks;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the messages component blocks.
 *
 * @since 9.0.0
 */
function register_messages_blocks() {
	return array(
		'bp/sitewide-notices' => array(
			'name'               => 'bp/sitewide-notices',
			'editor_script'      => 'bp-sitewide-notices-block',
			'editor_script_url'  => plugins_url( 'js/blocks/sitewide-notices.js', __FILE__ ),
			'editor_script_deps' => array(
				'wp-blocks',
				'wp-element',
				'wp-components',
				'wp-i18n',
				'wp-block-editor',
				'wp-server-side-render',
				'bp-block-data',
			),
			'style'              => 'bp-sitewide-notices-block',
			'style_url'          => plugins_url( 'css/blocks/sitewide-notices.css', __FILE__ ),
			'attributes'         => array(
				'title' => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'render_callback'    => __NAMESPACE__ . '\bp_messages_render_sitewide_notices_block',
		),
	);
}
add_filter( 'bp_messages_register_blocks', __NAMESPACE__ . '\register_messages_blocks', 10, 0 );

/**
 * Registers a new script to manage the dismissal action for the Sitewide notice widget/block.
 *
 * @since 9.0.0
 *
 * @param array $scripts Data about the scripts to register.
 * @return array Data about the scripts to register.
 */
function bp_messages_register_scripts( $scripts = array() ) {
	$scripts['bp-sitewide-notices-script'] = array(
		'file'         => esc_url( plugins_url( 'js/sitewide-notices.js', __FILE__ ) ),
		'dependencies' => array(),
		'footer'       => true,
	);

	return $scripts;
}
add_filter( 'bp_core_register_common_scripts', __NAMESPACE__ . '\bp_messages_register_scripts', 10, 1 );

/**
 * Callback function to render the BP Sitewide Notices Block.
 *
 * @since 9.0.0
 *
 * @param array $attributes The block attributes.
 * @return string           HTML output.
 */
function bp_messages_render_sitewide_notices_block( $attributes = array() ) {
	$block_args = bp_parse_args(
		$attributes,
		array(
			'title' => '',
		),
		'widget_object_sitewide_messages'
	);

	if ( ! is_user_logged_in() ) {
		return;
	}

	$feedback_tpl  = '<div class="components-placeholder">' . "\n";
	$feedback_tpl .= '<div class="components-placeholder__label">%1$s</div>' . "\n";
	$feedback_tpl .= '<div class="components-placeholder__fieldset">%2$s</div>' . "\n";
	$feedback_tpl .= '</div>';

	// Don't display the block if there are no Notices to show.
	$notice = \BP_Messages_Notice::get_active();
	if ( empty( $notice->id ) ) {
		// Previewing the Block inside the editor.
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return sprintf(
				$feedback_tpl,
				esc_html__( 'Preview unavailable', 'buddypress' ),
				esc_html__( 'No active sitewide notices.', 'buddypress' )
			);
		}

		return;
	}

	// Only enqueue common/specific scripts and data once per page load.
	if ( ! wp_script_is( 'bp-sitewide-notices-script', 'enqueued' ) ) {
		$path = sprintf(
			'/%1$s/%2$s/sitewide-notices/',
			bp_rest_namespace(),
			bp_rest_version()
		);
		wp_enqueue_script( 'bp-sitewide-notices-script' );
		wp_localize_script(
			'bp-sitewide-notices-script',
			'bpSitewideNoticeBlockSettings',
			array(
				'path'        => ltrim( $path, '/' ),
				'dismissPath' => ltrim( $path, '/' ) . 'dismiss',
				'root'        => esc_url_raw( get_rest_url() ),
				'nonce'       => wp_create_nonce( 'wp_rest' ),
			)
		);
	}

	$closed_notices = (array) bp_get_user_meta( bp_loggedin_user_id(), 'closed_notices', true );

	if ( in_array( $notice->id, $closed_notices, true ) ) {
		// Previewing the Block inside the editor.
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return sprintf(
				$feedback_tpl,
				esc_html__( 'Preview unavailable', 'buddypress' ),
				esc_html__( 'You dismissed the sitewide notice.', 'buddypress' )
			);
		}

		return;
	}

	// There is an active, non-dismissed notice to show.
	$title = $block_args['title'];

	$classnames         = 'widget_bp_core_sitewide_messages buddypress widget';
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => $classnames ) );

	$widget_content = '<div class="bp-sitewide-notice-block">';

	if ( $title ) {
		$widget_content .= sprintf(
			'<h2 class="widget-title">%s</h2>',
			esc_html( $title )
		);
	}

	$widget_content .= sprintf(
		'<div class="bp-sitewide-notice-message info bp-notice" rel="n-%1$d">
			<strong>%2$s</strong>
			<a href="%3$s" class="bp-tooltip button dismiss-notice" data-bp-tooltip="%4$s" data-bp-sitewide-notice-id="%5$d"><span class="bp-screen-reader-text">%6$s</span> <span aria-hidden="true">&#x2716;</span></a>
			%7$s
		</div>',
		esc_attr( $notice->id ),
		bp_get_message_notice_subject( $notice ),
		esc_url( bp_get_message_notice_dismiss_link() ),
		esc_attr__( 'Dismiss this notice', 'buddypress' ),
		esc_attr( $notice->id ),
		esc_html__( 'Dismiss this notice', 'buddypress' ),
		bp_get_message_notice_text( $notice )
	);

	$widget_content .= '</div>';

	if ( ! did_action( 'dynamic_sidebar_before' ) ) {
		return sprintf(
			'<div %1$s>%2$s</div>',
			$wrapper_attributes,
			$widget_content
		);
	}

	return $widget_content;
}
