/**
 * Node dependencies
 */
const { camelCase, kebabCase, nth, upperFirst } = require( 'lodash' );

const fs = require( 'fs' );

const baseURL = `..`;

/**
 * Generates the package manifest.
 *
 * @param {Array} packageFolderNames Package folder names.
 *
 * @return {Array} Manifest
 */
function getPackageManifest( packageFolderNames ) {
	return packageFolderNames.map( ( folderName ) => {
		return {
			title: `@wordpress/${ folderName }`,
			slug: `packages-${ folderName }`,
			markdown_source: `${ baseURL }/packages/${ folderName }/README.md`,
			parent: 'packages',
		};
	} );
}

/**
 * Generates the components manifest.
 *
 * @param {Array} componentPaths Paths for all components
 *
 * @return {Array} Manifest
 */
function getComponentManifest( componentPaths ) {
	return componentPaths.map( ( filePath ) => {
		const slug = nth( filePath.split( '/' ), -2 );
		return {
			title: upperFirst( camelCase( slug ) ),
			slug,
			markdown_source: `${ baseURL }/${ filePath }`,
			parent: 'components',
		};
	} );
}

/**
 * Generates the data manifest.
 *
 * @param {Object} parsedNamespaces Parsed Namespace Object
 *
 * @return {Array} Manifest
 */
function getDataManifest( parsedNamespaces ) {
	return Object.values( parsedNamespaces ).map( ( parsedNamespace ) => {
		const slug = `data-${ kebabCase( parsedNamespace.name ) }`;
		return {
			title: parsedNamespace.title,
			slug,
			markdown_source: `${ baseURL }/docs/designers-developers/developers/data/${ slug }.md`,
			parent: 'data',
		};
	} );
}

function getRootManifest( tocFileName ) {
	return generateRootManifestFromTOCItems( require( tocFileName ) );
}

function generateRootManifestFromTOCItems( items, parent = null ) {
	let pageItems = [];
	items.forEach( ( obj ) => {
		const fileName = Object.keys( obj )[ 0 ];
		const children = obj[ fileName ];

		let slug = nth( fileName.split( '/' ), -1 ).replace( '.md', '' );
		if ( 'readme' === slug.toLowerCase() ) {
			slug = nth( fileName.split( '/' ), -2 );

			// Special case - the root 'docs' readme needs the 'handbook' slug.
			if ( parent === null && 'docs' === slug ) {
				slug = 'handbook';
			}
		}
		let title = upperFirst( camelCase( slug ) );
		const markdownSource = fs.readFileSync( fileName, 'utf8' );
		const titleMarkdown = markdownSource.match( /^#\s(.+)$/m );
		if ( titleMarkdown ) {
			title = titleMarkdown[ 1 ];
		}

		pageItems.push( {
			title,
			slug,
			markdown_source: `${ baseURL }\/${ fileName }`,
			parent,
		} );
		if ( Array.isArray( children ) && children.length ) {
			pageItems = pageItems.concat( generateRootManifestFromTOCItems( children, slug ) );
		}
	} );
	return pageItems;
}

module.exports = {
	getPackageManifest,
	getComponentManifest,
	getDataManifest,
	getRootManifest,
};
