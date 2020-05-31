import { gql } from 'apollo-boost';

import { ASSET_FRAGMENT, ASSET_COLLECTION_FRAGMENT, ASSET_SOURCE_FRAGMENT, TAG_FRAGMENT } from './Fragments';

// TODO: Split this big query into individual reusable pieces including the matching interfaces
export const ASSETS = gql`
    query ASSETS(
        $searchTerm: String
        $assetSourceId: AssetSourceId
        $assetCollectionId: AssetCollectionId
        $mediaType: MediaType
        $tag: TagLabel
        $limit: Int
        $offset: Int
    ) {
        assetSourceFilter @client(always: true) @export(as: "assetSource")
        assets(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollectionId: $assetCollectionId
            mediaType: $mediaType
            tag: $tag
            limit: $limit
            offset: $offset
        ) {
            ...AssetProps
        }
        assetCollections {
            ...AssetCollectionProps
        }
        assetSources {
            ...AssetSourceProps
        }
        assetCount(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollectionId: $assetCollectionId
            mediaType: $mediaType
            tag: $tag
        )
        tags {
            ...TagProps
        }
    }
    ${ASSET_FRAGMENT}
    ${ASSET_COLLECTION_FRAGMENT}
    ${ASSET_SOURCE_FRAGMENT}
    ${TAG_FRAGMENT}
`;
