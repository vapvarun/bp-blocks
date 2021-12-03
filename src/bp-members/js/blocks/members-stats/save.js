import { Line } from "react-chartjs-2";

/**
 * WordPress dependencies.
 */
const {
	blockEditor: { RichText },
	element: { createElement },
} = wp;

const saveMembersStatsBlock = ({ attributes }) => {
	const { content, alignment, example, className } = attributes;
	return (
		<RichText
			className={className}
			style={{ textAlign: alignment }}
			tagName="p"
			value={content}
		/>
	);
};

export default saveMembersStatsBlock;
