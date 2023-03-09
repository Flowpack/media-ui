import { gql } from '@apollo/client';

const DELETE_ASSET_COLLECTION = gql`
    mutation DeleteAssetCollection($id: AssetCollectionId!) {
        deleteAssetCollection(id: $id) {
            success
        }
    }
`;

export default DELETE_ASSET_COLLECTION;
