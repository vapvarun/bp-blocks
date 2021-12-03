/**
 * WordPress dependencies.
 */
const {
	blockEditor: { InspectorControls, BlockControls, RichText, AlignmentToolbar },
	components: {
		Placeholder,
		PanelBody,
		SelectControl,
		ToggleControl,
		Button,
		Dashicon,
		Tooltip,
		ToolbarGroup,
		RangeControl,
		useBlockProps,
	},
	element: { createElement, Fragment, useState },
	i18n: { __, sprintf },
	apiFetch,
	url: { addQueryArgs },
} = wp;

/**
 * BuddyPress dependencies.
 */
const {
	blockComponents: { AutoCompleter },
	blockData: { isActive },
} = bp;

/**
 * Internal dependencies.
 */
import { AVATAR_SIZES, EXTRA_DATA } from "./constants";

/**
 * External dependencies.
 */
const { reject, remove, sortBy } = lodash;

const editMembersStatsBlock = ({ attributes, setAttributes, isSelected }) => {
	const onChangeContent = (newContent) => {
		setAttributes({ content: newContent });
	};

	const onChangeAlignment = (newAlignment) => {
		setAttributes({
			alignment: newAlignment === undefined ? "none" : newAlignment,
		});
	};
	const { content, alignment, example, className } = attributes;
	return (
		<div>
			<RichText
				className={className}
				style={{ textAlign: alignment }}
				tagName="p"
				onChange={onChangeContent}
				value={content}
			/>
		</div>
	);
};

export default editMembersStatsBlock;
