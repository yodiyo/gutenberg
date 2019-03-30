/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Edit from './edit';
import { BlockEditContextProvider } from './context';

class BlockEdit extends Component {
	render() {
		const value = {
			name: this.props.name,
			isSelected: this.props.isSelected,
			clientId: this.props.clientId,
		};

		if ( this.props.isSelected ) {
			value.selectionStart = this.props.selectionStart;
			value.selectionEnd = this.props.selectionEnd;
		}

		return (
			<BlockEditContextProvider value={ value }>
				<Edit { ...this.props } />
			</BlockEditContextProvider>
		);
	}
}

export default withSelect( ( select ) => {
	const { getSelectionStart, getSelectionEnd } = select( 'core/block-editor' );

	return {
		selectionStart: getSelectionStart(),
		selectionEnd: getSelectionEnd(),
	};
} )( BlockEdit );
