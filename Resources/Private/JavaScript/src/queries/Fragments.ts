import { gql } from 'apollo-boost';

export const Fragments = {
    assetProxy: gql`
        fragment AssetProxyProps on AssetProxy {
            id
            assetSource {
                ...AssetSourceProps
            }

            label
            caption
            filename

            imported
            mediaType
            fileSize
            fileTypeIcon {
                src
                alt
            }
            lastModified
            widthInPixels
            heightInPixels
            thumbnailUri
            previewUri
            iptcMetadata {
                key
                value
            }
            localAssetData {
                identifier
                label
                title
                caption
                copyrightNotice
                tags {
                    ...TagProps
                }
                assetCollections {
                    title
                }
            }
        }
        fragment AssetSourceProps on AssetSource {
            label
            id
            description
            iconUri
            readOnly
            supportsTagging
            supportsCollections
        }
        fragment TagProps on Tag {
            label
        }
    `
};
