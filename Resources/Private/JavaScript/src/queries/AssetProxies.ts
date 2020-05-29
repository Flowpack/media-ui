import { gql } from 'apollo-boost';

import { Fragments } from './Fragments';

// TODO: Split this big query into individual reusable pieces including the matching interfaces
export const ASSET_PROXIES = gql`
    query ASSET_PROXIES(
        $searchTerm: String
        $assetSource: AssetSourceId
        $assetCollection: String
        $assetType: String
        $tag: String
        $limit: Int
        $offset: Int
    ) {
        assetSourceFilter @client(always: true) @export(as: "assetSource")
        assetProxies(
            searchTerm: $searchTerm
            assetSource: $assetSource
            assetCollection: $assetCollection
            assetType: $assetType
            tag: $tag
            limit: $limit
            offset: $offset
        ) {
            ...AssetProxyProps
        }
        assetCollections {
            title
            tags {
                ...TagProps
            }
        }
        assetSources {
            ...AssetSourceProps
        }
        assetCount(
            searchTerm: $searchTerm
            assetSource: $assetSource
            assetCollection: $assetCollection
            assetType: $assetType
            tag: $tag
        )
        assetTypes {
            label
        }
        tags {
            ...TagProps
        }
    }
    ${Fragments.assetProxy}
`;
