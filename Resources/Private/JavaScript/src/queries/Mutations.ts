import { gql } from 'apollo-boost';

import { ASSET_FRAGMENT } from './Fragments';

export const UPDATE_ASSET = gql`
    mutation UpdateAsset($id: AssetId!, $assetSource: AssetSourceId!, $label: String, $caption: String) {
        updateAsset(id: $id, assetSource: $assetSource, label: $label, caption: $caption) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;
