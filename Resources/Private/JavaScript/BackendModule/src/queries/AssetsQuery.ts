import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from './Fragments';

export const ASSETS = gql`
    query ASSETS(
        $searchTerm: String
        $assetSourceId: AssetSourceId
        $assetCollectionId: AssetCollectionId
        $mediaType: MediaType
        $tagId: TagId
        $limit: Int
        $offset: Int
    ) {
        selectedAssetSourceId @client(always: true) @export(as: "assetSourceId")
        assets(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollectionId: $assetCollectionId
            mediaType: $mediaType
            tagId: $tagId
            limit: $limit
            offset: $offset
        ) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;
