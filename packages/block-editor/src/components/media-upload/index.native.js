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
import { isURL } from '@wordpress/url';

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
	onSelect: ( mediaId: number, mediaUrl: string ) => void,
	innerRef: ( ref: MediaUpload ) => void,
	mediaId: number,
	mediaUrl: ?string,
};

type StateType = {
	id: number,
	url: ?string,
};

class MediaUpload extends React.Component<PropsType, StateType> {

	constructor( props ) {
		super( props );

		this.state = {
			id: props.mediaId,
			url: props.mediaUrl,
			progress: 0,
			isUploadInProgress: false,
			isUploadFailed: false,	
		};

		this.mediaUpload = this.mediaUpload.bind( this );
	}

	componentDidMount() {
		this.addMediaUploadListener();
		if ( this.state.id !== this.props.mediaId ) {
			this.setState( { id: this.props.mediaId, url: this.props.mediaUrl } );
		}
		if ( this.props.innerRef ) {
			this.props.innerRef( this );
		}

		const { id, url } = this.state;

		if ( id && ! isURL( url ) ) {
			mediaUploadSync();
		}
	}

	componentWillUnmount() {
		this.removeMediaUploadListener();
	}

	/*static getDerivedStateFromProps( props, state ) {
		return { ...state, id: props.mediaId, url: props.mediaUrl };
	}
*/
	mediaUpload( payload: MediaPayload ) {
		const { id } = this.state;

		if ( payload.mediaId !== id )  {
			return;
		}

		switch ( payload.state ) {
			case MEDIA_UPLOAD_STATE_UPLOADING:
				console.log("MEDIA_UPLOAD_STATE_UPLOADING");
				this.updateMediaProgress( payload );
				break;
			case MEDIA_UPLOAD_STATE_SUCCEEDED:
				console.log("MEDIA_UPLOAD_STATE_SUCCEEDED");
				this.finishMediaUploadWithSuccess( payload );
				break;
			case MEDIA_UPLOAD_STATE_FAILED:
				console.log("MEDIA_UPLOAD_STATE_FAILED");
				this.finishMediaUploadWithFailure( payload );
				break;
			case MEDIA_UPLOAD_STATE_RESET:
				console.log("MEDIA_UPLOAD_STATE_RESET");
				this.mediaUploadStateReset( payload );
				break;
		}
	}

	requestImageUploadCancelDialog( mediaId ) {
		requestImageUploadCancelDialog( mediaId );
	} 

	requestImageFailedRetryDialog( mediaId ) {
		requestImageFailedRetryDialog( mediaId );
	}

	updateMediaProgress( payload ) {
		if ( payload.mediaUrl ) {
			this.setState( { url: payload.mediaUrl } );
		}
		this.props.onUpdateMediaProgress( payload );
	}

	finishMediaUploadWithSuccess( payload ) {
		this.setState( { id: payload.mediaServerId } );
		this.props.onFinishMediaUploadWithSuccess( payload );
	}

	finishMediaUploadWithFailure( payload ) {
		this.setState( { id: payload.mediaId } );
		this.props.onFinishMediaUploadWithFailure( payload );
	}

	mediaUploadStateReset( payload ) {
		this.setState( { url: null, id: payload.mediaId } );
		this.props.onMediaUploadStateReset( payload );
	}

	addMediaUploadListener() {
		console.log("addMediaUploadListener");
		this.subscriptionParentMediaUpload = subscribeMediaUpload( ( payload ) => {
			this.mediaUpload( payload );
		} );
	}

	removeMediaUploadListener() {
		if ( this.subscriptionParentMediaUpload ) {
			console.log("removeMediaUploadListener");
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
					this.setState( { id: mediaId, url: mediaUrl } );
					this.props.onSelect( mediaId, mediaUrl );
				}
			} );
		};

		const onMediaUploadButtonPressed = () => {
			requestMediaPickFromDeviceLibrary( ( mediaId, mediaUrl ) => {
				if ( mediaUrl ) {
					this.setState( { url: mediaUrl, id: mediaId } );
					this.props.onSelect( mediaId, mediaUrl );
				}
			} );
		};

		const onMediaCaptureButtonPressed = () => {
			requestMediaPickFromDeviceCamera( ( mediaId, mediaUrl ) => {
				if ( mediaUrl ) {
					this.setState( { url: mediaUrl, id: mediaId } );
					this.props.onSelect( mediaId, mediaUrl );
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
        return this.props.render( { open: onPickerPresent, getMediaOptions: getMediaOptions } );
	}
}

export default MediaUpload;