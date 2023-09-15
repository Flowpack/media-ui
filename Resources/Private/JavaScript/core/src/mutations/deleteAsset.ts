import { gql } from '@apollo/client';

const DELETE_ASSET = gql`
    mutation DeleteAsset($id: AssetId!, $assetSourceId: AssetSourceId!) {
        deleteAsset(id: $id, assetSourceId: $assetSourceId) {
            success
            messages
        }
    }
`;

export default DELETE_ASSET;
