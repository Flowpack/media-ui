import { gql } from '@apollo/client';

export const SET_ASSET_COLLECTION_PARENT = gql`
    mutation SetAssetCollectionParent(
        $id: AssetCollectionId!
        $assetSourceId: AssetSourceId!
        $parent: AssetCollectionId
    ) {
        setAssetCollectionParent(id: $id, assetSourceId: $assetSourceId, parent: $parent) {
            success
            messages
        }
    }
`;
