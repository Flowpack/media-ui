import { gql } from 'apollo-boost';

import { Fragments } from './Fragments';

export const UPDATE_ASSET = gql`
    mutation UpdateAsset($id: AssetId!, $assetSource: AssetSourceId!, $title: String, $caption: String) {
        updateAsset(id: $id, assetSource: $assetSource, title: $title, caption: $caption) {
            ...AssetProxyProps
        }
    }
    ${Fragments.assetProxy}
`;
