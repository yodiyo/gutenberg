/**
 * Internal dependencies
 */
import Edit from './edit';
import { BlockEditContextProvider } from './context';

function BlockEdit( props ) {
	const { name, isSelected, clientId } = props;

	return (
		<BlockEditContextProvider value={ { name, isSelected, clientId } }>
			<Edit { ...props } />
		</BlockEditContextProvider>
	);
}

export default BlockEdit;
