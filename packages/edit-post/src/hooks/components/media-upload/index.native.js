/**
 * WordPress dependencies
 */
import React from 'react';
import { View } from 'react-native';

import { __ } from '@wordpress/i18n';
//import { Picker } from '@wordpress/editor';

const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_CHOOSE_FROM_DEVICE = 'choose_from_device';
const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO = 'take_photo';
const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY = 'wordpress_media_library';

class MediaUpload extends React.Component {

	getMediaOptionsItems() {
		return [
			{ icon: 'format-image', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_CHOOSE_FROM_DEVICE, label: __( 'Choose from device' ) },
			{ icon: 'camera', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO, label: __( 'Take a Photo' ) },
			{ icon: 'wordpress-alt', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY, label: __( 'WordPress Media Library' ) },
		];
	}

    openModal() {
        this.picker.presentPicker();
	}

	render() {

        const mediaOptions = this.getMediaOptionsItems();

	/*	const getMediaOptions = () => (
			<Picker
				hideCancelButton={ true }
				ref={ ( instance ) => this.picker = instance }
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
		*/
      /*  return (
			<View/>
		);*/
        return this.props.render( { open: this.openModal } );

	}

}

export default MediaUpload;