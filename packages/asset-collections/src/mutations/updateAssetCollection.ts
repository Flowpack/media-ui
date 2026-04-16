import { gql } from '@apollo/client';

export const UPDATE_ASSET_COLLECTION = gql`
    mutation UpdateAssetCollection(
        $id: AssetCollectionId!
        $assetSourceId: AssetSourceId!
        $title: AssetCollectionTitle
        $tagIds: [TagId!]
    ) {
        updateAssetCollection(id: $id, assetSourceId: $assetSourceId, title: $title, tagIds: $tagIds) {
            success
            messages
        }
    }
`;
