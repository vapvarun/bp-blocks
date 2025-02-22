<?php
/**
 * BP Activity Blocks Functions.
 *
 * @package   bp-blocks
 * @subpackage \build\bp-activity\bp-activity-blocks
 */

namespace BP\Blocks;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register scripts and styles for the Activity component.
 *
 * @since TBD
 */
function bp_activity_register_scripts_and_styles() {
	wp_register_script(
		'bp-activity-modal',
		plugins_url( 'js/activity-modal.js', __FILE__ ),
		array( 'thickbox' ),
		filemtime( dirname( __FILE__ ) . '/js/activity-modal.js' ),
		true
	);

	wp_register_style(
		'bp-activity-modal',
		plugins_url( 'css/activity-modal.css', __FILE__ ),
		array( 'thickbox' ),
		filemtime( dirname( __FILE__ ) . '/css/activity-modal.css' )
	);
}
add_action( 'bp_init', __NAMESPACE__ . '\bp_activity_register_scripts_and_styles' );

/**
 * Sets the Activity block editor settings.
 *
 * @link https://github.com/getdave/standalone-block-editor
 *
 * @since TBD
 */
function bp_activity_blocks_get_editor_settings() {
	$settings = array(
		'disableCustomColors'                  => get_theme_support( 'disable-custom-colors' ),
		'disableCustomFontSizes'               => get_theme_support( 'disable-custom-font-sizes' ),
		'isRTL'                                => is_rtl(),
		'codeEditingEnabled'                   => false,
		'__experimentalBlockPatterns'          => array(),
		'__experimentalBlockPatternCategories' => array(),
		'activeComponents'                     => array_values( bp_core_get_active_components() ),
	);

	list( $color_palette, ) = (array) get_theme_support( 'editor-color-palette' );
	list( $font_sizes, )    = (array) get_theme_support( 'editor-font-sizes' );
	if ( false !== $color_palette ) {
		$settings['colors'] = $color_palette;
	}
	if ( false !== $font_sizes ) {
		$settings['fontSizes'] = $font_sizes;
	}

	return $settings;
}

/**
 * Loads the Activity Editor screen.
 *
 * @since TBD
 */
function bp_activity_blocks_editor_load_screen() {
	if ( isset( $_GET['url'] ) ) { // phpcs:ignore
		define( 'IFRAME_REQUEST', true );
	}

	wp_register_script(
		'bp-activity-block-editor',
		plugins_url( 'js/blocks/block-editor.js', __FILE__ ),
		array(
			'wp-dom-ready',
			'wp-editor',
			'wp-media-utils',
			'wp-element',
			'wp-format-library',
			'wp-components',
			'bp-block-components',
			'wp-compose',
			'wp-blocks',
			'wp-block-library',
			'wp-block-editor',
			'wp-data',
			'wp-i18n',
			'wp-api-fetch',
			'lodash',
		),
		filemtime( dirname( __FILE__ ) . '/js/blocks/block-editor.js' ),
		true
	);

	wp_register_style(
		'bp-activity-block-editor',
		plugins_url( 'css/blocks/activity-editor.css', __FILE__ ),
		array(
			'wp-format-library',
			'wp-components',
			'wp-editor',
			'wp-reset-editor-styles',
			'wp-edit-post',
		),
		filemtime( dirname( __FILE__ ) . '/css/blocks/activity-editor.css' )
	);

	add_action( 'bp_admin_enqueue_scripts', __NAMESPACE__ . '\bp_activity_blocks_editor_enqueue_assets' );
	add_filter( 'admin_body_class', __NAMESPACE__ . '\bp_activity_blocks_editor_admin_body_class' );
}

/**
 * Enqueues the Activity Editor assets.
 *
 * @link https://github.com/getdave/standalone-block-editor
 *
 * @since TBD
 */
function bp_activity_blocks_editor_enqueue_assets() {
	$paths = array(
		'/buddypress/v1/members/me?context=edit',
	);

	if ( bp_is_active( 'groups' ) ) {
		$paths[] = '/buddypress/v1/groups/me?context=edit';
	}
	/**
	 * Filter here to add your preloaded paths.
	 *
	 * @since TBD
	 *
	 * @param array $paths the list of preloaded paths.
	 */
	$preload_paths = apply_filters(
		'bp_activity_blocks_editor_preload_paths',
		$paths
	);

	// Preloads BP Activity's data.
	$preload_data = array_reduce(
		$preload_paths,
		'rest_preload_api_request',
		array()
	);

	// Create the Fetch API Preloading middleware.
	wp_add_inline_script(
		'wp-api-fetch',
		sprintf( 'wp.apiFetch.use( wp.apiFetch.createPreloadingMiddleware( %s ) );', wp_json_encode( $preload_data ) ),
		'after'
	);

	wp_enqueue_script( 'bp-activity-block-editor' );

	$settings = bp_activity_blocks_get_editor_settings();
	if ( defined( 'IFRAME_REQUEST' ) && isset( $_GET['url'] ) && $_GET['url'] ) { // phpcs:ignore
		wp_add_inline_style(
			'common',
			'html { overflow: hidden }
			#adminmenumain { display: none; }
			#wpcontent  { margin: 0; }
			@media only screen and (max-width: 960px) {
				.auto-fold #wpcontent { margin-left: 0 !important; }
			}'
		);
		$settings['templateLock'] = 'all';
		$settings['template']     = array(
			array(
				'bp/text',
				array(
					'placeholder' => __( 'Add an optional complementary text...', 'buddypress' ),
				),
			),
			array(
				'core-embed/wordpress',
				array(
					'url' => $_GET['url'], // phpcs:ignore
				),
			),
		);
	}

	/**
	 * Add a setting to inform whether the Activity Block Editor
	 * is used form the Activity Admin screen or not.
	 */
	$settings['isActivityAdminScreen'] = ! defined( 'IFRAME_REQUEST' ) && is_admin();

	wp_add_inline_script(
		'bp-activity-block-editor',
		'window.activityEditorSettings = ' . wp_json_encode( $settings ) . ';'
	);

	// Preload server-registered block schemas.
	wp_add_inline_script(
		'wp-blocks',
		'wp.blocks.unstable__bootstrapServerSideBlockDefinitions(' . wp_json_encode( get_block_editor_server_block_settings() ) . ');'
	);

	// Editor default styles.
	wp_enqueue_style( 'bp-activity-block-editor' );
}

/**
 * Adds specific needed admin body classes.
 *
 * @since TBD
 *
 * @param string $admin_body_class The Admin screen body classes.
 * @return string The Admin screen body classes.
 */
function bp_activity_blocks_editor_admin_body_class( $admin_body_class = '' ) {
	global $hook_suffix;
	$screen_class = preg_replace( '/[^a-z0-9_-]+/i', '-', $hook_suffix );

	if ( 'activity_page_bp-activity-new' !== $screen_class ) {
		$admin_body_class .= ' activity_page_bp-activity-new';
	}

	if ( defined( 'IFRAME_REQUEST' ) ) {
		$admin_body_class .= ' iframe';
	}

	return $admin_body_class;
}

/**
 * Activity Editor Screen.
 *
 * @link https://github.com/getdave/standalone-block-editor
 *
 * @since TBD
 */
function bp_activity_blocks_editor_screen() {
	?>
	<div id="bp-activity-block-editor" class="bp-activity-block-editor"></div>
	<?php
}

/**
 * Adds an submenu to the Activity Admin menu.
 *
 * @since TBD
 */
function bp_activity_blocks_add_editor_submenu() {
	$screen = add_submenu_page(
		'bp-activity',
		__( 'Activity Block Editor', 'bp-blocks' ),
		__( 'Add new', 'bp-blocks' ),
		'exist',
		'bp-activity-new',
		__NAMESPACE__ . '\bp_activity_blocks_editor_screen'
	);

	add_action( 'load-' . $screen, __NAMESPACE__ . '\bp_activity_blocks_editor_load_screen' );
}
add_action( bp_core_admin_hook(), __NAMESPACE__ . '\bp_activity_blocks_add_editor_submenu' );

/**
 * Determine whether an activity or its content string has blocks.
 *
 * @since TBD
 * @see parse_blocks()
 *
 * @param string|int|BP_Activity_Activity|null $activity Activity content, Activity ID, or Activity object.
 * @return bool Whether the post has blocks.
 */
function bp_activity_has_blocks( $activity = null ) {
	if ( is_null( $activity ) ) {
		return false;
	}

	if ( ! is_string( $activity ) ) {
		if ( is_int( $activity ) ) {
			$bp_activity = new BP_Activity_Activity( $activity );
		} else {
			$bp_activity = $activity;
		}

		if ( $bp_activity instanceof BP_Activity_Activity ) {
			$activity = $bp_activity->content;
		}
	}

	return has_blocks( $activity );
}

/**
 * If bp_activity_do_blocks() needs to remove wpautop() from the `bp_get_activity_content_body` filter, this re-adds it afterwards,
 * for subsequent `bp_get_activity_content_body` usage.
 *
 * @since TBD
 *
 * @param string $content The activity content running through this filter.
 * @return string The unmodified activity content.
 */
function bp_activity_restore_wpautop_hook( $content ) {
	$current_priority = has_filter( 'bp_get_activity_content_body', __NAMESPACE__ . '\bp_activity_restore_wpautop_hook' );

	add_filter( 'bp_get_activity_content_body', 'wpautop', $current_priority - 1 );
	remove_filter( 'bp_get_activity_content_body', __NAMESPACE__ . '\bp_activity_restore_wpautop_hook', $current_priority );

	return $content;
}

/**
 * Parses dynamic blocks out of activity content and re-renders them.
 *
 * @since TBD
 *
 * @param string $content Activity content.
 * @return string Updated activity content.
 */
function bp_activity_do_blocks( $content ) {
	$blocks = parse_blocks( $content );
	$output = '';

	foreach ( $blocks as $block ) {
		$output .= render_block( $block );
	}

	// If there are blocks in this content, we shouldn't run wpautop() on it later.
	$priority = has_filter( 'bp_get_activity_content_body', 'wpautop' );
	if ( false !== $priority && doing_filter( 'bp_get_activity_content_body' ) && bp_activity_has_blocks( $content ) ) {
		remove_filter( 'bp_get_activity_content_body', 'wpautop', $priority );
		add_filter( 'bp_get_activity_content_body', __NAMESPACE__ . '\bp_activity_restore_wpautop_hook', $priority + 1 );
	}

	return $output;
}

/**
 * Returns the link to the Activity Block Editor.
 *
 * @since TBD
 *
 * @param array $args A list of query arguments.
 * @return string The link to the Activity Block Editor.
 */
function bp_activity_get_block_editor_link( $args = array() ) {
	$query_args = wp_parse_args(
		$args,
		array(
			'page'      => 'bp-activity-new',
			'url'       => '',
			'TB_iframe' => false,
			'width'     => 760,
			'height'    => 550,
		)
	);

	if ( true !== $query_args['TB_iframe'] ) {
		$query_args = array(
			'page' => 'bp-activity-new',
		);
	}

	return esc_url( add_query_arg( $query_args, bp_get_admin_url( 'admin.php' ) ) );
}

/**
 * Callback function to render the block to share post/page via Activity stream.
 *
 * @since TBD
 *
 * @param array $attributes The block attributes.
 * @return string           HTML output.
 */
function bp_activity_render_share_activity_block( $attributes = array() ) {
	$block_args = wp_parse_args(
		$attributes,
		array(
			'text'                => '',
			'borderRadius'        => '',
			'style'               => array(),
			'backgroundColor'     => '',
			'textColor'           => '',
			'wpLoginLinkFallback' => true,
		)
	);

	if ( ! $block_args['text'] ) {
		return;
	}

	$classes       = array( 'wp-block-button__link' );
	$styles        = $block_args['style'];
	$button_styles = array();
	$button_style  = '';
	$link          = get_permalink();

	if ( ! is_user_logged_in() ) {
		if ( ! $block_args['wpLoginLinkFallback'] ) {
			return;
		} else {
			$link = wp_login_url( $link );
		}
	} else {
		// Use the BP Activity modal.
		wp_enqueue_script( 'bp-activity-modal' );
		wp_enqueue_style( 'bp-activity-modal' );

		$classes[] = 'thickbox';

		$link = bp_activity_get_block_editor_link(
			array(
				'url'       => rawurlencode( $link ),
				'TB_iframe' => true,
			)
		);
	}

	if ( isset( $block_args['className'] ) && $block_args['className'] ) {
		$classes[] = $block_args['className'];
	}

	if ( $block_args['textColor'] ) {
		$classes = array_merge(
			$classes,
			array(
				sprintf( 'has-%s-color', $block_args['textColor'] ),
				'has-text-color',
			)
		);

		unset( $styles['color']['text'] );
	}

	if ( $block_args['backgroundColor'] ) {
		$classes = array_merge(
			$classes,
			array(
				sprintf( 'has-%s-background-color', $block_args['backgroundColor'] ),
				'has-background',
			)
		);

		unset( $styles['color']['background'] );
	}

	if ( $block_args['borderRadius'] || 0 === $block_args['borderRadius'] ) {
		$styles['border']['border-radius'] = (int) $block_args['borderRadius'] . 'px';
	}

	if ( array_filter( $styles ) ) {
		foreach ( $styles as $style ) {
			$key = key( $style );

			if ( ! $key ) {
				continue;
			}

			$button_styles[] = sprintf( '%1$s: %2$s;', $key, $style[ $key ] );
		}

		$button_style = sprintf( 'style="%s"', implode( ' ', $button_styles ) );
	}

	// Merge link and button styles with block attributes.
	$args = array_merge(
		array(
			'link'         => $link,
			'buttonStyles' => $button_styles,
		),
		$attributes
	);

	$output = sprintf(
		'<div class="bp-block-activity-share wp-block-buttons">%1$s
			<div class="wp-block-button">%1$s
				<a href="%2$s" class="%3$s" rel="nofollow ugc"%4$s>%5$s</a>
			</div>
		</div>',
		"\n",
		esc_url( $link ),
		implode( ' ', array_map( 'sanitize_html_class', $classes ) ),
		$button_style,
		wp_kses(
			$block_args['text'],
			array(
				'strong' => true,
				'b'      => true,
				'em'     => true,
				'i'      => true,
			)
		)
	);

	/**
	 * Filter here to edit the block output.
	 *
	 * @since TBD
	 *
	 * @param string $output The HTML output of the block.
	 * @param array  $args The block extended arguments.
	 */
	return apply_filters( 'bp_activity_render_share_activity_block', $output, $args );
}

/**
 * Register Activity Blocks.
 *
 * @since 7.0.0 Introduce the 'bp/embed-activity' block.
 * @since TBD Introduce the 'bp/share-activity' block.
 *
 * @return array The list of BP Activity blocks.
 */
function register_activity_blocks() {
	$blocks = array(
		'bp/share-activity'    => array(
			'name'               => 'bp/share-activity',
			'editor_script'      => 'bp-share-activity-block',
			'editor_script_url'  => plugins_url( 'js/blocks/share-activity.js', __FILE__ ),
			'editor_script_deps' => array(
				'wp-blocks',
				'wp-element',
				'wp-i18n',
				'wp-block-editor',
				'wp-components',
				'wp-data',
				'lodash',
			),
			'attributes'         => array(
				'text'                => array(
					'type'    => 'string',
					'default' => __( 'Share into my Activities', 'buddypress' ),
				),
				'borderRadius'        => array(
					'type' => 'number',
				),
				'style'               => array(
					'type' => 'object',
				),
				'backgroundColor'     => array(
					'type' => 'string',
				),
				'textColor'           => array(
					'type' => 'string',
				),
				'wpLoginLinkFallback' => array(
					'type'    => 'boolean',
					'default' => true,
				),
			),
			'render_callback'    => __NAMESPACE__ . '\bp_activity_render_share_activity_block',
		),
		'bp/latest-activities' => array(
			'name'               => 'bp/latest-activities',
			'editor_script'      => 'bp-latest-activities-block',
			'editor_script_url'  => plugins_url( 'js/blocks/latest-activities.js', __FILE__ ),
			'editor_script_deps' => array(
				'wp-blocks',
				'wp-element',
				'wp-components',
				'wp-i18n',
				'wp-block-editor',
				'wp-server-side-render',
				'bp-block-data',
			),
			'style'              => 'bp-latest-activities-block',
			'style_url'          => plugins_url( 'css/blocks/latest-activities.css', __FILE__ ),
			'attributes'         => array(
				'title'         => array(
					'type'    => 'string',
					'default' => __( 'Latest updates', 'buddypress' ),
				),
				'maxActivities' => array(
					'type'    => 'number',
					'default' => 5,
				),
				'type'          => array(
					'type'    => 'array',
					'default' => array( 'activity_update' ),
				),
				'postId'        => array(
					'type'    => 'number',
					'default' => 0,
				),
			),
			'render_callback'    => __NAMESPACE__ . '\bp_activity_render_latest_activities_block',
		),
	);

	if ( bp_is_active( 'activity', 'embeds' ) ) {
		$blocks['bp/embed-activity'] = array(
			'name'               => 'bp/embed-activity',
			'editor_script'      => 'bp-embed-activity-block',
			'editor_script_url'  => plugins_url( 'js/blocks/embed-activity.js', __FILE__ ),
			'editor_script_deps' => array(
				'wp-blocks',
				'wp-element',
				'wp-i18n',
				'wp-components',
				'wp-block-editor',
				'wp-data',
				'wp-compose',
				'bp-block-data',
			),
		);
	}

	return $blocks;
}
add_filter( 'bp_activity_register_blocks', __NAMESPACE__ . '\register_activity_blocks', 10, 0 );

/**
 * Callback function to render the Latest Activities Block.
 *
 * @since 9.0.0
 *
 * @param array $attributes The block attributes.
 * @return string           HTML output.
 */
function bp_activity_render_latest_activities_block( $attributes = array() ) {
	$block_args = wp_parse_args(
		$attributes,
		array(
			'title'         => __( 'Latest updates', 'buddypress' ),
			'maxActivities' => 5,
			'type'          => array( 'activity_update' ),
			'postId'        => 0,
		)
	);

	$max_activities = (int) $block_args['maxActivities'];

	// Should we get a specific member's activities?
	$member_id = 0;
	if ( $block_args['postId'] ) {
		$member_id = (int) get_post_field( 'post_author', $block_args['postId'] );
	} else {
		$member_id = bp_displayed_user_id();
	}

	// Set the widget's wrapper attributes.
	$types              = (array) $block_args['type'];
	$classnames         = array_map( 'sanitize_html_class', array_merge( $types, array( 'bp-latest-activities', 'buddypress', 'widget' ) ) );
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classnames ) ) );

	// Set the Block's title.
	$widget_content = sprintf( '<h2 class="widget-title">%s</h2>', esc_html( $block_args['title'] ) );

	// Avoid conflicts with other activity loops.
	$reset_activities_template = null;
	if ( ! empty( $GLOBALS['activities_template'] ) ) {
		$reset_activities_template = $GLOBALS['activities_template'];
	}

	$widget_args = array(
		'max'          => $max_activities,
		'scope'        => 'all',
		'user_id'      => $member_id,
		'object'       => false,
		'action'       => implode( ',', $types ),
		'primary_id'   => 0,
		'secondary_id' => 0,
	);

	// Build the activity loop.
	if ( 'nouveau' === bp_get_theme_compat_id() ) {
		$bp_nouveau = bp_nouveau();

		// Globalize the activity widget arguments.
		$bp_nouveau->activity->widget_args = $widget_args;

		ob_start();
		bp_get_template_part( 'activity/widget' );
		$widget_content .= ob_get_clean();

		// Reset the global.
		$bp_nouveau->activity->widget_args = array();
	} else {
		$activity_loop = sprintf( '<div class="widget-error"><p>%s</p></div>', esc_html__( 'Sorry, there was no activity found. Please try a different filter.', 'buddypress' ) );

		if ( bp_has_activities( $widget_args ) ) {
			$activity_loop = '';

			while ( bp_activities() ) {
				bp_the_activity();

				$activity_footer  = '';
				$activity_classes = 'activity-item';
				if ( bp_activity_has_content() ) {
					$activity_content = bp_get_activity_content_body();
					$activity_footer  = sprintf(
						'<footer>
							<cite>
								<a href="%1$s" class="bp-tooltip" data-bp-tooltip="%2$s">
									%3$s
								</a>
							</cite>
							%4$s
						</footer>',
						bp_get_activity_user_link(),
						bp_get_activity_member_display_name(),
						bp_get_activity_avatar(
							array(
								'type'   => 'thumb',
								'width'  => '40',
								'height' => '40',
							)
						),
						bp_insert_activity_meta()
					);
				} else {
					$activity_classes .= ' mini';
					$activity_content  = bp_get_activity_action();
				}

				$activity_loop .= sprintf(
					'<blockquote>
						<div class="%1$s">%2$s</div>
						%3$s
					</blockquote>',
					$activity_classes,
					$activity_content,
					$activity_footer
				);
			}
		}

		$widget_content .= sprintf(
			'<div class="activity-list item-list">
				%1$s
			</div>',
			$activity_loop
		);
	}

	// Adds a container to make sure the block is styled even when used into the Columns parent block.
	$widget_content = sprintf( '<div class="bp-latest-activities-block">%s</div>', "\n" . $widget_content . "\n" );

	// Reset the global template loop.
	$GLOBALS['activities_template'] = $reset_activities_template;

	// Only add a block wrapper if not loaded into a Widgets sidebar.
	if ( ! did_action( 'dynamic_sidebar_before' ) ) {
		return sprintf(
			'<div %1$s>%2$s</div>',
			$wrapper_attributes,
			$widget_content
		);
	}

	return $widget_content;
}
