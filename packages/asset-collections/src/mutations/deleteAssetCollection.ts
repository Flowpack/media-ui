import { gql } from '@apollo/client';

export const DELETE_ASSET_COLLECTION = gql`
    mutation DeleteAssetCollection($id: AssetCollectionId!, $assetSourceId: AssetSourceId!) {
        deleteAssetCollection(id: $id, assetSourceId: $assetSourceId) {
            success
            messages
        }
    }
`;
