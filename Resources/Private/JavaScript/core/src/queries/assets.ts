import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const ASSETS = gql`
    query ASSETS(
        $searchTerm: String
        $assetSourceId: AssetSourceId
        $assetCollectionId: AssetCollectionId
        $mediaType: MediaType
        $tagId: TagId
        $limit: Int
        $offset: Int
        $includeUsage: Boolean = false
    ) {
        selectedAssetSourceId @client(always: true) @export(as: "assetSourceId")
        includeUsage @client @export(as: "includeUsage")
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

export default ASSETS;
