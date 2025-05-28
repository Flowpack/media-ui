import { gql } from '@apollo/client';

const EDIT_ASSET = gql`
    mutation EditAsset(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $filename: Filename!
        $options: AssetEditOptionsInput!
    ) {
        editAsset(id: $id, assetSourceId: $assetSourceId, filename: $filename, options: $options) {
            success
            messages
        }
    }
`;

export default EDIT_ASSET;
