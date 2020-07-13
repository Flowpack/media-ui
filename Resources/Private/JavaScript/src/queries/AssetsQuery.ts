import gql from 'graphql-tag';

import { ASSET_FRAGMENT } from './Fragments';

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
        selectedAssetSourceId @client(always: true) @export(as: "assetSourceId")
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
    }
    ${ASSET_FRAGMENT}
`;
