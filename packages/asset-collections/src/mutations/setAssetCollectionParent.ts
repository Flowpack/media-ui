import { gql } from '@apollo/client';

export const SET_ASSET_COLLECTION_PARENT = gql`
    mutation SetAssetCollectionParent($id: AssetCollectionId!, $parent: AssetCollectionId) {
        setAssetCollectionParent(id: $id, parent: $parent) {
            success
            messages
        }
    }
`;
