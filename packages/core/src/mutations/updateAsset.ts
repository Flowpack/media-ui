import { gql } from '@apollo/client';

const UPDATE_ASSET = gql`
    mutation UpdateAsset(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $label: String
        $caption: String
        $copyrightNotice: String
    ) {
        updateAsset(
            id: $id
            assetSourceId: $assetSourceId
            label: $label
            caption: $caption
            copyrightNotice: $copyrightNotice
        ) {
            success
            messages
        }
    }
`;

export default UPDATE_ASSET;
