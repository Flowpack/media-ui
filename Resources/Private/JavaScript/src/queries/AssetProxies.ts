import { gql } from 'apollo-boost';

// TODO: Split this big query into individual reusable pieces including the matching interfaces
export const ASSET_PROXIES = gql`
    query ASSET_PROXIES(
        $assetSource: String
        $assetCollection: String
        $assetType: String
        $tag: String
        $limit: Int
        $offset: Int
    ) {
        assetSourceFilter @client(always: true) @export(as: "assetSource")
        assetProxies(
            assetSource: $assetSource
            assetCollection: $assetCollection
            assetType: $assetType
            tag: $tag
            limit: $limit
            offset: $offset
        ) {
            identifier
            label
            mediaType
            filename
            fileTypeIcon {
                src
                alt
            }
            thumbnailUri
            previewUri
            iptcMetadata {
                key
                value
            }
            localAssetIdentifier
            localAssetData {
                identifier
                label
                title
                caption
                copyrightNotice
                tags {
                    label
                }
                assetCollections {
                    title
                }
            }
        }
        assetCollections {
            title
            tags {
                label
            }
        }
        assetSources {
            label
            identifier
            readOnly
            supportsTagging
            supportsCollections
        }
        assetCount(assetSource: $assetSource, assetCollection: $assetCollection, assetType: $assetType, tag: $tag)
        assetTypes {
            label
        }
        tags {
            label
        }
    }
`;
