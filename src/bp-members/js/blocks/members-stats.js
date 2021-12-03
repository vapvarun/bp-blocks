/**
 * WordPress dependencies.
 */
const {
	blocks: { registerBlockType },
	i18n: { __ },
	blockEditor: { RichText },
} = wp;

/**
 * Internal dependencies.
 */
import editMembersStatsBlock from "./members-stats/edit";
import saveMembersStatsBlock from "./members-stats/save";

registerBlockType("bp/members-stats", {
	title: __("Members Stats", "buddypress"),
	description: __("BuddyPress Members Stats.", "buddypress"),
	icon: {
		background: "#fff",
		foreground: "#d84800",
		src: "groups",
	},
	category: "buddypress",
	attributes: {
		content: {
			type: "array",
			source: "children",
			selector: "p",
		},
		alignment: {
			type: "string",
			default: "none",
		},
	},
	example: {
		attributes: {
			type: "string",
			content: "Hello World",
			alignment: "right",
		},
	},
	edit: editMembersStatsBlock,
	save: saveMembersStatsBlock,
});
