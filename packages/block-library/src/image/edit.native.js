/**
 * External dependencies
 */
import React from 'react';
import { View, ImageBackground, TextInput, Text, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies
 */
import {
	Toolbar,
	ToolbarButton,
	Spinner,
	Dashicon,
} from '@wordpress/components';
import {
	MediaPlaceholder,
	MediaUpload,
	RichText,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	BottomSheet,
	Picker,
} from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { isURL } from '@wordpress/url';
import { doAction, hasAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import ImageSize from './image-size';
import styles from './styles.scss';

const LINK_DESTINATION_CUSTOM = 'custom';
const LINK_DESTINATION_NONE = 'none';

class ImageEdit extends React.Component {
	mediaUploadRef: MediaUpload;

	constructor( props ) {
		super( props );

		this.state = {
			showSettings: false,
			progress: 0,
			isUploadInProgress: false,
			isUploadFailed: false,
		};

		this.finishMediaUploadWithSuccess = this.finishMediaUploadWithSuccess.bind( this );
		this.finishMediaUploadWithFailure = this.finishMediaUploadWithFailure.bind( this );
		this.updateMediaProgress = this.updateMediaProgress.bind( this );
		this.mediaUploadStateReset = this.mediaUploadStateReset.bind( this );
		this.updateAlt = this.updateAlt.bind( this );
		this.updateImageURL = this.updateImageURL.bind( this );
		this.onSetLinkDestination = this.onSetLinkDestination.bind( this );
		this.onImagePressed = this.onImagePressed.bind( this );
		this.onClearSettings = this.onClearSettings.bind( this );
		this.mediaUploadInnerRef = this.mediaUploadInnerRef.bind( this );
		this.onImageSelect = this.onImageSelect.bind( this );
	}

	componentWillUnmount() {
		// this action will only exist if the user pressed the trash button on the block holder
		if ( hasAction( 'blocks.onRemoveBlockCheckUpload' ) && this.state.isUploadInProgress ) {
			doAction( 'blocks.onRemoveBlockCheckUpload', this.props.attributes.id );
		}
	}

	onImagePressed() {
		const { attributes } = this.props;

		if ( this.state.isUploadInProgress ) {
			this.mediaUploadRef.requestImageUploadCancelDialog( attributes.id );
		} else if ( attributes.id && ! isURL( attributes.url ) ) {
			this.mediaUploadRef.requestImageFailedRetryDialog( attributes.id );
		}
	}

	updateMediaProgress( payload ) {
		const { setAttributes } = this.props;
		this.setState( { progress: payload.progress, isUploadInProgress: true, isUploadFailed: false } );
		if ( payload.mediaUrl ) {
			setAttributes( { url: payload.mediaUrl } );
		}
	}

	finishMediaUploadWithSuccess( payload ) {
		const { setAttributes } = this.props;
		setAttributes( { url: payload.mediaUrl, id: payload.mediaServerId } );
		this.setState( { isUploadInProgress: false } );
	}

	finishMediaUploadWithFailure( payload ) {
		const { setAttributes } = this.props;
		setAttributes( { id: payload.mediaId } );
		this.setState( { isUploadInProgress: false, isUploadFailed: true } );
	}

	mediaUploadStateReset( payload ) {
		const { setAttributes } = this.props;
		setAttributes( { id: payload.mediaId, url: null } );
		this.setState( { isUploadInProgress: false, isUploadFailed: false } );
	}

	mediaUploadInnerRef( ref ) {
		this.mediaUploadRef = ref;
	}

	updateAlt( newAlt ) {
		this.props.setAttributes( { alt: newAlt } );
	}

	updateImageURL( url ) {
		this.props.setAttributes( { url, width: undefined, height: undefined } );
	}

	onSetLinkDestination( href ) {
		this.props.setAttributes( {
			linkDestination: LINK_DESTINATION_CUSTOM,
			href,
		} );
	}

	onClearSettings() {
		this.props.setAttributes( {
			alt: '',
			linkDestination: LINK_DESTINATION_NONE,
			href: undefined,
		} );
	}

	renderWithMediaUpload(render: () => React.Node ) {
		const { attributes } = this.props;
		return (
			 <MediaUpload
				innerRef={ this.mediaUploadInnerRef }
				mediaId={ attributes.id }
				mediaUrl={ attributes.url }
				onUpdateMediaProgress={ this.updateMediaProgress }
				onFinishMediaUploadWithSuccess={ this.finishMediaUploadWithSuccess }
				onFinishMediaUploadWithFailure={ this.finishMediaUploadWithFailure }
				onMediaUploadStateReset={ this.mediaUploadStateReset }
				onSelect={ this.onImageSelect }
				render={ render }
			/>
		);
	}

	onImageSelect( mediaId: number, mediaUrl: number ) {
		const { setAttributes } = this.props;
		setAttributes( { url: mediaUrl, id: mediaId } );
	} 

	render() {
		const { attributes, isSelected, setAttributes } = this.props;
		const { url, caption, height, width, alt, href } = attributes;

		const onImageSettingsButtonPressed = () => {
			this.setState( { showSettings: true } );
		};

		const onImageSettingsClose = () => {
			this.setState( { showSettings: false } );
		};

		let picker;

		const onMediaOptionsButtonPressed = () => {
			picker.presentPicker();
		};

		const toolbarEditButton = this.renderWithMediaUpload( 
			( { open, getMediaOptions } ) => (
				<Toolbar>
					<ToolbarButton
						label={ __( 'Edit image' ) }
						icon="edit"
						onClick={ open }
					/>
					{ getMediaOptions() }
				</Toolbar>
			)
		);

		const getInspectorControls = () => (
			<BottomSheet
				isVisible={ this.state.showSettings }
				onClose={ onImageSettingsClose }
				hideHeader
			>
				<BottomSheet.Cell
					icon={ 'admin-links' }
					label={ __( 'Link To' ) }
					value={ href || '' }
					valuePlaceholder={ __( 'Add URL' ) }
					onChangeValue={ this.onSetLinkDestination }
					autoCapitalize="none"
					autoCorrect={ false }
				/>
				<BottomSheet.Cell
					icon={ 'editor-textcolor' }
					label={ __( 'Alt Text' ) }
					value={ alt || '' }
					valuePlaceholder={ __( 'None' ) }
					separatorType={ 'fullWidth' }
					onChangeValue={ this.updateAlt }
				/>
				<BottomSheet.Cell
					label={ __( 'Clear All Settings' ) }
					labelStyle={ styles.clearSettingsButton }
					separatorType={ 'none' }
					onPress={ this.onClearSettings }
				/>
			</BottomSheet>
		);
						
		if ( ! url ) {
			return this.renderWithMediaUpload( ( { open, getMediaOptions } ) => (
				<View style={ { flex: 1 } } >
					<MediaPlaceholder
						onMediaOptionsPressed={ open }
					/>
					{ getMediaOptions() }
				</View>
			) );
		}

		const showSpinner = this.state.isUploadInProgress;
		const opacity = this.state.isUploadInProgress ? 0.3 : 1;
		const progress = this.state.progress * 100;

		return (
			<TouchableWithoutFeedback onPress={ this.onImagePressed } disabled={ ! isSelected }>
				<View style={ { flex: 1 } }>
					{ this.renderWithMediaUpload( () => () ) }
					{ showSpinner && <Spinner progress={ progress } /> }
					<BlockControls>
						{ toolbarEditButton }
					</BlockControls>
					<InspectorControls>
						<ToolbarButton
							label={ __( 'Image Settings' ) }
							icon="admin-generic"
							onClick={ onImageSettingsButtonPressed }
						/>
					</InspectorControls>
					<ImageSize src={ url } >
						{ ( sizes ) => {
							const {
								imageWidthWithinContainer,
								imageHeightWithinContainer,
							} = sizes;

							let finalHeight = imageHeightWithinContainer;
							if ( height > 0 && height < imageHeightWithinContainer ) {
								finalHeight = height;
							}

							let finalWidth = imageWidthWithinContainer;
							if ( width > 0 && width < imageWidthWithinContainer ) {
								finalWidth = width;
							}

							return (
								<View style={ { flex: 1 } } >
									{ getInspectorControls() }
									{ ! imageWidthWithinContainer && <View style={ styles.imageContainer } >
										<Dashicon icon={ 'format-image' } size={ 300 } />
									</View> }
									<ImageBackground
										style={ { width: finalWidth, height: finalHeight, opacity } }
										resizeMethod="scale"
										source={ { uri: url } }
										key={ url }
									>
										{ this.state.isUploadFailed &&
											<View style={ styles.imageContainer } >
												<Dashicon icon={ 'image-rotate' } ariaPressed={ 'dashicon-active' } />
												<Text style={ styles.uploadFailedText }>{ __( 'Failed to insert media.\nPlease tap for options.' ) }</Text>
											</View>
										}
									</ImageBackground>
								</View>
							);
						} }
					</ImageSize>
					{ ( ! RichText.isEmpty( caption ) > 0 || isSelected ) && (
						<View style={ { padding: 12, flex: 1 } }>
							<TextInput
								style={ { textAlign: 'center' } }
								fontFamily={ this.props.fontFamily || ( styles[ 'caption-text' ].fontFamily ) }
								underlineColorAndroid="transparent"
								value={ caption }
								placeholder={ __( 'Write caption…' ) }
								onChangeText={ ( newCaption ) => setAttributes( { caption: newCaption } ) }
							/>
						</View>
					) }
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

export default ImageEdit;
