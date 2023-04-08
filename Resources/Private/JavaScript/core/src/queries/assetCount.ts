import { gql } from '@apollo/client';

const ASSET_COUNT = gql`
    query ASSET_COUNT(
        $searchTerm: String
        $assetSourceId: AssetSourceId
        $assetCollectionId: AssetCollectionId
        $mediaType: MediaType
        $assetType: AssetType
        $tagId: TagId
    ) {
        assetCount(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollectionId: $assetCollectionId
            mediaType: $mediaType
            assetType: $assetType
            tagId: $tagId
        )
    }
`;

export default ASSET_COUNT;
