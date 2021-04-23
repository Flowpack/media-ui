import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const UPDATE_ASSET = gql`
    mutation UpdateAsset(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $label: String
        $caption: String
        $copyrightNotice: String
        $includeUsage: Boolean = false
    ) {
        includeUsage @client(always: true) @export(as: "includeUsage")
        updateAsset(
            id: $id
            assetSourceId: $assetSourceId
            label: $label
            caption: $caption
            copyrightNotice: $copyrightNotice
        ) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default UPDATE_ASSET;
