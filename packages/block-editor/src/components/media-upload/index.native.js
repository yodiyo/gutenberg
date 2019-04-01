/**
 * External dependencies
 */
import React from 'react';
import { View } from 'react-native';
import {
	subscribeMediaUpload,
	requestMediaPickFromMediaLibrary,
	requestMediaPickFromDeviceLibrary,
	requestMediaPickFromDeviceCamera,
	mediaUploadSync,
	requestImageFailedRetryDialog,
	requestImageUploadCancelDialog,
} from 'react-native-gutenberg-bridge';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import Picker from '../../../../editor/src/components/mobile/picker/';

const MEDIA_UPLOAD_STATE_UPLOADING = 1;
const MEDIA_UPLOAD_STATE_SUCCEEDED = 2;
const MEDIA_UPLOAD_STATE_FAILED = 3;
const MEDIA_UPLOAD_STATE_RESET = 4;

const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_CHOOSE_FROM_DEVICE = 'choose_from_device';
const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO = 'take_photo';
const MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY = 'wordpress_media_library';

type MediaPayload = {
	mediaUrl: string,
	progress: number,
	mediaId: number,
	mediaServerId: ?number,
}

type PropsType = {
	onUpdateMediaProgress: ( payload: MediaPayload ) => void,
	onFinishMediaUploadWithSuccess: ( payload: MediaPayload ) => void,
	onFinishMediaUploadWithFailure: ( payload: MediaPayload ) => void,
	onMediaUploadStateReset:( payload: MediaPayload ) => void,
	onSelect: ( mediaId: number, mediaUrl: number ) => void,
};

type StateType = {
	mediaId: ?number,
};

class MediaUpload extends React.Component<PropsType, StateType> {

	constructor( props ) {
		super( props );

		this.state = {
			progress: 0,
			isUploadInProgress: false,
			isUploadFailed: false,
		};

		this.addMediaUploadListener = this.addMediaUploadListener.bind( this );
	}

	componentWillUnmount() {
		this.removeMediaUploadListener();
	}

	mediaUpload( payload: MediaPayload ) {
		const { attributes } = this.props;

		if ( payload.mediaId !== attributes.id ) {
			return;
		}

		switch ( payload.state ) {
			case MEDIA_UPLOAD_STATE_UPLOADING:
				this.props.onUpdateMediaProgress( payload );
				break;
			case MEDIA_UPLOAD_STATE_SUCCEEDED:
				this.removeMediaUploadListener();
				this.props.onFinishMediaUploadWithSuccess( payload );
				break;
			case MEDIA_UPLOAD_STATE_FAILED:
				this.props.onFinishMediaUploadWithFailure( payload );
				break;
			case MEDIA_UPLOAD_STATE_RESET:
				this.props.onMediaUploadStateReset( payload );
				break;
		}
	}

	addMediaUploadListener() {
		//if we already have a subscription not worth doing it again
		if ( this.subscriptionParentMediaUpload ) {
			return;
		}
		this.subscriptionParentMediaUpload = subscribeMediaUpload( ( payload ) => {
			this.mediaUpload( payload );
		} );
	}

	removeMediaUploadListener() {
		if ( this.subscriptionParentMediaUpload ) {
			this.subscriptionParentMediaUpload.remove();
		}
	}

	getMediaOptionsItems() {
		return [
			{ icon: 'format-image', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_CHOOSE_FROM_DEVICE, label: __( 'Choose from device' ) },
			{ icon: 'camera', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO, label: __( 'Take a Photo' ) },
			{ icon: 'wordpress-alt', value: MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY, label: __( 'WordPress Media Library' ) },
		];
	}

	render() {

		const onMediaLibraryButtonPressed = () => {
			requestMediaPickFromMediaLibrary( ( mediaId, mediaUrl ) => {
				if ( mediaUrl ) {
					this.props.onSelect( mediaId, mediaUrl );
					//setAttributes( { id: mediaId, url: mediaUrl } );
				}
			} );
		};

		const onMediaUploadButtonPressed = () => {
			requestMediaPickFromDeviceLibrary( ( mediaId, mediaUri ) => {
				if ( mediaUri ) {
					this.addMediaUploadListener();
					this.props.onSelect( mediaId, mediaUrl );
					//setAttributes( { url: mediaUri, id: mediaId } );
				}
			} );
		};

		const onMediaCaptureButtonPressed = () => {
			requestMediaPickFromDeviceCamera( ( mediaId, mediaUri ) => {
				if ( mediaUri ) {
					this.addMediaUploadListener();
					this.props.onSelect( mediaId, mediaUrl );
					//setAttributes( { url: mediaUri, id: mediaId } );
				}
			} );
		};

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
						onMediaUploadButtonPressed();
					} else if ( value === MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_TAKE_PHOTO ) {
						onMediaCaptureButtonPressed();
					} else if ( value === MEDIA_UPLOAD_BOTTOM_SHEET_VALUE_WORD_PRESS_LIBRARY ) {
						onMediaLibraryButtonPressed();
					}
				} }
			/>
		);

        return (
			<View style={ { flex: 1 } }>
				{ getMediaOptions() }
				{ this.props.render( { open: onPickerPresent } ) }
			</View>
		);

	}

}

export default MediaUpload;