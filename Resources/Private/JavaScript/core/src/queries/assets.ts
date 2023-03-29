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
        $sortBy: SortBy
        $sortDirection: SortDirection
        $includeUsage: Boolean = false
    ) {
        includeUsage @client(always: true) @export(as: "includeUsage")
        assets(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollectionId: $assetCollectionId
            mediaType: $mediaType
            tagId: $tagId
            limit: $limit
            offset: $offset
            sortBy: $sortBy
            sortDirection: $sortDirection
        ) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default ASSETS;
