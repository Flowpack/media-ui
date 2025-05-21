import { gql } from '@apollo/client';

const REPLACE_ASSET = gql`
    mutation ReplaceAsset(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $file: UploadedFileInput!
        $options: AssetReplacementOptionsInput!
    ) {
        replaceAsset(id: $id, assetSourceId: $assetSourceId, file: $file, options: $options) {
            filename
            success
            result
        }
    }
`;

export default REPLACE_ASSET;
