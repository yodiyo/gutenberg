/**
 * WordPress dependencies
 */
import React from 'react';
import { View } from 'react-native';

import { __ } from '@wordpress/i18n';
import Picker from '../../../../editor/src/components/mobile/picker/';

const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_CHOOSE_FROM_DEVICE = 'choose_from_device';
const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO = 'take_photo';
const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY = 'wordpress_media_library';

class MediaUpload extends React.Component {
	//picker: Picker;

	constructor( props ) {
		super( props );
	}

	getMediaOptionsItems() {
		return [
			{ icon: 'format-image', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_CHOOSE_FROM_DEVICE, label: __( 'Choose from device' ) },
			{ icon: 'camera', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO, label: __( 'Take a Photo' ) },
			{ icon: 'wordpress-alt', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY, label: __( 'WordPress Media Library' ) },
		];
	}

	render() {

		const mediaOptions = this.getMediaOptionsItems();

		let picker;

		const onPickerPresent = () => {
			picker.presentPicker();
		};

		const getMediaOptions = () => (
			<Picker
				hideCancelButton={ true }
				ref={ ( instance ) => picker = instance }
				options={ mediaOptions }
				onChange={ ( value ) => {
					if ( value === MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_CHOOSE_FROM_DEVICE ) {
						//onMediaUploadButtonPressed();
					} else if ( value === MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO ) {
						//onMediaCaptureButtonPressed();
					} else if ( value === MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY ) {
						//onMediaLibraryButtonPressed();
					}
				} }
			/>
		);
       /*  return (
			<View/>
		);*/
        return (
			<View style={ { flex: 1 } }>
				{ getMediaOptions() }
				{ this.props.render( { open: onPickerPresent } ) }
			</View>
		);

	}

}

export default MediaUpload;