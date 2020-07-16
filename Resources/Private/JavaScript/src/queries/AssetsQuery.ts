import gql from 'graphql-tag';

import { ASSET_FRAGMENT } from './Fragments';

export const ASSETS = gql`
    query ASSETS(
        $searchTerm: String
        $assetSourceId: AssetSourceId
        $assetCollection: AssetCollectionTitle
        $mediaType: MediaType
        $tag: TagLabel
        $limit: Int
        $offset: Int
    ) {
        selectedAssetSourceId @client(always: true) @export(as: "assetSourceId")
        assets(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollection: $assetCollection
            mediaType: $mediaType
            tag: $tag
            limit: $limit
            offset: $offset
        ) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;
