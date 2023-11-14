import { gql } from '@apollo/client';

const REPLACE_ASSET = gql`
    mutation ReplaceAsset(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $file: Upload!
        $options: AssetReplacementOptionsInput!
        $uploadProperties: UploadProperties
    ) {
        replaceAsset(
            id: $id
            assetSourceId: $assetSourceId
            file: $file
            options: $options
            uploadProperties: $uploadProperties
        ) {
            filename
            success
            result
            assetId
        }
    }
`;

export default REPLACE_ASSET;
