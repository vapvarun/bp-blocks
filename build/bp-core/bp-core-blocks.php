<?php
/**
 * BP Groups Blocks Functions.
 *
 * @package   bp-blocks
 * @subpackage \build\bp-core\bp-core-blocks
 */

namespace BP\Blocks;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the BP Block components.
 *
 * @since 6.0.0
 */
function bp_register_block_components() {
	wp_register_script(
		'bp-block-components',
		plugins_url( 'js/block-components.js', __FILE__ ),
		array(
			'wp-element',
			'wp-components',
			'wp-i18n',
			'wp-api-fetch',
			'wp-url',
		),
		defined( 'WP_DEBUG' ) && WP_DEBUG ? filemtime( dirname( __FILE__ ) . '/js/block-components.js' ) : bp_get_version(),
		false
	);

	wp_add_inline_script(
		'bp-block-components',
		'window.bp = window.bp || {};
		bp.blockComponents = bpBlock.blockComponents;
		delete bpBlock;',
		'after'
	);

	wp_register_script(
		'bp-block-data',
		plugins_url( 'js/block-data.js', __FILE__ ),
		array(
			'wp-data',
			'wp-api-fetch',
			'lodash',
		),
		defined( 'WP_DEBUG' ) && WP_DEBUG ? filemtime( dirname( __FILE__ ) . '/js/block-data.js' ) : bp_get_version(),
		false
	);

	wp_add_inline_script(
		'bp-block-data',
		sprintf(
			'window.bp = window.bp || {};
			bp.blockData = bpBlock.blockData;
			bp.blockData.embedScriptURL = \'%s\';
			delete bpBlock;',
			esc_url_raw( includes_url( 'js/wp-embed.min.js' ) )
		),
		'after'
	);
}
add_action( 'bp_blocks_init', __NAMESPACE__ . '\bp_register_block_components', 1 );

/**
 * Registers a new script to manage dynamic Widget Blocks.
 *
 * @since 9.0.0
 *
 * @param array $scripts Data about the scripts to register.
 * @return array Data about the scripts to register.
 */
function bp_core_register_scripts( $scripts = array() ) {
	$scripts['bp-dynamic-widget-block-script'] = array(
		'file'         => esc_url( plugins_url( 'js/dynamic-widget-block.js', __FILE__ ) ),
		'dependencies' => array(
			'lodash',
			'wp-url',
		),
		'footer'       => true,
	);

	return $scripts;
}
add_filter( 'bp_core_register_common_scripts', __NAMESPACE__ . '\bp_core_register_scripts', 1, 1 );

/**
 * Register the Core blocks.
 *
 * @since 9.0.0
 */
function register_core_blocks() {
	// The BP Core Login block should be defined into the following array.
	$blocks = array();

	if ( 'nouveau' === bp_get_theme_compat_id() ) {
		/**
		 * NB: This block should is registered from the BP Nouveau Template Pack
		 *
		 * @see bp_nouveau_register_primary_nav_widget_block()
		 */
		$blocks['bp/primary-nav'] = array(
			'name'               => 'bp/primary-nav',
			'editor_script'      => 'bp-primary-nav-block',
			'editor_script_url'  => plugins_url( 'js/blocks/primary-nav.js', __FILE__ ),
			'editor_script_deps' => array(
				'wp-blocks',
				'wp-element',
				'wp-components',
				'wp-i18n',
				'wp-block-editor',
				'wp-server-side-render',
				'bp-block-data',
			),
			'editor_style'       => 'bp-primary-nav-block',
			'editor_style_url'   => plugins_url( 'css/blocks/primary-nav.css', __FILE__ ),
			'attributes'         => array(
				'displayTitle' => array(
					'type'    => 'boolean',
					'default' => true,
				),
			),
			'render_callback'    => __NAMESPACE__ . '\bp_nouveau_render_primary_nav_block',
		);
	}

	$blocks['bp/login-form'] = array(
		'name'               => 'bp/login-form',
		'editor_script'      => 'bp-login-form-block',
		'editor_script_url'  => plugins_url( 'js/blocks/login-form.js', __FILE__ ),
		'editor_script_deps' => array(
			'wp-blocks',
			'wp-element',
			'wp-components',
			'wp-i18n',
			'wp-block-editor',
			'wp-server-side-render',
		),
		'style'              => 'bp-login-form-block',
		'style_url'          => plugins_url( 'css/blocks/login-form.css', __FILE__ ),
		'attributes'         => array(
			'title'         => array(
				'type'    => 'string',
				'default' => '',
			),
			'forgotPwdLink' => array(
				'type'    => 'boolean',
				'default' => false,
			),
		),
		'render_callback'    => __NAMESPACE__ . '\bp_block_render_login_form_block',
	);

	return $blocks;
}
add_filter( 'bp_core_register_blocks', __NAMESPACE__ . '\register_core_blocks', 10, 0 );

/**
 * Preload the Active BuddyPress Components.
 *
 * @since 9.0.0
 *
 * @param string[] $paths The Block Editors preload paths.
 * @return string[] The Block Editors preload paths.
 */
function bp_blocks_preload_paths( $paths = array() ) {
	return array_merge(
		$paths,
		array(
			'/buddypress/v1/components?status=active',
		)
	);
}
add_filter( 'block_editor_rest_api_preload_paths', __NAMESPACE__ . '\bp_blocks_preload_paths' );

/**
 * Callback function to render the BP Primary Nav Block.
 *
 * NB: This function is located into the BP Nouveau Template Pack.
 *
 * @see bp_nouveau_render_primary_nav_block()
 *
 * @since 9.0.0
 *
 * @param array $attributes The block attributes.
 * @return string           HTML output.
 */
function bp_nouveau_render_primary_nav_block( $attributes = array() ) {
	$widget_content = '';
	$widget_title   = '';
	$block_args     = bp_parse_args(
		$attributes,
		array(
			'displayTitle' => true,
		),
		'widget_object_nav'
	);

	// Previewing the Block inside the editor.
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		$widget_title = bp_get_loggedin_user_fullname();

		ob_start();

		// Temporary override the displayed user by the logged in one.
		add_filter( 'bp_displayed_user_id', 'bp_loggedin_user_id' );

		bp_get_template_part( 'members/single/parts/item-nav' );
		$widget_content = ob_get_clean();

		// Remove the temporary override.
		remove_filter( 'bp_displayed_user_id', 'bp_loggedin_user_id' );
	} else {
		ob_start();

		if ( bp_is_user() ) {
			$widget_title = bp_get_displayed_user_fullname();
			bp_get_template_part( 'members/single/parts/item-nav' );
		} elseif ( bp_is_group() ) {
			$widget_title = bp_get_current_group_name();
			bp_get_template_part( 'groups/single/parts/item-nav' );
		} elseif ( bp_is_directory() ) {
			$widget_title = bp_get_directory_title( bp_current_component() );
			bp_get_template_part( 'common/nav/directory-nav' );
		}

		$widget_content = ob_get_clean();
	}

	if ( ! $widget_content ) {
		return '';
	}

	// Set the Block's title.
	if ( true === $block_args['displayTitle'] ) {
		$widget_content = sprintf(
			'<h2 class="widget-title">%1$s</h2>
			%2$s',
			esc_html( $widget_title ),
			$widget_content
		);
	}

	// Only add a block wrapper if not loaded into a Widgets sidebar.
	if ( ! did_action( 'dynamic_sidebar_before' ) ) {
		$classnames         = 'widget_nav_menu buddypress_object_nav buddypress widget';
		$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => $classnames ) );

		return sprintf(
			'<div %1$s>%2$s</div>',
			$wrapper_attributes,
			$widget_content
		);
	}

	return $widget_content;
}

/**
 * Callback function to render the BP Login Form.
 *
 * @since 9.0.0
 *
 * @param array $attributes The block attributes.
 * @return string           HTML output.
 */
function bp_block_render_login_form_block( $attributes = array() ) {
	$block_args = wp_parse_args(
		$attributes,
		array(
			'title'         => '',
			'forgotPwdLink' => false,
		)
	);

	$title = $block_args['title'];

	$classnames         = 'widget_bp_core_login_widget buddypress widget';
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => $classnames ) );

	$widget_content = '';

	if ( $title ) {
		$widget_content .= sprintf(
			'<h2 class="widget-title">%s</h2>',
			esc_html( $title )
		);
	}

	if ( is_user_logged_in() ) {
		$action_output = '';
		if ( has_action( 'bp_before_login_widget_loggedin' ) ) {
			ob_start();
			/**
			 * Fires before the display of widget content if logged in.
			 *
			 * @since 1.9.0
			 */
			do_action( 'bp_before_login_widget_loggedin' );
			$action_output = ob_get_clean();
		}

		if ( $action_output ) {
			$widget_content .= $action_output;
		}

		$widget_content .= sprintf(
			'<div class="bp-login-widget-user-avatar">
				<a href="%1$s">
					%2$s
				</a>
			</div>',
			bp_loggedin_user_domain(),
			bp_get_loggedin_user_avatar(
				array(
					'type'   => 'thumb',
					'width'  => 50,
					'height' => 50,
				)
			)
		);

		$widget_content .= sprintf(
			'<div class="bp-login-widget-user-links">
				<div class="bp-login-widget-user-link">%1$s</div>
				<div class="bp-login-widget-user-logout"><a class="logout" href="%2$s">%3$s</a></div>
			</div>',
			bp_core_get_userlink( bp_loggedin_user_id() ),
			wp_logout_url( bp_get_requested_url() ),
			__( 'Log Out', 'buddypress' )
		);

		$action_output = '';
		if ( has_action( 'bp_after_login_widget_loggedin' ) ) {
			ob_start();
			/**
			 * Fires after the display of widget content if logged in.
			 *
			 * @since 1.9.0
			 */
			do_action( 'bp_after_login_widget_loggedin' );
			$action_output = ob_get_clean();
		}

		if ( $action_output ) {
			$widget_content .= $action_output;
		}
	} else {
		$action_output = '';
		$pwd_link      = (bool) $block_args['forgotPwdLink'];

		if ( has_action( 'bp_before_login_widget_loggedout' ) ) {
			ob_start();
			/**
			 * Fires before the display of widget content if logged out.
			 *
			 * @since 1.9.0
			 */
			do_action( 'bp_before_login_widget_loggedout' );
			$action_output = ob_get_clean();
		}

		if ( $action_output ) {
			$widget_content .= $action_output;
		}

		add_filter( 'login_form_bottom', 'bp_blocks_get_login_widget_registration_link', 10, 2 );

		$widget_content .= wp_login_form(
			array(
				'echo'             => false,
				'form_id'          => 'bp-login-widget-form',
				'id_username'      => 'bp-login-widget-user-login',
				'label_username'   => __( 'Username', 'buddypress' ),
				'id_password'      => 'bp-login-widget-user-pass',
				'label_password'   => __( 'Password', 'buddypress' ),
				'id_remember'      => 'bp-login-widget-rememberme',
				'id_submit'        => 'bp-login-widget-submit',
				'include_pwd_link' => $pwd_link,
			)
		);

		remove_filter( 'login_form_bottom', 'bp_blocks_get_login_widget_registration_link', 10, 2 );

		$action_output = '';
		if ( has_action( 'bp_after_login_widget_loggedout' ) ) {
			ob_start();
			/**
			 * Fires after the display of widget content if logged out.
			 *
			 * @since 1.9.0
			 */
			do_action( 'bp_after_login_widget_loggedout' );
			$action_output = ob_get_clean();
		}

		if ( $action_output ) {
			$widget_content .= $action_output;
		}
	}

	if ( ! did_action( 'dynamic_sidebar_before' ) ) {
		return sprintf(
			'<div %1$s>%2$s</div>',
			$wrapper_attributes,
			$widget_content
		);
	}

	return $widget_content;
}
