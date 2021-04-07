import { gql } from '@apollo/client';

export const ASSET_SOURCE_FRAGMENT = gql`
    fragment AssetSourceProps on AssetSource {
        label
        id
        description
        iconUri
        readOnly
        supportsTagging
        supportsCollections
    }
`;

export const TAG_FRAGMENT = gql`
    fragment TagProps on Tag {
        id
        label
        parent {
            label
        }
        children {
            label
        }
    }
`;

export const FILE_FRAGMENT = gql`
    fragment FileProps on File {
        extension
        mediaType
        typeIcon {
            url
            alt
        }
        size
        url
    }
`;

export const IPTC_PROPERTY_FRAGMENT = gql`
    fragment IptcPropertyProps on IptcProperty {
        propertyName
        value
    }
`;

export const ASSET_COLLECTION_FRAGMENT = gql`
    fragment AssetCollectionProps on AssetCollection {
        id
        title
        tags {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export const ASSET_FRAGMENT = gql`
    fragment AssetProps on Asset {
        id
        localId
        assetSource {
            ...AssetSourceProps
        }
        imported
        label
        caption
        filename
        tags {
            ...TagProps
        }
        collections {
            id
            title
        }
        copyrightNotice
        lastModified
        iptcProperties {
            ...IptcPropertyProps
        }
        width
        height
        file {
            ...FileProps
        }
        thumbnailUrl
        previewUrl
        isInClipboard @client
    }
    ${ASSET_SOURCE_FRAGMENT}
    ${IPTC_PROPERTY_FRAGMENT}
    ${FILE_FRAGMENT}
    ${TAG_FRAGMENT}
`;
