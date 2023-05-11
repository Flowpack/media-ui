import { gql } from '@apollo/client';

export const DELETE_ASSET_COLLECTION = gql`
    mutation DeleteAssetCollection($id: AssetCollectionId!) {
        deleteAssetCollection(id: $id)
    }
`;
