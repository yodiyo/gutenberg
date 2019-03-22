/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	createBlock,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit';

export const name = 'core/calendar';

export const settings = {
	title: __( 'Calendar' ),

	description: __( 'A calendar of your site’s posts.' ),

	icon: 'calendar',

	category: 'widgets',

	keywords: [ __( 'posts' ), __( 'archive' ) ],

	supports: {
		align: true,
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/legacy-widget' ],
				isMatch: ( { identifier } ) => {
					return identifier === 'WP_Widget_Calendar';
				},
				transform: ( { instance } ) => {
					const calendarBlock = createBlock( 'core/calendar' );
					if ( ! instance || ! ( instance.title ) ) {
						return calendarBlock;
					}
					return [
						createBlock( 'core/heading', {
							content: instance.title,
						} ),
						calendarBlock,
					];
				},
			},
		],
	},

	edit,
};
